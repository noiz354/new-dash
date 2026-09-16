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
import { auditEvents } from '../db/schema';
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
import { listAuditEvents, verifyAuditHashChain } from '../lib/services/audit-service';
import { findSrByConvertedWo, getAssetDossier, listAssets } from '../lib/services/asset-service';
import { convertFindingToWo, createFinding, dismissFinding, getFinding, listFindings } from '../lib/services/inspection-service';
import { getPart, listParts, mutateStock, verifyStepUpCode } from '../lib/services/inventory-service';
import { createUser, listUsers, resetUserMfa, updateUser } from '../lib/services/org-service';
import { totpNow } from '../lib/auth/totp';
import { DomainError } from '../lib/domain/errors';
import { verifySession, type AuthContext } from '../lib/auth/session';
import {
  createSession,
  hashToken,
  listUserSessions,
  revokeAllUserSessions,
  revokeOtherUserSessions,
} from '../lib/auth/session';

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

// ---------------------------------------------------------------------------
// Audit ledger + asset registry (slice 3)
// ---------------------------------------------------------------------------
test('audit: ledger holds real events from every flow, tenant-scoped', async () => {
  const page = await listAuditEvents(db, admin);
  assert.ok(page.total >= 10, `expected a populated ledger, got ${page.total}`);
  assert.equal(page.rows.length <= 500, true);
  const actions = new Set(page.rows.map((r) => r.action));
  for (const expected of ['AUTH_MFA_OK', 'WO_HOLD', 'WO_COMPLETE', 'SR_CREATE', 'SR_CONVERT', 'SR_CLOSE']) {
    assert.ok(actions.has(expected), `ledger missing ${expected}`);
  }
  const types = new Set(page.counts.map((c) => c.entityType));
  assert.ok(types.has('work_order') && types.has('service_request') && types.has('auth'));

  // Rows are newest-first and carry entity references.
  assert.ok(page.rows[0].ts >= page.rows[page.rows.length - 1].ts);
  const woHold = page.rows.find((r) => r.action === 'WO_HOLD');
  assert.ok(woHold);
  assert.equal(woHold.entityType, 'work_order');
  assert.equal(woHold.entityId, 'WO-2026-0894');
  assert.ok((woHold.after as { reason?: string }).reason?.includes('bearing kit'));

  // Decoy tenant sees only its own (auth) events — never canon ledger rows.
  const { ctx: decoy } = await sessionFor('t.user@apexgl.io', 'decoy-pass-9021');
  const decoyPage = await listAuditEvents(db, decoy);
  assert.ok(decoyPage.total < page.total);
  assert.ok(decoyPage.rows.every((r) => r.entityId === null || !r.entityId.startsWith('WO-2026-08')));
});

// ---------------------------------------------------------------------------
// TASK-20: hash-chain verification is a real server recomputation, and it
// catches tampering (stored entryHash mismatch).
// ---------------------------------------------------------------------------
test('audit: verifyAuditHashChain recomputes the real chain and detects tampering', async () => {
  const clean = await verifyAuditHashChain(db, admin);
  assert.equal(clean.valid, true);
  assert.ok(clean.verifiedCount >= 10, `expected populated ledger, got ${clean.verifiedCount}`);
  assert.match(clean.rootHash, /^[0-9a-f]{64}$/);
  assert.match(clean.genesisHash, /^[0-9a-f]{64}$/);
  assert.equal(clean.tamperedEventId, null);

  // Simulate a tampered row: plant a wrong stored hash, expect detection.
  const victim = (await listAuditEvents(db, admin)).rows[0];
  await db.update(auditEvents).set({ entryHash: '0'.repeat(64) }).where(eq(auditEvents.id, victim.id));
  try {
    const tampered = await verifyAuditHashChain(db, admin);
    assert.equal(tampered.valid, false);
    assert.equal(tampered.tamperedEventId, victim.id);
  } finally {
    await db.update(auditEvents).set({ entryHash: null }).where(eq(auditEvents.id, victim.id));
  }
  assert.equal((await verifyAuditHashChain(db, admin)).valid, true);
});

test('assets: registry with real workload counts; dossier relations; cross-tenant 404', async () => {
  const rows = await listAssets(db, admin);
  assert.ok(rows.length >= 4);
  const seal = rows.find((r) => r.code === 'AST-HVAC-004');
  assert.ok(seal);
  assert.equal(seal.health, 68); // canon C-score
  assert.equal(seal.status, 'DEGRADED');

  // The SR-2026-0895 conversion created an OPEN WO on AST-HVAC-003.
  const ahu = rows.find((r) => r.code === 'AST-HVAC-003');
  assert.ok(ahu);
  assert.ok(ahu.openWos >= 1, 'converted WO should count as open workload');
  assert.ok(ahu.totalWos >= 1);

  const dossier = await getAssetDossier(db, admin, 'AST-HVAC-004');
  assert.ok(dossier.wos.some((w) => w.number === 'WO-2026-0894' && w.status === 'COMPLETED'));
  assert.ok(dossier.srs.some((s) => s.number === 'SR-2026-0894' && s.status === 'CONVERTED'));

  // Origin cross-link: the seal WO came from the canon SR.
  const origin = await findSrByConvertedWo(db, admin, 'WO-2026-0894');
  assert.ok(origin);
  assert.equal(origin.number, 'SR-2026-0894');

  const { ctx: decoy } = await sessionFor('t.user@apexgl.io', 'decoy-pass-9021');
  assert.equal((await listAssets(db, decoy)).length, 0);
  await expectDomainError(
    () => getAssetDossier(db, decoy, 'AST-HVAC-004'),
    404, 'ASSET_NOT_FOUND',
  );
});

// ---------------------------------------------------------------------------
// Findings persistence (GAP #1: POST used to return 201 without insert)
// ---------------------------------------------------------------------------
test('findings: create persists with canon numbering + audit; list reads DB rows', async () => {
  const before = await listFindings(db, admin);
  assert.ok(before.some((f) => f.status === 'CONVERTED'), 'seeded converted finding visible');

  const fnd = await createFinding(db, admin, {
    title: 'Oil mist at compressor terminal box',
    severity: 'MAJOR',
    assetCode: 'AST-HVAC-004',
    extra: { description: 'Visible misting', zone: 'Plant Room' },
  });
  assert.equal(fnd.number, 'FND-2026-0189');
  assert.equal(fnd.status, 'OPEN');
  assert.equal(fnd.severity, 'MAJOR');

  // Refresh test: row survives a fresh read; audit event written.
  const refetched = await getFinding(db, admin, 'FND-2026-0189');
  assert.equal(refetched.title, 'Oil mist at compressor terminal box');
  const ledger = await listAuditEvents(db, admin);
  assert.ok(ledger.rows.some((e) => e.action === 'FINDING_CREATE' && e.entityId === 'FND-2026-0189'), 'FINDING_CREATE audited');

  const after = await listFindings(db, admin);
  assert.equal(after.length, before.length + 1);

  // Cross-tenant isolation: decoy org sees none of canon's findings.
  const { ctx: decoy } = await sessionFor('t.user@apexgl.io', 'decoy-pass-9021');
  assert.equal((await listFindings(db, decoy)).length, 0);
  await expectDomainError(() => getFinding(db, decoy, 'FND-2026-0189'), 404, 'FINDING_NOT_FOUND');
});

test('findings: idempotent create replays without a second row', async () => {
  const key = 'finding-idem-key-0001';
  const first = await createFinding(db, admin, {
    title: 'Vibration probe loose on AHU-3', severity: 'MODERATE', assetCode: 'AST-HVAC-003',
  }, { idempotencyKey: key });
  assert.equal(first.number, 'FND-2026-0190');

  const replay = await createFinding(db, admin, {
    title: 'Vibration probe loose on AHU-3', severity: 'MODERATE', assetCode: 'AST-HVAC-003',
  }, { idempotencyKey: key });
  assert.equal(replay.number, first.number, 'replay returns the stored row, no duplicate');

  const after = await createFinding(db, admin, {
    title: 'After idempotency', severity: 'MINOR', assetCode: 'AST-HVAC-003',
  });
  assert.equal(after.number, 'FND-2026-0191', 'sequence advanced only for real inserts');
});

// ---------------------------------------------------------------------------
// Finding convert/dismiss (GAP #4: FindingDesk convert/dismiss + PM button
// were setTimeout/setState fake success; now wired to real endpoints)
// ---------------------------------------------------------------------------
test('findings: convert creates WO transactionally, second convert 409, replay idempotent', async () => {
  const fnd = await createFinding(db, admin, {
    title: 'Gap-4 convert probe', severity: 'CRITICAL', assetCode: 'AST-HVAC-004',
  });
  assert.equal(fnd.status, 'OPEN');

  const wosBefore = await listWorkOrders(db, admin);
  const key = 'finding-convert-key-0001';
  const res = await convertFindingToWo(db, admin, fnd.number,
    { woPriority: 'P1', reason: 'Gap-4 probe' }, { idempotencyKey: key });
  assert.equal(res.finding.status, 'CONVERTED');
  assert.ok(res.finding.convertedWoNumber, 'WO number linked');
  assert.equal(res.wo.number, res.finding.convertedWoNumber);
  assert.equal(res.wo.status, 'OPEN');

  // WO really exists + finding row updated + audit chained.
  const wo = await getWorkOrder(db, admin, res.wo.number);
  assert.equal(wo.title, `Corrective Action: ${fnd.title}`);
  const refetched = await getFinding(db, admin, fnd.number);
  assert.equal(refetched.convertedWoNumber, res.wo.number);
  const ledger = await listAuditEvents(db, admin);
  assert.ok(ledger.rows.some((e) => e.action === 'FINDING_CONVERT_WO' && e.entityId === fnd.number), 'FINDING_CONVERT_WO audited');

  // One-time conversion: second attempt without key → 409.
  await expectDomainError(
    () => convertFindingToWo(db, admin, fnd.number, { woPriority: 'P1' }),
    409, 'ALREADY_CONVERTED',
  );

  // Replay with the same key returns the stored result, no second WO.
  const replay = await convertFindingToWo(db, admin, fnd.number,
    { woPriority: 'P1', reason: 'Gap-4 probe' }, { idempotencyKey: key });
  assert.equal(replay.wo.number, res.wo.number, 'replay returns stored conversion');
  const wosAfter = await listWorkOrders(db, admin);
  assert.equal(wosAfter.length, wosBefore.length + 1, 'exactly one WO created');
});

test('findings: dismiss writes DISMISSED + audit; guards enforced', async () => {
  const fnd = await createFinding(db, admin, {
    title: 'Gap-4 dismiss probe', severity: 'MODERATE', assetCode: 'AST-HVAC-003',
  });

  // Short justification rejected server-side.
  await expectDomainError(
    () => dismissFinding(db, admin, fnd.number, { justification: 'too short' }),
    400, 'VALIDATION_ERROR',
  );
  assert.equal((await getFinding(db, admin, fnd.number)).status, 'OPEN', 'rejected dismiss changes nothing');

  const done = await dismissFinding(db, admin, fnd.number,
    { justification: 'Duplicate of earlier evidence pack, verified by lead' });
  assert.equal(done.finding.status, 'DISMISSED');
  const ledger = await listAuditEvents(db, admin);
  assert.ok(ledger.rows.some((e) => e.action === 'FINDING_DISMISS' && e.entityId === fnd.number), 'FINDING_DISMISS audited');

  // Terminal: dismiss twice → 409 ALREADY_DISMISSED.
  await expectDomainError(
    () => dismissFinding(db, admin, fnd.number, { justification: 'Another long enough justification here' }),
    409, 'ALREADY_DISMISSED',
  );

  // Dismiss after convert → 409 ALREADY_CONVERTED.
  const conv = await createFinding(db, admin, {
    title: 'Gap-4 convert-then-dismiss probe', severity: 'MAJOR', assetCode: 'AST-HVAC-004',
  });
  await convertFindingToWo(db, admin, conv.number, { woPriority: 'P2' });
  await expectDomainError(
    () => dismissFinding(db, admin, conv.number, { justification: 'Too late, already a work order now' }),
    409, 'ALREADY_CONVERTED',
  );

  // Cross-tenant isolation holds for lifecycle ops too.
  const { ctx: decoy } = await sessionFor('t.user@apexgl.io', 'decoy-pass-9021');
  await expectDomainError(() => dismissFinding(db, decoy, fnd.number, { justification: 'Decoy attempt with long text' }), 404, 'FINDING_NOT_FOUND');
});

// ---------------------------------------------------------------------------
// Organization directory (GAP #2: deactivate / edit-role / reset-MFA were
// local-only false success; now wired to real Postgres mutations)
// ---------------------------------------------------------------------------
test('org: provision → edit role → deactivate (login blocked) → reactivate, all audited', async () => {
  const created = await createUser(db, admin, {
    email: 'gap2.probe@apexops.io',
    name: 'Gap Two Probe',
    role: 'Senior Field Tech',
    title: 'Facilities Engineering · Senior Field Tech',
  });
  assert.equal(created.isActive, true);
  assert.equal(created.hasMfa, false);

  const edited = await updateUser(db, admin, created.id, { role: 'Engineering Lead' });
  assert.equal(edited.role, 'Engineering Lead');

  const off = await updateUser(db, admin, created.id, { isActive: false });
  assert.equal(off.isActive, false);

  // Deactivated login is refused with the same 401 as a wrong password (no enumeration).
  await expectDomainError(
    () => login(db, { email: 'gap2.probe@apexops.io', password: 'wrong-pass', ip: '10.9.0.99' }),
    401, 'INVALID_CREDENTIALS',
  );

  const on = await updateUser(db, admin, created.id, { isActive: true });
  assert.equal(on.isActive, true);

  const ledger = await listAuditEvents(db, admin);
  assert.ok(ledger.rows.some((e) => e.action === 'USER_INVITE' && e.entityId === created.id), 'USER_INVITE audited');
  assert.ok(ledger.rows.some((e) => e.action === 'USER_DEACTIVATE' && e.entityId === created.id), 'USER_DEACTIVATE audited');
});

test('org: reset-mfa clears totp, revokes live sessions, audited; self-targets → 403', async () => {
  const dir = await listUsers(db, admin);
  const chen = dir.find((u) => u.email === 'd.chen@apexops.io');
  assert.ok(chen, 'seeded Engineering Lead listed');
  assert.equal(chen.hasMfa, true);

  const { token: chenToken } = await sessionFor('d.chen@apexops.io');
  assert.ok(await verifySession(db, chenToken), 'live session verifies before reset');

  const res = await resetUserMfa(db, admin, chen.id);
  assert.equal(res.mfaEnrolled, false);
  assert.ok(res.sessionsRevoked >= 1, 'at least the live session revoked');
  assert.equal(await verifySession(db, chenToken), null, 'revoked session no longer verifies');

  const after = await listUsers(db, admin);
  assert.equal(after.find((u) => u.email === 'd.chen@apexops.io')?.hasMfa, false);

  const ledger = await listAuditEvents(db, admin);
  assert.ok(ledger.rows.some((e) => e.action === 'USER_MFA_RESET' && e.entityId === chen.id), 'USER_MFA_RESET audited');

  // Self-target guards: no self lockout.
  await expectDomainError(() => updateUser(db, admin, admin.userId, { isActive: false }), 403, 'USER_SELF_DEACTIVATE');
  await expectDomainError(() => resetUserMfa(db, admin, admin.userId), 403, 'USER_SELF_MFA_RESET');
  await expectDomainError(
    () => resetUserMfa(db, admin, '00000000-0000-0000-0000-000000000000'),
    404, 'USER_NOT_FOUND',
  );
});

// ---------------------------------------------------------------------------
// Inventory mutations (GAP #3: receive/mutasi were local-only + PIN '2468';
// now POST /api/parts/movements with server-verified step-up TOTP)
// ---------------------------------------------------------------------------
test('inventory (GAP-3): wrong step-up code → 403 STEP_UP_INVALID, stock untouched', async () => {
  const before = await getPart(db, admin, 'PART-BRG-6205');
  const code = totpNow(SEED_TOTP_SECRET) === '000000' ? '000001' : '000000';
  await expectDomainError(() => verifyStepUpCode(db, admin, code), 403, 'STEP_UP_INVALID');
  const after = await getPart(db, admin, 'PART-BRG-6205');
  assert.equal(after.onHand, before.onHand, 'rejected step-up mutates nothing');
});

test('inventory (GAP-3): user without enrolled MFA → 403 STEP_UP_UNAVAILABLE', async () => {
  const created = await createUser(db, admin, {
    email: 'gap3.nomfa@apexops.io',
    name: 'Gap Three NoMfa',
    role: 'Senior Field Tech',
  });
  assert.equal(created.hasMfa, false);
  const ctx: AuthContext = { ...admin, userId: created.id, email: created.email, name: created.name };
  await expectDomainError(() => verifyStepUpCode(db, ctx, totpNow(SEED_TOTP_SECRET)), 403, 'STEP_UP_UNAVAILABLE');
});

test('inventory (GAP-3): RECEIVE + ISSUE with step-up persist, audited with stepUpAt; replay idempotent; over-issue → 422', async () => {
  const sku = 'PART-BRG-6205';
  const start = await getPart(db, admin, sku);
  const key = `gap3-${Date.now()}`;

  const received = await mutateStock(
    db, admin,
    { sku, type: 'RECEIVE', qty: 4, refNumber: 'PO-2026-0999', reason: 'GAP-3 probe receipt' },
    { idempotencyKey: key, stepUpAt: await verifyStepUpCode(db, admin, totpNow(SEED_TOTP_SECRET)) },
  );
  assert.equal(received.onHand, start.onHand + 4);

  // Idempotent replay: same key + same payload → same result, no double mutation.
  const replay = await mutateStock(
    db, admin,
    { sku, type: 'RECEIVE', qty: 4, refNumber: 'PO-2026-0999', reason: 'GAP-3 probe receipt' },
    { idempotencyKey: key, stepUpAt: await verifyStepUpCode(db, admin, totpNow(SEED_TOTP_SECRET)) },
  );
  assert.equal(replay.onHand, start.onHand + 4, 'replay must not double-apply');

  const issued = await mutateStock(
    db, admin,
    { sku, type: 'ISSUE', qty: 1, refNumber: 'WO-2026-0894', reason: 'GAP-3 probe issue' },
    { stepUpAt: await verifyStepUpCode(db, admin, totpNow(SEED_TOTP_SECRET)) },
  );
  assert.equal(issued.onHand, start.onHand + 3);

  // Over-issue is refused and changes nothing.
  await expectDomainError(
    () => mutateStock(db, admin, { sku, type: 'ISSUE', qty: 9999, refNumber: 'WO-2026-0894' }, {}),
    422, 'INSUFFICIENT_STOCK',
  );
  assert.equal((await getPart(db, admin, sku)).onHand, start.onHand + 3);

  const ledger = await listAuditEvents(db, admin, { entityType: 'part' });
  const recv = ledger.rows.find((e) => e.action === 'PART_RECEIVE' && e.entityId === sku);
  assert.ok(recv, 'PART_RECEIVE audited');
  assert.ok((recv.after as { stepUpAt?: string })?.stepUpAt, 'step-up approval timestamp recorded');
  assert.ok(ledger.rows.some((e) => e.action === 'PART_ISSUE' && e.entityId === sku), 'PART_ISSUE audited');
});

// ---------------------------------------------------------------------------
// Sessions (GAP #5: ProfileSessions showed a hardcoded SESSIONS const with
// local-only revoke; now GET lists live rows with a current-device flag and
// POST supports revoke-others + revoke-all)
// ---------------------------------------------------------------------------
test('sessions (GAP-5): list marks exactly the caller current; prefixes only, never full hashes', async () => {
  const other = await createSession(db, admin.userId, admin.orgId, 'gap5-test tablet');
  const rows = await listUserSessions(db, admin.userId, admin.orgId, hashToken(adminToken));
  assert.ok(rows.length >= 2, 'caller session + probe session listed');
  const current = rows.filter((r) => r.current);
  assert.equal(current.length, 1, 'exactly one row is current');
  assert.equal(current[0].idHashPrefix, hashToken(adminToken).slice(0, 8));
  assert.ok(rows.every((r) => r.idHashPrefix.length === 8), 'only 8-char prefixes exposed');
  assert.ok(!('idHash' in current[0]), 'full hash never leaves the server');
  assert.ok(rows.some((r) => r.userAgent === 'gap5-test tablet' && !r.current));
  await logout(db, other);
  assert.equal(await verifySession(db, other), null, 'probe session cleaned up');
});

test('sessions (GAP-5): revoke-others keeps the caller, kills the rest', async () => {
  const doomed = await createSession(db, admin.userId, admin.orgId, 'gap5-doomed device');
  assert.ok(await verifySession(db, doomed), 'probe session live before revoke');

  const n = await revokeOtherUserSessions(db, admin.userId, admin.orgId, hashToken(adminToken));
  assert.ok(n >= 1, 'at least the probe session revoked');
  assert.ok(await verifySession(db, adminToken), 'caller session survives revoke-others');
  assert.equal(await verifySession(db, doomed), null, 'other session revoked');
});

test('sessions (GAP-5): revoke-all kills everything incl. caller', async () => {
  const probe = await createSession(db, admin.userId, admin.orgId, 'gap5-revoke-all probe');
  const n = await revokeAllUserSessions(db, admin.userId, admin.orgId);
  assert.ok(n >= 2, 'caller + probe revoked');
  assert.equal(await verifySession(db, adminToken), null, 'caller gone after revoke-all');
  assert.equal(await verifySession(db, probe), null, 'probe gone after revoke-all');
  // Restore the shared admin fixture for any later tests.
  const fresh = await sessionFor('m.vance@apexops.io');
  admin = fresh.ctx;
  adminToken = fresh.token;
});

// ---------------------------------------------------------------------------
// Billing webhook + checkout (GAP #6: BAD_SIGNATURE was swallowed by
// catch{}, HMAC ran over a re-serialization, no dedup, checkout stub
// cs_${Date.now()}. Now: raw-body HMAC fail-closed, event-id dedup via
// withIdempotency, real Stripe Checkout or honest 503.)
// ---------------------------------------------------------------------------
import { createHmac } from 'node:crypto';
import {
  createCheckoutSession,
  processStripeWebhook,
} from '../lib/services/billing-service';
import { organizations, subscriptions } from '../db/schema';

const GAP6_SECRET = 'whsec_gap6_test_secret';

function gap6Sign(rawBody: string, secret = GAP6_SECRET): string {
  const t = String(Math.floor(Date.now() / 1000));
  const v1 = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return `t=${t},v1=${v1}`;
}

function gap6Event(id: string, type = 'customer.subscription.updated', plan = 'GROWTH') {
  return JSON.stringify({
    id,
    type,
    data: {
      object: {
        id: 'sub_gap6',
        customer: 'cus_gap6',
        subscription: 'sub_gap6',
        metadata: { organizationId: admin.orgId, plan },
        status: 'active',
        cancel_at_period_end: false,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
      },
    },
  });
}

async function gap6AuditCount(eventId: string): Promise<number> {
  const rows = await db.select().from(auditEvents)
    .where(and(eq(auditEvents.organizationId, admin.orgId), eq(auditEvents.entityId, admin.orgId)));
  return rows.filter((r) => (r.after as { eventId?: string })?.eventId === eventId).length;
}

test('billing (GAP-6): valid signature processes once; replay is deduped without duplicate audit', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = GAP6_SECRET;
  try {
    const raw = gap6Event('evt_gap6_once');
    const sig = gap6Sign(raw);
    const first = await processStripeWebhook(db, raw, sig);
    assert.equal(first.status, 'subscription_updated');
    assert.equal(first.processed, true);
    assert.equal(first.replayed, false);
    assert.equal(await gap6AuditCount('evt_gap6_once'), 1, 'exactly one audit row');

    const replay = await processStripeWebhook(db, raw, sig);
    assert.equal(replay.status, 'subscription_updated');
    assert.equal(replay.replayed, true, 'replay flagged');
    assert.equal(await gap6AuditCount('evt_gap6_once'), 1, 'replay must not duplicate audit');

    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.organizationId, admin.orgId)).limit(1);
    assert.equal(sub?.plan, 'GROWTH');
    assert.equal(sub?.status, 'ACTIVE');
  } finally {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    await db.update(subscriptions).set({ plan: 'ENTERPRISE', status: 'ACTIVE' })
      .where(eq(subscriptions.organizationId, admin.orgId));
    await db.update(organizations).set({ plan: 'ENTERPRISE' })
      .where(eq(organizations.id, admin.orgId));
  }
});

test('billing (GAP-6): bad/tampered signature and missing header fail closed with no mutation', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = GAP6_SECRET;
  try {
    const raw = gap6Event('evt_gap6_evil');
    const before = await gap6AuditCount('evt_gap6_evil');

    await expectDomainError(() => processStripeWebhook(db, raw, gap6Sign(raw, 'wrong-secret')), 400, 'BILLING_BAD_SIGNATURE');
    await expectDomainError(() => processStripeWebhook(db, `${raw} `, gap6Sign(raw)), 400, 'BILLING_BAD_SIGNATURE');
    await expectDomainError(() => processStripeWebhook(db, raw, null), 401, 'BILLING_SIGNATURE_MISSING');
    await expectDomainError(() => processStripeWebhook(db, 'not-json', gap6Sign('not-json')), 400, 'BILLING_BAD_PAYLOAD');
    assert.equal(await gap6AuditCount('evt_gap6_evil'), before, 'rejected webhooks mutate nothing');
  } finally {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  }
});

test('billing (GAP-6): missing webhook secret fails closed (503), never silently skips verify', async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  const raw = gap6Event('evt_gap6_nosecret');
  await expectDomainError(() => processStripeWebhook(db, raw, gap6Sign(raw)), 503, 'BILLING_NOT_CONFIGURED');
  assert.equal(await gap6AuditCount('evt_gap6_nosecret'), 0, 'unconfigured webhook persists nothing');
});

test('billing (GAP-6): checkout without STRIPE_SECRET_KEY is an honest 503 — no fake URL, no TRIALING upsert', async () => {
  delete process.env.STRIPE_SECRET_KEY;
  const before = await db.select().from(subscriptions)
    .where(eq(subscriptions.organizationId, admin.orgId)).limit(1);
  await expectDomainError(
    () => createCheckoutSession(db, admin, 'GROWTH', 'https://x.test/success'),
    503, 'BILLING_NOT_CONFIGURED',
  );
  const after = await db.select().from(subscriptions)
    .where(eq(subscriptions.organizationId, admin.orgId)).limit(1);
  assert.deepEqual(after, before, 'failed checkout must not touch the subscription row');
  await expectDomainError(
    () => createCheckoutSession(db, admin, 'COMMUNITY', 'https://x.test/success'),
    503, 'BILLING_NOT_CONFIGURED',
  );
});
