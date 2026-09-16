/**
 * TASK-20 audit truthfulness — static guard against fictional copy in the
 * audit-trail UI and against fabrication endpoints.
 *
 * The audit page must never claim real-time buses, WebSocket telemetry,
 * Merkle consensus, block heights, or hard-coded telemetry numbers it does
 * not compute server-side. This test greps the component source so the
 * fiction cannot silently return.
 *
 * Run: npm test  (node --import tsx --test)
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const COMPONENT = new URL('../components/audit/AuditTrail.tsx', import.meta.url).pathname;
const VERIFY_CHAIN_ROUTE = new URL('../app/api/audit-trail/verify-chain/route.ts', import.meta.url).pathname;
const VERIFY_ROOT_ROUTE = new URL('../app/api/audit-trail/verify-root/route.ts', import.meta.url).pathname;

const src = readFileSync(COMPONENT, 'utf8');

// Phrases that assert live/consensus/telemetry properties the app does not have.
const FORBIDDEN = [
  'REAL-TIME SECURE', // no audit bus exists
  'Merkle', // server chain is a linear SHA-256 hash chain, not a Merkle tree
  'WS Broker', // no WebSocket broker exists
  'Live Polling', // polling toggle had no effect
  'Live Activity', // feed is a page-load snapshot + manual re-fetch
  'Live Nodes',
  'NUSA-LEDGER', // fictional consensus node
  'TXN-', // fabricated transaction ids
  'L30D', // totals are un-windowed server counts
  '1748097318', // hard-coded epoch
  'Manual refresh complete', // refresh was a fake timeout
  'Zero ledger corruption', // rollback never executed anything
  'APX-SOC2', // PDF export never produced a file
  'Compiling Dossier',
  'Signed Proof', // evidence JSON is unsigned
  'Operations Staff', // guessed role for server rows
  'Security Subject', // guessed role for server rows
  'NUSA-CORE', // fabricated terminal for server rows
  'Session Token Cookie Validated', // fabricated MFA line for server rows
  'req_audit_', // fabricated request ids for server rows
];

for (const phrase of FORBIDDEN) {
  test(`audit copy contains no fiction: "${phrase}"`, () => {
    assert.ok(!src.includes(phrase), `components/audit/AuditTrail.tsx still contains "${phrase}"`);
  });
}

test('fabricated verify-root endpoint stays deleted', () => {
  assert.ok(
    !existsSync(VERIFY_ROOT_ROUTE),
    'app/api/audit-trail/verify-root/route.ts returned — it served hard-coded consensus fiction',
  );
});

// ---------------------------------------------------------------------------
// GAP-07: impersonation theater removed — no fake "audit-chained" claims.
// Both files must carry only the honest disabled placeholder.
// ---------------------------------------------------------------------------
const PROFILE_SESSIONS = new URL('../components/profile/ProfileSessions.tsx', import.meta.url).pathname;
const ORG_HUB = new URL('../components/org/OrgHub.tsx', import.meta.url).pathname;

const IMPERSONATION_FICTION = [
  'audit chain on',
  'reason logged',
  'fully logged',
  'Impersonation session started',
  'Impersonating',
  'IMPERSONATING',
  '30-min tablet window',
];

for (const [label, file] of [['ProfileSessions', PROFILE_SESSIONS], ['OrgHub', ORG_HUB]] as const) {
  for (const phrase of IMPERSONATION_FICTION) {
    test(`GAP-07 ${label} contains no impersonation fiction: "${phrase}"`, () => {
      const body = readFileSync(file, 'utf8');
      assert.ok(!body.includes(phrase), `${label} still contains "${phrase}"`);
    });
  }
  test(`GAP-07 ${label} carries the honest disabled placeholder`, () => {
    const body = readFileSync(file, 'utf8');
    assert.ok(
      body.includes('server-issued impersonation session') && body.includes('disabled rather than simulated'),
      `${label} must explain impersonation needs a server-issued session and is disabled, not simulated`,
    );
  });
}

test('GAP-07 ProfileSessions claims no audit chaining at all', () => {
  const body = readFileSync(PROFILE_SESSIONS, 'utf8');
  assert.ok(!body.includes('audit-chained'), 'ProfileSessions must not claim audit-chained (no writer exists)');
});

test('GAP-07 OrgHub audit-chained survives ONLY on the server-audited activate/deactivate path', () => {
  const body = readFileSync(ORG_HUB, 'utf8');
  const hits = body.split('audit-chained').length - 1;
  // setActive() → PATCH /api/organization/users → org-service writes USER_DEACTIVATE/USER_UPDATE audit rows (GAP-2).
  assert.equal(hits, 2, `expected exactly the 2 activate/deactivate toasts, found ${hits}`);
});

test('verify-chain route delegates to real server recomputation', () => {
  const route = readFileSync(VERIFY_CHAIN_ROUTE, 'utf8');
  assert.ok(
    route.includes('verifyAuditHashChain'),
    'verify-chain route must call verifyAuditHashChain (server recomputation)',
  );
});
