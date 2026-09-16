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

// ---------------------------------------------------------------------------
// GAP-08: honest infra/transport/delivery copy (F31) + EVT fail-closed (F32).
// File-scoped: each file must not contain the exact fiction strings removed.
// ---------------------------------------------------------------------------
const GAP08_ABSENT: Array<[label: string, rel: string, phrases: string[]]> = [
  ['SideNav', '../components/ops/SideNav.tsx', ['Live Sync Active', '10.14.0.8', 'HEALTHY']],
  ['NotificationsHub', '../components/notifications/NotificationsHub.tsx', ['WS-PUSH', 'paged D. Chen', 'D. Chen paged', 'paged to B-204 · ETA 12 min']],
  ['ReportsHub', '../components/reports/ReportsHub.tsx', ['READ REPLICA', 'streams from read replica']],
  ['FacilityHub', '../components/facilities/FacilityHub.tsx', ['Broker 10.14.0.8', 'crew paged']],
  ['PmHub', '../components/pm/PmHub.tsx', ['leads paged', 'Broker flagged']],
  ['PurchasingDialogs', '../components/purchasing/dialogs.tsx', ['DISPATCHED · key idem-auth-po0315.', 'PO-2026-0315 DISPATCHED</Badge>']],
  ['OrgHub', '../components/org/OrgHub.tsx', ['Okta SCIM: 12ms']],
  ['CriticalActionDialog', '../components/ui/critical-action-dialog.tsx', ['Math.random', 'Root Merkle Verified', 'Proof of consensus has been committed']],
];

for (const [label, rel, phrases] of GAP08_ABSENT) {
  for (const phrase of phrases) {
    test(`GAP-08 ${label} contains no infra fiction: "${phrase}"`, () => {
      const body = readFileSync(new URL(rel, import.meta.url).pathname, 'utf8');
      assert.ok(!body.includes(phrase), `${label} still contains "${phrase}"`);
    });
  }
}

test('GAP-08 SettingsHub carries no integration fiction', () => {
  const body = readFileSync(new URL('../components/settings/SettingsHub.tsx', import.meta.url).pathname, 'utf8');
  for (const phrase of [
    'production KV-store',
    '1,420 msgs/min',
    'SCADA link healthy',
    'handshake 200 OK',
    'Live FX: Fixer.io',
    'Updated 14 mins ago',
    'GIS + roster rebound.',
    'mTLS Enforced',
    'draining to new broker',
    'Backup Schedule Status: <strong>Active',
    '842.6 MB (SHA-256)',
    'DKIM / SPF Valid',
    'message-id diag-8841',
    'Oracle ERP</h3>',
    'Synced ({erpSync})',
    'next cron in 15 min.',
    'Real-time message routing thresholds',
    'HEALTHY ({buffer}%)',
    '250,000 msg ring buffer allocated',
    'backpressure 12% → 2%',
  ]) {
    assert.ok(!body.includes(phrase), `SettingsHub still contains "${phrase}"`);
  }
});

test('GAP-08 SettingsHub states the honest qualifiers', () => {
  const body = readFileSync(new URL('../components/settings/SettingsHub.tsx', import.meta.url).pathname, 'utf8');
  for (const phrase of [
    'not persisted',
    'no live ingest',
    'no backup job',
    'not connected',
    'no mail sent',
    'not verified',
    'no ERP sync performed',
    'no delivery',
    'not enforced (planned)',
    'no live broker',
  ]) {
    assert.ok(body.includes(phrase), `SettingsHub missing honest qualifier "${phrase}"`);
  }
});

test('GAP-08 critical-action dialog fails closed without an audit ID', () => {
  const body = readFileSync(
    new URL('../components/ui/critical-action-dialog.tsx', import.meta.url).pathname,
    'utf8',
  );
  assert.ok(
    body.includes('treated as NOT recorded'),
    'dialog must fail closed with an honest message when onExecute returns no auditId',
  );
});

// ---------------------------------------------------------------------------
// GAP-15: honest export label (F11) + Phase-2 run affordance (F18).
// ---------------------------------------------------------------------------
test('GAP-15 ledger export claims CSV only, never XLS', () => {
  const body = readFileSync(
    new URL('../components/inventory/InventoryLedger.tsx', import.meta.url).pathname,
    'utf8',
  );
  assert.ok(!body.includes('CSV/XLS'), 'ledger export produces CSV only — the XLS claim must stay removed');
  assert.ok(
    body.includes('Export CSV (loaded rows)'),
    'ledger export button must disclose it exports the loaded rows as CSV',
  );
});

test('GAP-15 audit queue cards disclose the Phase-2 run gate', () => {
  const body = readFileSync(
    new URL('../components/field/AuditQueue.tsx', import.meta.url).pathname,
    'utf8',
  );
  assert.ok(
    body.includes('Phase 2') && body.includes('run checklist not available yet'),
    'non-canonical audit cards must carry the Phase-2 badge (run route only serves CANON.inspection)',
  );
  assert.ok(
    body.includes('a.id !== CANON.inspection'),
    'Phase-2 badge must be gated on non-canonical ids, not shown on the runnable audit',
  );
});

// ---------------------------------------------------------------------------
// GAP-17 (GAP-16 TASK 2 / F12): fictional transfer/adjustment doc refs must
// never return to the inventory ledger UI (movement feed + SKU detail page).
// ---------------------------------------------------------------------------
test('GAP-17 inventory UI shows no fictional TRF-/ADJ- doc refs', () => {
  const files: Array<[string, string]> = [
    ['components/inventory/InventoryLedger.tsx', new URL('../components/inventory/InventoryLedger.tsx', import.meta.url).pathname],
    ['app/(ops)/inventory/[sku]/page.tsx', new URL('../app/(ops)/inventory/[sku]/page.tsx', import.meta.url).pathname],
  ];
  for (const [label, path] of files) {
    const body = readFileSync(path, 'utf8');
    for (const gone of ['TRF-', 'ADJ-', 'Internal Courier #02', 'waybill #772', 'cc:QA-SCRAP', 'Terminal pin defect']) {
      assert.ok(!body.includes(gone), `${label} still fabricates movement doc fiction: "${gone}"`);
    }
  }
});

test('GAP-17 ledger fallback feed keeps only link-resolvable canon refs', () => {
  const body = readFileSync(
    new URL('../components/inventory/InventoryLedger.tsx', import.meta.url).pathname,
    'utf8',
  );
  assert.ok(
    body.includes('CANON.workOrderSeal') && body.includes('CANON.purchaseOrder') && body.includes('CANON.pmPlan'),
    'MOV_SEED fallback must reference WO/PO/PM canon docs that the link branches resolve',
  );
  assert.ok(
    body.includes('Demo offline'),
    'fallback feed must stay labeled as demo (server-unreachable) provenance',
  );
});
