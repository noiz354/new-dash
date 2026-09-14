/**
 * Unit tests — pure domain logic, no database.
 * Run: npm test  (node --import tsx --test)
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { base32Decode, base32Encode, totpAt, verifyTotp } from '../lib/auth/totp';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { can, ROLE_PERMISSIONS } from '../lib/auth/rbac';
import { rateLimit } from '../lib/auth/limits';
import {
  SLA_WINDOW_MS, isTerminal, slaLabel, validateTransition,
} from '../lib/domain/work-orders';
import { requestHash } from '../lib/services/idempotency';

// ---------------------------------------------------------------------------
// TOTP (RFC 6238)
// ---------------------------------------------------------------------------
test('totp: RFC 6238 test vectors (SHA1, last 6 of the 8-digit RFC values)', () => {
  // Secret = base32("12345678901234567890") per RFC 6238 appendix B.
  // RFC 8-digit values: 94287082 / 07081804 / 14050471 / 89005924 / 69279037.
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  assert.equal(totpAt(secret, 59), '287082');
  assert.equal(totpAt(secret, 1111111109), '081804');
  assert.equal(totpAt(secret, 1111111111), '050471');
  assert.equal(totpAt(secret, 1234567890), '005924');
  assert.equal(totpAt(secret, 2000000000), '279037');
});

test('totp: verifyTotp accepts ±1 step window, rejects wrong codes', () => {
  const secret = 'JBSWY3DPEHPK3PXP'; // canon dev secret
  const now = Math.floor(Date.now() / 1000);
  assert.ok(verifyTotp(secret, totpAt(secret, now)));
  assert.ok(verifyTotp(secret, totpAt(secret, now - 30)), 'previous step accepted');
  assert.ok(verifyTotp(secret, totpAt(secret, now + 30)), 'next step accepted');
  assert.ok(!verifyTotp(secret, '000000') || totpAt(secret, now) === '000000');
  assert.ok(!verifyTotp(secret, 'abcdef'));
  assert.ok(!verifyTotp(secret, ''));
});

test('totp: base32 round-trip', () => {
  const buf = Buffer.from('apex-ops-canon-4821', 'utf8');
  assert.deepEqual(base32Decode(base32Encode(buf)), buf);
});

// ---------------------------------------------------------------------------
// Password hashing (scrypt)
// ---------------------------------------------------------------------------
test('password: hash/verify round-trip, rejects wrong password', async () => {
  const hash = await hashPassword('demo-pass-4821');
  assert.match(hash, /^scrypt\$16384\$8\$1\$[^$]+\$[^$]+$/);
  assert.ok(await verifyPassword('demo-pass-4821', hash));
  assert.ok(!(await verifyPassword('wrong-password', hash)));
  assert.ok(!(await verifyPassword('demo-pass-4821', 'garbage$format')));
});

test('password: distinct salts produce distinct hashes', async () => {
  const a = await hashPassword('same-input');
  const b = await hashPassword('same-input');
  assert.notEqual(a, b);
  assert.ok(await verifyPassword('same-input', b));
});

// ---------------------------------------------------------------------------
// RBAC
// ---------------------------------------------------------------------------
test('rbac: Enterprise Admin has wildcard', () => {
  assert.ok(can('Enterprise Admin', 'org.manage'));
  assert.ok(can('Enterprise Admin', 'wo.transition'));
  assert.deepEqual(ROLE_PERMISSIONS['Enterprise Admin'], ['*']);
});

test('rbac: field techs can work orders but not org settings', () => {
  assert.ok(can('Senior Field Tech', 'wo.read'));
  assert.ok(can('Senior Field Tech', 'wo.transition'));
  assert.ok(!can('Senior Field Tech', 'org.manage'));
  assert.ok(!can('Senior Field Tech', 'po.approve'));
  assert.ok(!can('Senior Field Tech', 'settings.manage'));
});

test('rbac: unknown role fails closed', () => {
  assert.ok(!can('Ghost Role' as never, 'wo.read'));
});

// ---------------------------------------------------------------------------
// Rate limiting (sliding window, in-memory)
// ---------------------------------------------------------------------------
test('limits: blocks after max hits within window, independent keys', () => {
  const key = `test:${Date.now()}`;
  for (let i = 0; i < 3; i++) assert.equal(rateLimit(key, 3, 60_000).ok, true);
  const blocked = rateLimit(key, 3, 60_000);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterSec > 0 && blocked.retryAfterSec <= 60);
  assert.equal(rateLimit(`${key}:other`, 3, 60_000).ok, true);
});

test('limits: window expiry resets the counter', async () => {
  const key = `test-exp:${Date.now()}`;
  assert.equal(rateLimit(key, 1, 40).ok, true);
  assert.equal(rateLimit(key, 1, 40).ok, false);
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(rateLimit(key, 1, 40).ok, true);
});

// ---------------------------------------------------------------------------
// Work-order state machine
// ---------------------------------------------------------------------------
test('wo: valid transitions per rules', () => {
  assert.deepEqual(validateTransition('OPEN', 'hold', 'x'), { ok: true, to: 'ON_HOLD' });
  assert.deepEqual(validateTransition('IN_PROGRESS', 'hold', 'x'), { ok: true, to: 'ON_HOLD' });
  assert.deepEqual(validateTransition('IN_PROGRESS', 'escalate', 'x'), { ok: true, to: 'ESCALATED' });
  assert.deepEqual(validateTransition('ON_HOLD', 'resume'), { ok: true, to: 'IN_PROGRESS' });
  assert.deepEqual(validateTransition('ESCALATED', 'resume'), { ok: true, to: 'IN_PROGRESS' });
  assert.deepEqual(validateTransition('IN_PROGRESS', 'complete'), { ok: true, to: 'COMPLETED' });
  assert.deepEqual(validateTransition('OPEN', 'cancel', 'x'), { ok: true, to: 'CANCELLED' });
  assert.deepEqual(validateTransition('OPEN', 'assign'), { ok: true, to: null });
});

test('wo: invalid transitions rejected with codes', () => {
  const done = validateTransition('COMPLETED', 'hold', 'x');
  assert.equal(done.ok, false);
  if (!done.ok) assert.equal(done.code, 'WO_INVALID_TRANSITION');

  const noReason = validateTransition('IN_PROGRESS', 'hold');
  assert.equal(noReason.ok, false);
  if (!noReason.ok) assert.equal(noReason.code, 'WO_REASON_REQUIRED');

  const blankReason = validateTransition('IN_PROGRESS', 'hold', '   ');
  assert.equal(blankReason.ok, false);

  const earlyComplete = validateTransition('ON_HOLD', 'complete');
  assert.equal(earlyComplete.ok, false);
  if (!earlyComplete.ok) assert.equal(earlyComplete.code, 'WO_INVALID_TRANSITION');

  const unknown = validateTransition('OPEN', 'teleport' as never);
  assert.equal(unknown.ok, false);
  if (!unknown.ok) assert.equal(unknown.code, 'WO_UNKNOWN_ACTION');
});

test('wo: terminal states', () => {
  assert.ok(isTerminal('COMPLETED'));
  assert.ok(isTerminal('CANCELLED'));
  assert.ok(!isTerminal('ON_HOLD'));
  assert.ok(!isTerminal('OPEN'));
});

// ---------------------------------------------------------------------------
// SLA labels + windows
// ---------------------------------------------------------------------------
test('sla: label shows BREACH for past due, countdown for future, — for none', () => {
  const now = new Date('2026-09-14T12:00:00Z');
  assert.match(slaLabel(new Date(now.getTime() + 42 * 60_000), now), /42m/);
  assert.match(slaLabel(new Date(now.getTime() - 102 * 60_000), now), /BREACH/);
  assert.equal(slaLabel(null, now), '—');
});

test('sla: canon windows P1=4h P2=8h P3=24h', () => {
  assert.equal(SLA_WINDOW_MS.P1, 4 * 3600_000);
  assert.equal(SLA_WINDOW_MS.P2, 8 * 3600_000);
  assert.equal(SLA_WINDOW_MS.P3, 24 * 3600_000);
});

// ---------------------------------------------------------------------------
// Idempotency request hash
// ---------------------------------------------------------------------------
test('idempotency: requestHash is stable, key-order-insensitive, body-sensitive', () => {
  assert.equal(requestHash({ a: 1, b: 'x' }), requestHash({ b: 'x', a: 1 }));
  assert.notEqual(requestHash({ a: 1 }), requestHash({ a: 2 }));
});
