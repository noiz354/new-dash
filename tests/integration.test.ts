/**
 * Integration tests — real PGlite database (temp dir), migrations, seed,
 * auth flow, tenant isolation, WO state machine, idempotency, dashboard.
 * Run: npm test  (uses its own data dir; safe next to a running dev server).
 */
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { and, desc, eq } from 'drizzle-orm';

import { createDb, type Db } from '../db/client';
import { seedAll, SEED_PASSWORD, SEED_TOTP_SECRET } from '../db/seed';
import { workOrderEvents } from '../db/schema';
import { login, logout, verifyMfa } from '../lib/services/auth-service';
import {
  createWorkOrder, getDashboard, getWorkOrder, listAssignableTechs,
  listWoEvents, listWorkOrders, transitionWorkOrder,
} from '../lib/services/wo-service';
import {
  createServiceRequest, getServiceRequest, listServiceRequests,
  listSrHistory, transitionServiceRequest,
} from '../lib/services/sr-service';
import { totpNow } from '../lib/auth/totp';
import { DomainError } from '../lib/domain/errors';
import { verifySession, type AuthContext } from '../lib/auth/session';

const TEST_DIR = `.data/test-integration-${Date.now()}`;
let db: Db;
let close: () => Promise<void>;
/** Real session (login + TOTP) for the canon tenant admin. */
let admin: AuthContext;
let adminToken: string;
let ipSeq = 0;

before(async () => {
  const handle = createDb(TEST_DIR);
  db = handle.db;
  close = handle.close;
  await migrate(db, { migrationsFolder: new URL('../db/migrations', import.meta.url).pathname });
  await seedAll(db);
  const session = await sessionFor('m.vance@apexops.io');
  admin = session.ctx;
  adminToken = session.token;
});

after(async () => {
  await close();
  rmSync(TEST_DIR, { recursive: true, force: true });
});

/** Full real auth: password (scrypt) → MFA challenge → TOTP verify → session. */
async function sessionFor(email: string, password = SEED_PASSWORD): Promise<{ ctx: AuthContext; token: string }> {
  const step1 = await login(db, { email, password, ip: `10.9.0.${++ipSeq}` });
  assert.equal(step1.status, 'mfa_required');
  if (step1.status !== 'mfa_required') throw new Error('unreachable');
  const step2 = await verifyMfa(db, { challengeId: step1.challengeId, code: totpNow(SEED_TOTP_SECRET) });
  return { ctx: step2.user, token: step2.token };
}

async function expectDomainError(fn: () => Promise<unknown>, status: number, code: string) {
  try {
    await fn();
    assert.fail(`expected DomainError ${status} ${code}`);
  } catch (err) {
    assert.ok(err instanceof DomainError, `expected DomainError, got ${err}`);
    assert.equal(err.status, status);
    assert.equal(err.code, code);
  }
}

// ---------------------------------------------------------------------------
// Auth flow
// ---------------------------------------------------------------------------
test('auth: wrong password → 401 INVALID_CREDENTIALS (no enumeration)', async () => {
  await expectDomainError(
    () => login(db, { email: 'e.voronova@apexops.io', password: 'totally-wrong', ip: '10.0.0.9' }),
    401, 'INVALID_CREDENTIALS',
  );
});

test('auth: unknown email → same 401 INVALID_CREDENTIALS', async () => {
  await expectDomainError(
    () => login(db, { email: 'nobody@apexops.io', password: 'whatever1', ip: '10.0.0.9' }),
    401, 'INVALID_CREDENTIALS',
  );
});

test('auth: seeded credentials → MFA challenge → TOTP verify → session', async () => {
  const step1 = await login(db, { email: 'd.chen@apexops.io', password: SEED_PASSWORD, ip: '10.0.0.3' });
  assert.equal(step1.status, 'mfa_required');
  if (step1.status !== 'mfa_required') return;
  assert.ok(step1.challengeId);
  assert.equal(step1.devHint, totpNow(SEED_TOTP_SECRET), 'dev hint = current TOTP (non-prod only)');

  // Wrong code → 401 MFA_INVALID (skipped if '000000' is the valid code right now).
  if (totpNow(SEED_TOTP_SECRET) !== '000000') {
    await expectDomainError(
      () => verifyMfa(db, { challengeId: step1.challengeId, code: '000000' }),
      401, 'MFA_INVALID',
    );
  }

  const step2 = await verifyMfa(db, { challengeId: step1.challengeId, code: totpNow(SEED_TOTP_SECRET) });
  assert.ok(step2.token.length >= 32);
  assert.equal(step2.user.orgId, 'APX-NUSA-01');
  assert.equal(step2.user.email, 'd.chen@apexops.io');
  assert.equal(step2.user.role, 'Engineering Lead');

  // Challenge is single-use.
  await expectDomainError(
    () => verifyMfa(db, { challengeId: step1.challengeId, code: totpNow(SEED_TOTP_SECRET) }),
    400, 'CHALLENGE_INVALID',
  );
});

test('auth: logout revokes the session', async () => {
  const { token } = await sessionFor('e.voronova@apexops.io');
  assert.ok(await verifySession(db, token));
  await logout(db, token);
  assert.equal(await verifySession(db, token), null);
});

// ---------------------------------------------------------------------------
// Tenant isolation
// ---------------------------------------------------------------------------
test('tenant: canon org sees its 7 seeded WOs, decoy WO invisible', async () => {
  // Runs before any create test → exactly the 7 seeded rows.
  const rows = await listWorkOrders(db, admin);
  assert.equal(rows.length, 7);
  assert.ok(rows.every((r) => !r.number.includes('7777')));
  assert.ok(rows.some((r) => r.number === 'WO-2026-0894'));
});

test('tenant: decoy org sees ONLY its own WO; cross-tenant get → 404', async () => {
  const { ctx: decoy } = await sessionFor('t.user@apexgl.io', 'decoy-pass-9021');
  assert.equal(decoy.orgId, 'APX-GL-9021');
  const rows = await listWorkOrders(db, decoy);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].number, 'WO-2026-7777');
  await expectDomainError(
    () => getWorkOrder(db, decoy, 'WO-2026-0894'),
    404, 'WORK_ORDER_NOT_FOUND',
  );
  // Mutations are tenant-guarded too.
  await expectDomainError(
    () => transitionWorkOrder(db, decoy, 'WO-2026-0894', { action: 'hold', reason: 'hostile' }),
    404, 'WORK_ORDER_NOT_FOUND',
  );
});

// ---------------------------------------------------------------------------
// Work-order lifecycle (the PASS flow)
// ---------------------------------------------------------------------------
test('wo: full lifecycle hold → resume → complete persists with events', async () => {
  const num = 'WO-2026-0894'; // IN_PROGRESS in seed

  const held = await transitionWorkOrder(db, admin, num, { action: 'hold', reason: 'Test hold — bearing kit delayed' });
  assert.equal(held.status, 'ON_HOLD');
  assert.equal(held.holdReason, 'Test hold — bearing kit delayed');

  // Hold requires a reason.
  await expectDomainError(
    () => transitionWorkOrder(db, admin, 'WO-2024-0901', { action: 'hold', reason: '  ' }),
    400, 'WO_REASON_REQUIRED',
  );

  // Complete from ON_HOLD is invalid.
  await expectDomainError(
    () => transitionWorkOrder(db, admin, num, { action: 'complete' }),
    409, 'WO_INVALID_TRANSITION',
  );

  const resumed = await transitionWorkOrder(db, admin, num, { action: 'resume' });
  assert.equal(resumed.status, 'IN_PROGRESS');

  const done = await transitionWorkOrder(db, admin, num, { action: 'complete' });
  assert.equal(done.status, 'COMPLETED');
  assert.equal(done.isTerminal, true);
  assert.equal(done.slaLabel, '—');

  // Terminal: no further transitions.
  await expectDomainError(
    () => transitionWorkOrder(db, admin, num, { action: 'cancel', reason: 'too late' }),
    409, 'WO_INVALID_TRANSITION',
  );

  // Re-read proves persistence (not just the return value).
  const fresh = await getWorkOrder(db, admin, num);
  assert.equal(fresh.status, 'COMPLETED');

  const events = await db
    .select({ action: workOrderEvents.action })
    .from(workOrderEvents)
    .where(and(eq(workOrderEvents.organizationId, admin.orgId), eq(workOrderEvents.workOrderNumber, num)))
    .orderBy(desc(workOrderEvents.ts));
  const actions = events.map((e) => e.action);
  for (const expected of ['HOLD', 'RESUME', 'COMPLETE']) {
    assert.ok(actions.includes(expected), `missing event ${expected}`);
  }
});

test('wo: assign changes tech but not status; cross-tenant assignee rejected', async () => {
  const techs = await listAssignableTechs(db, admin);
  assert.ok(techs.length >= 5);
  const target = techs.find((t) => t.email === 'm.kowalski@apexops.io');
  assert.ok(target);

  const assigned = await transitionWorkOrder(db, admin, 'WO-2024-0904', { action: 'assign', assigneeEmail: target.email });
  assert.equal(assigned.status, 'OPEN'); // assign never changes status
  assert.equal(assigned.tech, 'Marcus Kowalski');

  await expectDomainError(
    () => transitionWorkOrder(db, admin, 'WO-2024-0904', { action: 'assign', assigneeEmail: 't.user@apexgl.io' }),
    400, 'ASSIGNEE_NOT_FOUND',
  );
});

// ---------------------------------------------------------------------------
// Create + numbering + idempotency
// ---------------------------------------------------------------------------
test('wo: create numbers from the server sequence (WO-2026-0910 first)', async () => {
  const wo = await createWorkOrder(db, admin, { title: 'Cooling tower fan belt replacement', priority: 'P2', assetCode: 'AST-HVAC-004' });
  assert.equal(wo.number, 'WO-2026-0910');
  assert.equal(wo.status, 'OPEN');
  assert.ok(wo.slaDueAt, 'SLA due computed from the P2 window');
  assert.equal(wo.slaLabel.includes('BREACH'), false);

  const next = await createWorkOrder(db, admin, { title: 'Second manual WO', priority: 'P1' });
  assert.equal(next.number, 'WO-2026-0911');
});

test('idempotency: same key + body replays stored response; same key + new body → 422', async () => {
  const key = 'idem-test-key-0001';
  const first = await createWorkOrder(db, admin, { title: 'Idempotent WO', priority: 'P3' }, { idempotencyKey: key });
  assert.equal(first.number, 'WO-2026-0912');

  // Replay: identical key + identical body → same stored response, NO new row.
  const replay = await createWorkOrder(db, admin, { title: 'Idempotent WO', priority: 'P3' }, { idempotencyKey: key });
  assert.equal(replay.number, first.number);

  // Key order must not matter for replay detection (canonical request hash).
  const replay2 = await createWorkOrder(db, admin, { priority: 'P3', title: 'Idempotent WO' }, { idempotencyKey: key });
  assert.equal(replay2.number, first.number);

  // Key reuse with a different body → 422 IDEMPOTENCY_KEY_REUSED.
  await expectDomainError(
    () => createWorkOrder(db, admin, { title: 'Different body!', priority: 'P1' }, { idempotencyKey: key }),
    422, 'IDEMPOTENCY_KEY_REUSED',
  );

  // Sequence must not have advanced for the replay/rejected calls.
  const after = await createWorkOrder(db, admin, { title: 'After idempotency', priority: 'P3' });
  assert.equal(after.number, 'WO-2026-0913');
});

// ---------------------------------------------------------------------------
// Session persistence + dashboard aggregates
// ---------------------------------------------------------------------------
test('session: token survives re-verification (persistence, not memory)', async () => {
  const ctx = await verifySession(db, adminToken);
  assert.ok(ctx);
  assert.equal(ctx.orgId, 'APX-NUSA-01');
  assert.equal(ctx.email, 'm.vance@apexops.io');
});

test('dashboard: KPIs computed from real rows, events feed populated', async () => {
  const data = await getDashboard(db, admin);
  // 7 seeded − 1 completed (lifecycle test) + 4 created = 10 open.
  assert.equal(data.kpis.open, 10);
  assert.ok(data.kpis.p1 >= 3); // 0888, 0892 seeded + 0911 created
  assert.equal(data.kpis.onHold, 1); // WO-2024-0888 (0894 resumed & completed)
  assert.ok(data.kpis.techs >= 2);
  // 0894 completed within its SLA window → 1/1 = 100%.
  assert.equal(data.kpis.slaCompliance, 100);
  assert.ok(data.rows.length === 5);
  assert.ok(data.rows.every((r) => !r.isTerminal));
  assert.ok(data.events.length >= 3, 'lifecycle produced HOLD/RESUME/COMPLETE events');
});

// ---------------------------------------------------------------------------
// Service-request flow (slice 2): intake → triage → convert → close
// ---------------------------------------------------------------------------
test('sr: seeded queue is tenant-scoped; canon SR links to the seal WO', async () => {
  const rows = await listServiceRequests(db, admin);
  assert.equal(rows.length, 5);
  const canon = rows.find((r) => r.number === 'SR-2026-0894');
  assert.ok(canon);
  assert.equal(canon.status, 'CONVERTED');
  assert.equal(canon.convertedWoNumber, 'WO-2026-0894');
  assert.equal(canon.slaLabel, '—'); // terminal → no clock

  const { ctx: decoy } = await sessionFor('t.user@apexgl.io', 'decoy-pass-9021');
  assert.equal((await listServiceRequests(db, decoy)).length, 0);
  await expectDomainError(
    () => getServiceRequest(db, decoy, 'SR-2026-0894'),
    404, 'SERVICE_REQUEST_NOT_FOUND',
  );
});

test('sr: create → triage → convert creates a real WO in one transaction', async () => {
  const created = await createServiceRequest(db, admin, {
    title: 'AHU-7 bearing noise after PM', requesterName: 'Front Desk · Dana Priya', priority: 'P2', assetCode: 'AST-HVAC-003',
  });
  assert.equal(created.number, 'SR-2026-0895'); // sequence continues after the 5 seeded
  assert.equal(created.status, 'OPEN');
  assert.equal(created.slaLabel.includes('BREACH'), false);

  const triaged = await transitionServiceRequest(db, admin, created.number, { action: 'triage' });
  assert.equal(triaged.sr.status, 'TRIAGED');

  const converted = await transitionServiceRequest(db, admin, created.number, {
    action: 'convert', woTitle: 'AHU-7 bearing replacement', woPriority: 'P1',
  });
  assert.equal(converted.sr.status, 'CONVERTED');
  assert.ok(converted.workOrder);
  assert.match(converted.workOrder.number, /^WO-2026-\d{4}$/);
  assert.equal(converted.sr.convertedWoNumber, converted.workOrder.number);
  assert.equal(converted.workOrder.status, 'OPEN');
  assert.equal(converted.workOrder.priority, 'P1');
  assert.equal(converted.workOrder.title, 'AHU-7 bearing replacement');

  // The WO is a first-class row: readable, transitionable, event-logged.
  const wo = await getWorkOrder(db, admin, converted.workOrder.number);
  assert.equal(wo.number, converted.workOrder.number);
  const events = await listWoEvents(db, admin, wo.number);
  assert.equal(events[0].action, 'CREATE');
  assert.equal(events[0].reason, `Converted from ${created.number}`);

  // One-time conversion: second attempt (new idempotency key) → 409.
  await expectDomainError(
    () => transitionServiceRequest(db, admin, created.number, { action: 'convert' }),
    409, 'SR_INVALID_TRANSITION',
  );

  // Real history from the audit trail.
  const history = await listSrHistory(db, admin, created.number);
  const actions = history.map((h) => h.action);
  for (const expected of ['SR_CREATE', 'SR_TRIAGE', 'SR_CONVERT']) {
    assert.ok(actions.includes(expected), `missing history ${expected}`);
  }
});

test('sr: close requires a reason and is terminal', async () => {
  const created = await createServiceRequest(db, admin, {
    title: 'Duplicate: dock door sensor flicker', requesterName: 'Logistics', priority: 'P3',
  });
  assert.equal(created.number, 'SR-2026-0896');

  await expectDomainError(
    () => transitionServiceRequest(db, admin, created.number, { action: 'close' }),
    400, 'SR_REASON_REQUIRED',
  );

  const closed = await transitionServiceRequest(db, admin, created.number, {
    action: 'close', reason: 'Duplicate of SR-2026-0893',
  });
  assert.equal(closed.sr.status, 'CLOSED');

  await expectDomainError(
    () => transitionServiceRequest(db, admin, created.number, { action: 'triage' }),
    409, 'SR_INVALID_TRANSITION',
  );

  // Re-read proves persistence.
  const fresh = await getServiceRequest(db, admin, created.number);
  assert.equal(fresh.status, 'CLOSED');
});

test('sr: idempotent convert replay does NOT create a second WO', async () => {
  const created = await createServiceRequest(db, admin, {
    title: 'Idempotent convert probe', requesterName: 'QA Desk', priority: 'P2',
  });
  const key = 'sr-convert-idem-0001';
  const first = await transitionServiceRequest(db, admin, created.number, { action: 'convert' }, { idempotencyKey: key });
  const replay = await transitionServiceRequest(db, admin, created.number, { action: 'convert' }, { idempotencyKey: key });
  assert.equal(replay.sr.convertedWoNumber, first.sr.convertedWoNumber);

  const rows = await listWorkOrders(db, admin);
  const matching = rows.filter((r) => r.number === first.sr.convertedWoNumber);
  assert.equal(matching.length, 1, 'exactly one WO row for the replayed convert');
});
