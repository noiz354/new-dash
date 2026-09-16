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

test('verify-chain route delegates to real server recomputation', () => {
  const route = readFileSync(VERIFY_CHAIN_ROUTE, 'utf8');
  assert.ok(
    route.includes('verifyAuditHashChain'),
    'verify-chain route must call verifyAuditHashChain (server recomputation)',
  );
});
