# Second-Pass Audit Summary

## Scope

- OBSERVED: Read `screen-audits/summary.md`, all `screen-audits/*.md`, `../PROGRESS.md`, `../TODO.md`, `../docs/ui-audit/navigation-audit.md`, and the current Next.js route/component structure under `../app`, `../components`, and `../lib`.
- OBSERVED: Current application has 28 route-level pages in `../app`, plus 21 screenshot/reference PNGs already audited in first pass.
- OBSERVED: Many first-pass missing pages have since been implemented as routes, but several dynamic routes still render a seed-only `EmptyState` for non-canonical records.

## Existing Findings Confirmed

1. EXISTING FINDING: `purchasing` and `vendors` screenshots contain mobile field bottom-nav artifacts. In the current app, `FieldShell` is route-scoped under `(field)`, so the production layout model is correct; the artifact remains a Stitch/reference issue.
2. EXISTING FINDING: `reports` and `notifications` screenshots show wrong active nav. Current `OpsShell.activeFromPath()` correctly maps `/reports` and `/notifications`, so this is isolated to screenshots, not current shell architecture.
3. EXISTING FINDING: two asset PNGs use folder-name filenames instead of `screen.png`; do not rename them.
4. EXISTING FINDING: critical actions need shared confirmation guard. Current app has `ConfirmDialog`, but reason/PIN/loading/failure variants are inconsistent.
5. EXISTING FINDING: field mobile flow exists, but the `Finding` bottom tab points to a fragment rather than a first-class capture page.

## New Findings

1. NEW FINDING: Several dynamic details are route-present but seed-only: non-canonical work orders, service requests, assets, BIM records, findings, purchases, and vendors fall back to `EmptyState`.
2. NEW FINDING: global `+ New Dispatch / Request` opens a command palette, but there is no complete create-dispatch/create-WO workflow.
3. NEW FINDING: reports have list/query/export behavior, but no route-level report dossier detail/result page.
4. NEW FINDING: PM plans, inventory SKUs, audit events, and facility rooms have rich inline representations but no route-level detail/history pages.
5. NEW FINDING: many actions are toast-only simulations; product architecture needs action result states and durable history.

## Priority Counts

- Missing pages identified: 24
- P0 missing pages: 5
- P1 missing pages: 9
- P2 missing pages: 7
- P3 missing pages: 3
- Incomplete workflows: 12
- Missing/important state gaps: 22
- Responsive inconsistencies: 4
- Shared logic opportunities: 15
- Screenshot asset issues: 2

## Top Next Build

1. Generic Work Order Detail coverage for every linked WO, not only `WO-2026-0894`.
2. Global New Dispatch / Create Work Order flow launched from topbar and command palette.
3. Field Finding Capture page linked from FieldShell `Finding`.
4. Generic Purchase/PR/PO Detail coverage for list rows and notification approvals.
5. Report Dossier Detail / Generated Result page.
