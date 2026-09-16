# Second-Pass Audit

## Method

OBSERVED: This pass did not restart from zero. It used first-pass `screen-audits/*.md` as prior evidence, then read current route/source structure to distinguish old screenshot gaps from current application gaps.

OBSERVED inspected files and sources:

- `screen-audits/summary.md`
- all first-pass files in `screen-audits/*.md`
- `../PROGRESS.md`
- `../TODO.md`
- `../docs/ui-audit/navigation-audit.md`
- `../docs/AUDIT_MULTI_PAGE_READINESS.md`
- `../docs/DECISIONS_M4_M5_M6.md`
- route tree under `../app`
- interaction and shell components under `../components`

OBSERVED current route-level pages: 28.

OBSERVED first-pass screenshot sources: 21 PNGs.

## Existing Findings Confirmed

| Existing Finding | Status In Second Pass | Architectural Meaning |
|---|---|---|
| Mobile bottom-nav artifacts in purchasing/vendors | EXISTING FINDING confirmed in screenshots; current app scopes `FieldShell` to `(field)` routes | Isolated Stitch artifact in reference set; keep as QA regression check so desktop routes never render `FieldShell`. |
| Wrong active navigation in reports/notifications screenshots | EXISTING FINDING confirmed in screenshots; current `OpsShell.activeFromPath()` maps `/reports` and `/notifications` correctly | Screenshot/reference issue, not current app shell issue. Still keep visual QA check. |
| Two asset filename mismatches | EXISTING FINDING confirmed | Tooling risk for scripts that assume `screen.png`; do not rename unless explicitly requested. |
| Critical actions need confirmation guard | EXISTING FINDING expanded | `ConfirmDialog` exists, but it lacks first-class variants for reason input, PIN, async loading, failure recovery, and undo. |
| Field mobile bottom navigation | EXISTING FINDING refined | Correctly exists for `/field/*`; `Finding` tab currently points to a run-page fragment instead of a distinct finding capture page. |

## New Findings

1. NEW FINDING — seed-only dynamic routes.
   OBSERVED: These current routes validate ID formats but fall back to `EmptyState` for non-seed records: `/work-orders/[id]`, `/service-requests/[id]`, `/assets/[id]`, `/assets/[id]/bim`, `/field/findings/[id]`, `/field/audits/[id]/run`, `/purchasing/[id]`, `/vendors/[id]`.
   INFERRED: The app now has routes, but entity lifecycle coverage remains partial because many table rows link to records without real detail content.
   RECOMMENDED: Build generic detail templates/data coverage for listed seeded rows before adding new domains.

2. NEW FINDING — global create dispatch is not a complete create flow.
   OBSERVED: `TopBar` opens `CommandPalette`; palette navigates to known records/routes.
   INFERRED: The prominent global `+ New Dispatch / Request` still does not complete a create-dispatch/create-WO workflow.
   RECOMMENDED: Add a create dispatch flow with draft, validation, asset/location prefill, review, success, and failure states.

3. NEW FINDING — report generation lacks a destination page.
   OBSERVED: `ReportsHub` contains dossiers, query builder, print/export, and scheduling behavior, but no `/reports/[id]` or generated-result route exists.
   INFERRED: Reports are operational outputs and need review/share/export state separate from the hub.
   RECOMMENDED: Add report dossier detail/generated result route.

4. NEW FINDING — rich inline entities lack route-level history/detail.
   OBSERVED: PM plans, inventory SKUs, facility rooms, audit events, notification items, RBAC users, settings backup jobs, and telemetry nodes appear as actionable entities but remain inline.
   INFERRED: Not every inline entity needs a page, but history/detail pages are required where rows are linked, audited, printed, approved, or revisited.
   RECOMMENDED: Promote only evidence-backed entities listed in the priority matrix.

5. NEW FINDING — action outcomes are mostly toast-only.
   OBSERVED: many operations mutate local state and show toast: receive stock, post mutation, approve/reject, deploy, restore simulation, rotate key, issue credential, flag review.
   INFERRED: Product architecture needs durable result screens or activity/history destinations for audit-heavy actions.
   RECOMMENDED: centralize action result, audit link, retry/failure, and undo semantics.

## Current Screen Inventory

| Canonical Page | Route | Source Screenshot | Class | Domain | Purpose | Major Actions | Related Screens |
|---|---|---|---|---|---|---|---|
| Operations Dashboard | `/` | `operations_dashboard/screen.png` | CORE PAGE | Operations | Dispatch overview and telemetry | open WO, view queue | Work orders, notifications, reports |
| Work Orders List | `/work-orders` | inferred from app | CORE PAGE | Work Order | Search/filter WO records | new WO, export, quick actions | WO detail |
| Work Order Detail | `/work-orders/[id]` | `work_order_management_execution_hub/screen.png` | DETAIL PAGE | Work Order | Execute critical WO | hold, escalate, sign off, print, parts | asset, SR, finding, inventory |
| Service Requests List | `/service-requests` | inferred from app | CORE PAGE | Service Request | Triage queue list | new request, export | SR detail |
| Service Request Detail | `/service-requests/[id]` | `service_requests_triage_hub/screen.png` | DETAIL PAGE | Service Request | Convert SR to WO | convert, zone, asset pick | WO, asset, finding |
| Preventive Maintenance | `/preventive-maintenance` | `preventive_maintenance_scheduling_automation_hub/screen.png` | CORE PAGE | PM Plan | Schedule automation hub | generate WOs, new plan, simulate | WO, shift plan, asset |
| Field Audits | `/field/audits` | `field_inspections_audit_queue_hub/screen.png` | CORE PAGE / RESPONSIVE VARIANT | Inspection | Mobile audit queue | open run, sync | run, sync |
| Field Run Checklist | `/field/audits/[id]/run` | `mobile_field_inspection_execution_desk/screen.png` | DETAIL PAGE / RESPONSIVE VARIANT | Inspection | Run checklist in field | PASS/FAIL, upload, submit | finding, sync, WO |
| Field Sync | `/field/sync` | no first-pass screenshot | UTILITY PAGE | Inspection Sync | Offline queue/status | retry, sync all | field audits |
| Finding Desk | `/field/findings/[id]` | `inspection_findings_auto_wo_conversion_desk/screen.png` | DETAIL PAGE | Finding | Convert defect to WO | dismiss, schedule, convert | field run, WO, asset |
| Asset Registry | `/assets` | `asset_registry_lifecycle_management_ledger/*.png` | CORE PAGE | Asset | Asset search and selection | register, QR, transfer, decommission | asset detail, BIM |
| Asset Detail | `/assets/[id]` | `asset_detail_spare_parts_inventory_ledger/*.png` | DETAIL PAGE | Asset | Asset lifecycle and BOM | issue, PR/PO, inspect, BIM | WO, vendor, field run |
| Asset BIM | `/assets/[id]/bim` | inferred from app | UTILITY PAGE | Asset/Facility | Schematic viewer | layer toggles, node drawer | asset detail, WO |
| Facilities | `/facilities` | `facility_locations_spatial_hierarchy_management/screen.png` | CORE PAGE | Facility Location | Spatial topology | edit polygon, print QR, room audit | asset, WO, field |
| Inventory | `/inventory` | `inventory_spare_parts_management_ledger/screen.png` | CORE PAGE | Inventory/SKU | SKU ledger and mutation | receive, transfer, issue, export | PO, WO, PM |
| Purchasing List | `/purchasing` | `purchasing_pos_management_hub/screen.png` | CORE PAGE | PR/PO/GRN | Procurement queue | new PR/PO, export | purchase detail, vendor |
| Purchase Detail | `/purchasing/[id]` | inferred from app + purchasing screenshot | DETAIL PAGE | PR/PO/GRN | Review/receive/match/sign | authorize, reject, GRN, dispute, print | vendor, asset, WO |
| Purchase Print | `/purchasing/[id]/print` | no first-pass screenshot | UTILITY PAGE | Purchase | Print PO dossier | print | purchase detail |
| Vendors List | `/vendors` | `vendors_contractors_management_hub/screen.png` | CORE PAGE | Vendor | Vendor directory | onboard, renew, export | vendor detail |
| Vendor Detail | `/vendors/[id]` | inferred from app + vendor screenshot | DETAIL PAGE | Vendor | MSA/vendor profile | PDF, amend, dispatch, commend | PO, WO, asset |
| Reports | `/reports` | `reports_analytics_hub/screen.png` | REPORTING PAGE | Report | Analytics/query/dossiers | schedule, export, query | missing report detail |
| Audit Trail | `/audit-trail` | `audit_trail_system_logs_hub/screen.png` | REPORTING PAGE / UTILITY PAGE | Audit Event | Immutable event ledger | export, verify, proof, flag | entity details |
| Notifications | `/notifications` | `notifications_sla_alerts_hub/screen.png` | CORE PAGE | Notification/Alert | Alert handling and routing | mark read, approve, reject, revoke | WO, inventory, field, audit |
| Organization | `/organization` | `organization_rbac_governance_hub/screen.png` | SETTINGS PAGE | User/Role | RBAC and roster | edit, reset MFA, impersonate, deactivate, deploy | audit, profile |
| Settings | `/settings` | `settings_system_configuration/screen.png` | SETTINGS PAGE | Tenant/System | System configuration | save, reset, restore, rotate, issue | audit, profile |
| Login | `/login` | no first-pass screenshot | UTILITY PAGE | Auth | Login/MFA/SSO | sign in, SSO, MFA | profile, org |
| Profile/Sessions | `/profile` | avatar source only | UTILITY PAGE | User Session | Profile and session management | revoke, print badge, rotate key | audit, organization |
| Shift Plan | `/shifts/plan` | no first-pass screenshot | UTILITY PAGE | Shift | Shift planning/handover | accept, open WO/run | PM, WO, field |

## Domain Entity Lifecycle Matrix

| Entity | List | Detail | Create | Edit | Delete/Archive | Restore | Search/Filter/Sort | Bulk | Status Transition | History/Activity | Related Entities | Permissions | Empty/Error State |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Work Order | IMPLEMENTED | PARTIAL seed-only for many IDs | PARTIAL via dialogs/palette intent | PARTIAL inline actions | PARTIAL hold/cancel unclear | NOT APPLICABLE | IMPLEMENTED list | PARTIAL | PARTIAL | PARTIAL ledger/audit | Asset, SR, Finding, Parts | PARTIAL | PARTIAL EmptyState |
| Service Request | IMPLEMENTED | PARTIAL seed-only | PARTIAL new dialog | PARTIAL zone/asset | PARTIAL reject/duplicate | NOT APPLICABLE | IMPLEMENTED | PARTIAL batch triage | PARTIAL converted/rejected | PARTIAL chat/history | WO, Asset | PARTIAL | PARTIAL |
| Inspection/Audit | IMPLEMENTED | PARTIAL seed-only run | PARTIAL template create | PARTIAL checklist | PARTIAL dismiss/fail | UNCLEAR | PARTIAL | UNCLEAR | IMPLEMENTED PASS/FAIL | PARTIAL sync/evidence | Finding, WO, Asset | PARTIAL PIN | PARTIAL offline/skeleton |
| Finding/Defect | PARTIAL list embedded | PARTIAL seed-only | MISSING mobile capture page | PARTIAL triage | PARTIAL dismiss reason | NOT APPLICABLE | PARTIAL | UNCLEAR | PARTIAL convert/schedule/dismiss | PARTIAL | WO, Inspection, Asset | PARTIAL LOTO | PARTIAL |
| Asset | IMPLEMENTED | PARTIAL seed-only | PARTIAL register dialog | PARTIAL transfer/docs | PARTIAL decommission confirm | UNCLEAR | IMPLEMENTED | PARTIAL QR | PARTIAL health/decommission | IMPLEMENTED | WO, PM, Parts, BIM | PARTIAL | PARTIAL |
| Facility Location | PARTIAL tree hub | MISSING route-level room detail | PARTIAL add room | PARTIAL polygon | UNCLEAR | UNCLEAR | PARTIAL tree filter | NOT APPLICABLE | PARTIAL critical/nominal | PARTIAL | Asset, WO, Audit | UNCLEAR | UNCLEAR |
| Inventory SKU / Part | IMPLEMENTED table | MISSING SKU detail | PARTIAL receive/add SKU | PARTIAL mutation desk | PARTIAL adjust | UNCLEAR | IMPLEMENTED | PARTIAL | PARTIAL stock states | IMPLEMENTED ledger | WO, PO, Asset | PARTIAL PIN | PARTIAL |
| Purchase / PR / PO / GRN | IMPLEMENTED | PARTIAL seed-only | PARTIAL dialog | PARTIAL tabs/dispute | PARTIAL reject | UNCLEAR | IMPLEMENTED | PARTIAL batch print | PARTIAL PR→PO→GRN | PARTIAL | Vendor, Inventory, WO | PARTIAL PIN/quorum | PARTIAL |
| Vendor / Contractor | IMPLEMENTED | PARTIAL seed-only | PARTIAL onboard dialog | PARTIAL amend dialog | UNCLEAR | UNCLEAR | IMPLEMENTED | UNCLEAR | PARTIAL MSA renew | PARTIAL | PO, WO, Docs | PARTIAL | PARTIAL |
| Report / Dossier | IMPLEMENTED hub | MISSING report detail | PARTIAL custom query | PARTIAL schedule | UNCLEAR | UNCLEAR | PARTIAL filter | NOT APPLICABLE | PARTIAL generated/exported | MISSING run history | Asset/WO/Inventory | UNCLEAR | UNCLEAR |
| Audit Event | IMPLEMENTED ledger | MISSING event detail route | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE immutable | NOT APPLICABLE | IMPLEMENTED | PARTIAL export | IMPLEMENTED flag/proof | IMPLEMENTED inline | All entities | PARTIAL | PARTIAL |
| Notification / Alert | IMPLEMENTED feed | PARTIAL item cards, no detail route | NOT APPLICABLE | PARTIAL routing prefs | PARTIAL dismiss/mark read | UNCLEAR | IMPLEMENTED | PARTIAL mark all | PARTIAL read/authorized/revoked | PARTIAL | WO/PO/Inventory/Audit | PARTIAL | PARTIAL |
| User / Role / Session | IMPLEMENTED roster | PARTIAL inline detail/profile | PARTIAL provision | PARTIAL assignment | PARTIAL deactivate/revoke | UNCLEAR | IMPLEMENTED | UNCLEAR | PARTIAL MFA/session/deploy | PARTIAL audit | Audit, Profile | IMPLEMENTED-ish | PARTIAL |
| System Setting / Credential | IMPLEMENTED tabs | PARTIAL inline dialogs | PARTIAL credential issue | PARTIAL edit endpoints | PARTIAL reset/purge | PARTIAL restore simulation | NOT APPLICABLE | NOT APPLICABLE | PARTIAL saved/dirty | MISSING job history | Audit | PARTIAL PIN | PARTIAL |

## Navigation Gaps

| Source | Action | Expected Destination | Actual Destination If Known | Classification |
|---|---|---|---|---|
| TopBar | `+ New Dispatch / Request` | Create dispatch / create WO flow | Command palette with links to existing records | MISSING DESTINATION / PARTIAL |
| CommandPalette | Open seeded entities | Existing detail/list routes | Connected for seeded routes | CONNECTED |
| WorkOrders list / dashboard rows | Open any WO | `/work-orders/[id]` real detail | non-canonical IDs show EmptyState | MISSING DESTINATION for record coverage |
| ServiceRequests list | Open any SR | `/service-requests/[id]` real detail | non-canonical IDs show EmptyState | MISSING DESTINATION for record coverage |
| Purchasing list | Open PR/PO row | `/purchasing/[id]` real detail | only canonical PO has full detail | MISSING DESTINATION for record coverage |
| Vendors list | Open vendor row | `/vendors/[id]` real detail | only Trane has full detail | MISSING DESTINATION for record coverage |
| Asset registry | Open asset row | `/assets/[id]` real detail | only canonical asset full detail | MISSING DESTINATION for record coverage |
| FieldShell | Finding tab | first-class mobile capture page | fragment `#finding-capture` on run route | AMBIGUOUS |
| Reports table/actions | Preview dossier | report detail/generated result | no `/reports/[id]` | MISSING DESTINATION |
| Audit event stream | event/entity links | entity detail or event detail | entity links exist, event detail inline only | PARTIAL |
| Notifications | PO approve/reject/revoke | inline guarded action + audit trail | mostly inline | MODAL ACTION / PARTIAL |
| Facilities | room/tree selection | room detail/history | inline only | PARTIAL |

RECOMMENDED: Treat wrong active nav in screenshots as visual QA, not navigation architecture failure, because current `OpsShell` maps active state correctly.

## Missing Pages

| Priority | Missing Page | Trigger / Evidence | Existing Source Page | Why Needed | Required States | Related Entity | Suggested Route |
|---|---|---|---|---|---|---|---|
| P0 | Generic Work Order Detail coverage | Dashboard/list/PM/inventory links to many WO IDs | `/`, `/work-orders`, PM, inventory | Primary dispatch workflow breaks outside canonical WO | loading, missing record, locked, cancelled, completed, signoff pending | Work Order | `/work-orders/[id]` data coverage |
| P0 | New Dispatch / Create Work Order flow | global topbar CTA and command palette | all ops pages | Main create action is not a create workflow | draft, validation, review, submitting, success, failure, duplicate | Work Order | `/work-orders/new` or modal route |
| P0 | Mobile Finding Capture | FieldShell `Finding` tab | `/field/audits/[id]/run` | Field user needs direct finding creation before/after checklist | offline, photo upload, validation, queued sync, submitted | Finding | `/field/findings/new` |
| P0 | Generic Purchase/PR/PO Detail coverage | purchasing rows and notifications target PR/PO IDs | `/purchasing`, `/notifications` | Procurement review/approval is central and currently seed-limited | review, receiving, match, signatures, rejected, dispatched | Purchase | `/purchasing/[id]` data coverage |
| P0 | Action result/audit handoff pattern | critical actions toast-only | notifications, settings, inventory, org | Safety-critical actions need durable result and audit trace | loading, success, failure, audit link, retry, undo where safe | Cross-cutting | shared pattern |
| P1 | Report Dossier Detail / Generated Result | report table preview/export/query builder | `/reports` | Reports need reviewable result page before export/share | loading, generating, ready, failed, scheduled | Report | `/reports/[id]` |
| P1 | PM Plan Detail/Create/Edit | plan table, new plan, generation queue | `/preventive-maintenance` | PM lifecycle needs plan inspection and edit, not only hub | draft, active, paused, overdue, generated | PM Plan | `/preventive-maintenance/[id]`, `/preventive-maintenance/new` |
| P1 | Inventory SKU Detail | SKU rows, issue/reorder actions, QR/barcode | `/inventory`, asset BOM | SKU has ledger, bins, reserved, reorder lifecycle | low stock, reserved, backordered, no movements | SKU | `/inventory/[sku]` |
| P1 | Facility Room Detail | spatial tree and room metrics | `/facilities` | Room is a recurring operational location with assets/WO/audits | normal, critical, empty room, sensor stale | Facility Location | `/facilities/[locationId]` |
| P1 | Notification Target Resolver | heterogeneous alert cards | `/notifications` | Alerts target WO/PO/inventory/security with different outcomes | unread, read, acted, muted, escalated | Notification | inline resolver + `/notifications/[id]` optional |
| P1 | Audit Event Detail / Proof | stream rows, proof download, flag review | `/audit-trail` | Immutable proof should have stable permalink | verified, mismatch, flagged, proof downloaded | Audit Event | `/audit-trail/[eventId]` |
| P1 | User Detail / Role History | roster selected user, reset/deactivate/impersonate | `/organization`, `/profile` | RBAC audit needs per-user history and access timeline | active, deactivated, pending MFA, impersonating | User | `/organization/users/[id]` |
| P1 | Settings Job History | restore, reset counters, purge, credential issue | `/settings` | Admin jobs need status and audit trace | queued, running, completed, failed, rolled back | Setting Job | `/settings/jobs/[id]` |
| P1 | Service Request Detail coverage for all list rows | list rows route to details | `/service-requests` | Non-canonical tickets currently seed-limited | new, triaged, converted, rejected, breached | Service Request | `/service-requests/[id]` data coverage |
| P2 | Vendor lifecycle coverage for all seeded vendors | list rows route to details | `/vendors` | Vendor list implies detail for ABB/JCI/Siemens/Grainger | active, expired, renewal due, suspended | Vendor | `/vendors/[id]` data coverage |
| P2 | Asset/BIM coverage for non-canonical assets | registry rows route to assets/BIM | `/assets` | Asset registry should support multiple asset records | healthy, caution, critical, decommissioned | Asset | `/assets/[id]`, `/assets/[id]/bim` data coverage |
| P2 | Vendor Document / MSA Detail | PDF viewer/amendment | `/vendors/[id]` | MSA docs are auditable contract artifacts | viewed, expired, amended, signed | Vendor Document | `/vendors/[id]/documents/[docId]` |
| P2 | Purchase Invoice / 3-Way Match Result | match tab, invoice references | `/purchasing/[id]` | PO→GRN→invoice chain is visible but not separately reviewable | matched, disputed, exception | Invoice/Match | `/purchasing/[id]/match` or tab route |
| P2 | Asset Document Detail | technical docs and uploads | `/assets/[id]` | docs have view/download/upload controls | uploaded, signed, missing, expired | Asset Document | `/assets/[id]/documents/[docId]` |
| P2 | Shift Handover Detail | shift plan and WO handover | `/shifts/plan`, WO detail | handover is cross-shift stateful action | draft, accepted, rejected, stale | Shift | `/shifts/handover/[id]` |
| P2 | Saved Search / Filter Views | many tables support filters | list pages | recurring operational views need persistence | saved, dirty, shared, reset | Cross-cutting | no route required or `/views/[id]` |
| P3 | Print Work Permit | print action in WO | WO detail | print-specific artifact beyond current browser print | print preview, printed | Work Permit | `/work-orders/[id]/permit` |
| P3 | Badge/QR Print Library | asset/facility/profile print | assets/facilities/profile | reusable print templates | preview, printed | Cross-cutting | shared print route/template |
| P3 | Component State Gallery Route | ui state patterns are references | `ui_state_variants_patterns` | useful for QA/dev but not product route | all state fixtures | Design system | `/dev/ui-states` optional |

## Incomplete Workflows

| Workflow | Current State | Classification | Gaps |
|---|---|---|---|
| Dispatch dashboard → WO → execute → sign off | seeded detail exists | PARTIAL | non-seed WO detail, create flow, completed/cancelled states |
| New dispatch/request | palette navigates to known routes | MISSING | no draft/review/success route or modal |
| Service request triage → WO conversion | seeded SR detail exists | PARTIAL | all-row detail coverage, duplicate/reject final states |
| Field audit → finding capture → sync → WO | queue/run/sync exist | PARTIAL | dedicated finding capture route; offline error/result states |
| Finding → auto-WO conversion | seeded finding detail exists | PARTIAL | non-seed finding detail and conversion result history |
| PR/PO → approval → GRN → 3-way match | canonical PO detail exists | PARTIAL | all-row detail coverage; invoice/match result page |
| Vendor onboarding/renewal/amendment | dialogs and Trane detail exist | PARTIAL | multi-vendor details, document lifecycle |
| Inventory receive/issue/transfer | hub mutates state | PARTIAL | SKU detail, mutation result/audit handoff |
| PM plan → generate WOs → shift workload | hub exists | PARTIAL | PM plan detail/edit, generation result |
| Facility room → defect/audit/asset | hub inline exists | PARTIAL | room detail route, defect/audit creation flow |
| Report query → generated dossier → export | hub exists | PARTIAL | generated report detail/result |
| RBAC edit/deploy/deactivate | hub exists | PARTIAL | role/user history, deploy result/audit link |

## Action Safety Audit

| Action | Screens | Existing Guard | Recommended Interaction |
|---|---|---|---|
| Decommission asset | Asset Registry | ConfirmDialog | Keep ConfirmDialog; add permission, reason, async failure, audit link. |
| Revoke session/bypass | Profile, Notifications | ConfirmDialog in app | Add reason/PIN variant for security bypass; show audit event link. |
| Reject PR / Reject PO | Purchasing, Notifications | reason dialog exists in some places | Standard destructive reason dialog with loading/failure. |
| Authorize PO / approve reorder | Purchasing, Notifications | PIN in some flows; ConfirmDialog in reorder | Use double-step for spend over threshold; include budget and quorum preview. |
| Reset counters / purge staging / restore | Settings | ConfirmDialog for some actions | Add job status page/history and failure recovery. |
| Rotate / issue API credential | Settings/Profile | partial dialog/PIN | Require PIN, one-time reveal, copy guard, audit link. |
| Deploy RBAC rules / discard changes | Organization | partial buttons/dialog | Confirm role diff, loading, rollback/failure state. |
| Submit field audit and auto-dispatch WO | Field run | dialog/toast | Require final review, offline queued state, generated WO link. |
| Convert/dismiss finding | Finding desk | dialog/toast | Require LOTO guard, reason for dismiss, conversion result page. |
| Inventory post mutation / receive stock | Inventory | PIN/validation partial | Require idempotency key, confirmation, durable ledger event link. |

RECOMMENDED shared primitive: `ConfirmDialog` should become a family: `ConfirmDialog`, `ReasonConfirmDialog`, `PinConfirmDialog`, `SpendApprovalDialog`, `AsyncActionDialog`, and `UndoToast`.

## Missing States

| Page/Flow | Important Missing Or Partial States |
|---|---|
| Dynamic detail routes | real non-seed populated state; record not found; permission denied |
| Work order detail | cancelled, completed, sign-off rejected, locked by another tech, parts unavailable |
| Create dispatch | draft, validation error, duplicate detected, submitting, created |
| Service request conversion | duplicate SR, conversion failed, converted already, rejected with reason |
| Field audit | offline upload failed, queued photo/audio, sync conflict, supervisor PIN failure |
| Finding capture | no camera permission, evidence missing, GPS unavailable, queued offline |
| Purchase detail | invoice mismatch, approval timeout, rejected, dispatched, partial receipt |
| Vendor detail | expired/suspended, document missing, amendment pending, dispatch blocked by MSA |
| Inventory | filtered empty, mutation failure, insufficient quantity, reserved conflict |
| PM plan | paused, disabled, generated batch success/failure, stale SCADA |
| Facility blueprint | no blueprint, sensor offline, no assets, permission denied edit |
| Reports | generating, scheduled, failed, no result, export failed |
| Audit trail | hash mismatch, event not found, proof download failed |
| Notifications | all read, muted, escalated, action failed, item resolved |
| Organization | deploy failed, unsaved matrix changes, user deactivated, MFA enrollment pending |
| Settings | unsaved changes, save failed, restore running, credential reveal expired |

## Shared Logic Opportunities

| Shared Logic | Used By | Current Evidence | Recommended Abstraction |
|---|---|---|---|
| ID parsing/validation | all dynamic routes | `ID_FORMATS`, seed guards | Extend to central entity resolver + not-found copy. |
| Active route mapping | shell/nav | `OpsShell.activeFromPath`, `SideNav` | Single route registry consumed by nav, breadcrumbs, palette. |
| Field navigation | field routes | `FieldShell` | Keep route group isolation; add first-class Finding route. |
| Confirm/critical action | settings, org, notifications, assets, profile | `ConfirmDialog` plus custom dialogs | Confirm dialog family with reason/PIN/async variants. |
| Toast/action result | almost all client components | local toast arrays | Shared toast + action receipt component with audit link. |
| Export/download | reports, audit, inventory, vendors, purchasing | duplicated Blob helpers | `downloadFile()` utility with filename policy. |
| Pagination/filter/search | lists and ledgers | repeated local state | table controller hook. |
| Status badges | all domains | `Badge`, variants | entity-specific status maps. |
| Currency/date/time | purchasing, reports, inventory | literals and `wibNow` | centralized formatters for WIB, UTC, currency. |
| Empty/seed-only state | dynamic routes | repeated `EmptyState` copy | entity-aware fallback with related links. |
| Print templates | purchase, profile, assets, facilities, WO | `window.print()` usage | print layout registry. |
| Permission guard | org/settings/critical actions | partial PIN/role copy | policy helper and disabled-state reason. |
| Breadcrumb generation | many pages | manual breadcrumbs | route registry + entity labels. |
| Query param prefill | assets, SR, purchasing | `?tab`, `?asset`, `?wo` patterns | typed query contract. |
| Offline/sync | field only now | `FieldOffline`, sync queue | shared offline action queue for field-critical actions. |

## Responsive Issues

1. EXISTING FINDING: purchasing/vendors screenshots show field bottom nav over desktop content. Current app layout prevents this; keep regression test.
2. NEW FINDING: current desktop tables rely on horizontal overflow and seed data; mobile card equivalents are uneven across domains.
3. NEW FINDING: dynamic detail pages with right rails need consistent drawer/collapse behavior on tablet.
4. NEW FINDING: field `Finding` nav target is a fragment, which is fragile on mobile and not equivalent to route-level state.

## Screenshot Asset Integrity

| Directory | Expected | Actual | Classification | Impact |
|---|---|---|---|---|
| `asset_registry_lifecycle_management_ledger` | `screen.png` | `asset_registry_lifecycle_management_ledger.png` | TOOLING RISK | Audit scripts that assume `screen.png` skip it. |
| `asset_detail_spare_parts_inventory_ledger` | `screen.png` | `asset_detail_spare_parts_inventory_ledger.png` | TOOLING RISK | Same skip risk; first pass handled fallback. |

RECOMMENDED: Do not fix/rename in this task. Future audit tooling should use `*.png` fallback and report filename mismatch.

## Priority Matrix

See "Missing Pages" above for full matrix. Counts:

- P0: 5
- P1: 9
- P2: 7
- P3: 3

## Recommended Product Tree

```text
Application
├── Operations Dashboard [EXISTS]
├── Work Orders [EXISTS]
│   ├── Work Order List [EXISTS]
│   ├── Work Order Detail [PARTIAL seed-only]
│   ├── Create Dispatch / Work Order [MISSING]
│   ├── Work Permit Print [MISSING/P3]
│   └── Work Order Activity / Signoff Result [PARTIAL]
├── Service Requests [EXISTS]
│   ├── Service Request List [EXISTS]
│   ├── Service Request Detail [PARTIAL seed-only]
│   └── Convert To Work Order [PARTIAL]
├── Field [EXISTS]
│   ├── Audit Queue [EXISTS]
│   ├── Run Checklist [PARTIAL seed-only]
│   ├── Finding Capture [MISSING]
│   ├── Finding Triage Detail [PARTIAL seed-only]
│   └── Sync Queue [EXISTS]
├── Assets [EXISTS]
│   ├── Asset Registry [EXISTS]
│   ├── Asset Detail [PARTIAL seed-only]
│   ├── Asset BIM [PARTIAL seed-only]
│   └── Asset Documents [MISSING/P2]
├── Facilities [EXISTS]
│   ├── Spatial Hub [EXISTS]
│   └── Room Detail [MISSING]
├── Inventory [EXISTS]
│   ├── Inventory Ledger [EXISTS]
│   ├── SKU Detail [MISSING]
│   └── Mutation Result / Ledger Event [PARTIAL]
├── Preventive Maintenance [EXISTS]
│   ├── PM Hub [EXISTS]
│   ├── PM Plan Detail [MISSING]
│   └── PM Plan Create/Edit [MISSING]
├── Purchasing [EXISTS]
│   ├── Purchasing List [EXISTS]
│   ├── Purchase Detail [PARTIAL seed-only]
│   ├── 3-Way Match / Invoice Result [MISSING/P2]
│   └── Purchase Print [EXISTS]
├── Vendors [EXISTS]
│   ├── Vendor List [EXISTS]
│   ├── Vendor Detail [PARTIAL seed-only]
│   └── Vendor Documents / MSA [MISSING/P2]
├── Reports [EXISTS]
│   ├── Reports Hub [EXISTS]
│   └── Report Dossier Detail / Generated Result [MISSING]
├── Notifications [EXISTS]
│   ├── Alert Feed [EXISTS]
│   └── Notification Target Resolver [PARTIAL]
├── Audit Trail [EXISTS]
│   ├── Audit Ledger [EXISTS]
│   └── Audit Event Detail / Proof [MISSING]
├── Organization & RBAC [EXISTS]
│   ├── Roster / Matrix [EXISTS]
│   └── User Detail / Role History [MISSING]
├── Settings [EXISTS]
│   ├── Settings Tabs [EXISTS]
│   └── Settings Job History [MISSING]
├── Auth [EXISTS]
│   └── Login / MFA [EXISTS]
├── Profile [EXISTS]
└── Shift Plan [EXISTS]
```

## Page-By-Page Gap Matrix

| Existing Page | What Exists | Missing Destination | Missing Flow | Missing States | Shared Logic Opportunity | Priority |
|---|---|---|---|---|---|---|
| `/` | dashboard + linked queue | non-seed WO details | create dispatch | filtered empty, loading | route registry, KPI cards | P0 |
| `/work-orders` | list | non-seed WO details | create/edit/status lifecycle | archived/cancelled/completed | DataTable, status maps | P0 |
| `/work-orders/[id]` | canonical detail | generic WO coverage | signoff/result history | terminal/failure states | action receipt, parts ledger | P0 |
| `/service-requests` | list | non-seed SR detail | batch triage result | no results, duplicate | table controller | P1 |
| `/service-requests/[id]` | canonical detail | all SR records | convert/reject lifecycle | converted already/failure | entity resolver | P1 |
| `/field/audits` | mobile queue | finding capture | queue→run→sync loop | offline conflict | FieldShell | P0 |
| `/field/audits/[id]/run` | canonical run | non-seed run + capture | submit→WO result | upload/GPS/camera failure | offline action queue | P0 |
| `/field/findings/[id]` | canonical triage | mobile new finding | dismiss/convert result | evidence missing | EvidenceViewer | P1 |
| `/assets` | registry | non-seed asset detail | register/transfer result | decommissioned/archived | detail drawer | P2 |
| `/assets/[id]` | canonical asset | all assets/docs | BOM mutation result | stale telemetry | SKU/asset status maps | P2 |
| `/assets/[id]/bim` | canonical BIM | all BIMs | node-to-workflow | no blueprint | blueprint viewer | P2 |
| `/facilities` | spatial hub | room detail | room audit/log defect | sensor offline/no assets | tree/blueprint | P1 |
| `/inventory` | ledger/mutation | SKU detail | mutation result/reorder | insufficient/reserved conflict | currency/ledger utils | P1 |
| `/preventive-maintenance` | PM hub | PM plan detail/create/edit | generate WO result | paused/stale/generated | plan status maps | P1 |
| `/purchasing` | list | non-seed purchase detail | new PR/PO result | rejected/partial receipt | DataTable | P0 |
| `/purchasing/[id]` | canonical detail | all purchase docs | invoice/match result | disputed/failed GRN | approval guard | P0 |
| `/vendors` | list | non-seed vendor detail | onboarding result | expired/suspended | vendor status map | P2 |
| `/vendors/[id]` | canonical detail | docs/MSA detail | amendment lifecycle | pending countersign | document viewer | P2 |
| `/reports` | hub/query | report detail/result | query→generated report | generating/failed | chart/report utilities | P1 |
| `/notifications` | feed/actions | alert resolver/detail | mark/read/action history | muted/escalated/failure | notification handler | P1 |
| `/audit-trail` | ledger/diff | event detail/proof | flag review result | hash mismatch/proof fail | event resolver | P1 |
| `/organization` | roster/matrix | user detail/history | deploy result | unsaved/deploy failed | permission guard | P1 |
| `/settings` | tabs/dialogs | job history | save/restore/credential lifecycle | dirty/save failed | settings job pattern | P1 |
| `/profile` | sessions | session history | revoke/rotate result | current session guard | security action guard | P2 |
| `/shifts/plan` | shift plan | handover detail | accept/reject handover | stale/coverage gap | shift formatting | P2 |

## Next Build Order

| Phase | Pages / Features | Dependencies | Rationale | Complexity |
|---|---|---|---|---|
| A — Broken/incomplete navigation | Field finding route, global create dispatch target, non-seed WO/purchase route coverage | route registry, entity resolver | Fixes primary dead ends and fragment target | L |
| B — Critical missing destination pages | generic WO detail, generic purchase detail, create dispatch | CANON IDs, shared status maps | Completes main operational and procurement flows | XL |
| C — Entity lifecycle completion | PM plan detail, SKU detail, report dossier detail, room detail | DataTable + route templates | Turns hubs into navigable product architecture | XL |
| D — Shared interaction infrastructure | ConfirmDialog variants, action receipt, toast/audit link, download helper | ui primitives | Reduces duplicated unsafe actions | M |
| E — Application-wide states | loading/error/empty/permission/dirty/offline states by domain | EmptyState, ErrorToast, Skeleton | Moves beyond happy path | L |
| F — Responsive consistency | desktop table→mobile cards, right rail drawer, FieldShell regression | route groups + layout tests | Prevents known nav/layout regressions | L |
| G — Secondary/product-depth pages | audit event detail, vendor docs, asset docs, settings job history, shift handover detail | prior entity pages | Adds audit depth and operational polish | XL |

## Top 10 Next Pages

1. Generic Work Order Detail coverage
   Evidence: many links target `/work-orders/[id]`; current non-seed IDs show EmptyState.
   Entry point: dashboard, lists, PM, inventory, notifications.
   User value: completes dispatch navigation.
   Dependency: work order schema/status maps.
   Priority: P0.
   Why first: almost every domain references WO.

2. Global New Dispatch / Create Work Order
   Evidence: topbar CTA exists everywhere; command palette is navigation-only.
   Entry point: `+ New Dispatch / Request`.
   User value: allows new work to enter system.
   Dependency: asset/location/vendor prefill.
   Priority: P0.
   Why before lower items: create flow underpins WO, SR, facility, vendor dispatch.

3. Mobile Finding Capture
   Evidence: FieldShell has `Finding` tab but it points to a fragment.
   Entry point: field bottom nav.
   User value: field technicians can capture defects directly.
   Dependency: evidence upload/offline queue.
   Priority: P0.
   Why before lower items: completes mobile field loop.

4. Generic Purchase/PR/PO Detail
   Evidence: purchasing list and notifications link to several PR/PO IDs.
   Entry point: `/purchasing`, notifications.
   User value: approval and receiving flows work beyond one seed.
   Dependency: purchase status map.
   Priority: P0.
   Why before lower items: procurement is tied to inventory and WO execution.

5. Shared Action Result / ConfirmDialog Variant System
   Evidence: critical actions are spread across settings/org/inventory/notifications.
   Entry point: critical actions.
   User value: safer destructive and financial operations.
   Dependency: UI primitives.
   Priority: P0.
   Why before lower items: every lifecycle page reuses it.

6. Report Dossier Detail / Generated Result
   Evidence: reports table/query builder lacks destination.
   Entry point: report rows, generate/download.
   User value: review before export/share.
   Dependency: report schema/chart components.
   Priority: P1.
   Why here: closes governance reporting loop.

7. PM Plan Detail/Create/Edit
   Evidence: PM hub has plan rows and new plan action.
   Entry point: `/preventive-maintenance`.
   User value: schedule automation can be inspected and edited.
   Dependency: PM plan model.
   Priority: P1.
   Why here: generates future WOs.

8. Inventory SKU Detail
   Evidence: SKU rows, BOM links, mutation desk.
   Entry point: `/inventory`, asset BOM.
   User value: stock history/reorder decisions per part.
   Dependency: ledger utilities.
   Priority: P1.
   Why here: supports purchasing and WO parts.

9. Facility Room Detail
   Evidence: spatial tree selects rooms with assets/WO/audits.
   Entry point: `/facilities`.
   User value: location-centric operations and defects.
   Dependency: location IDs and blueprint viewer.
   Priority: P1.
   Why here: bridges assets, facilities, and field audits.

10. Audit Event Detail / Proof
   Evidence: audit ledger provides hashes/proof/flag actions inline.
   Entry point: `/audit-trail`.
   User value: stable audit permalink for regulated actions.
   Dependency: audit event resolver.
   Priority: P1.
   Why here: supports action receipt across other flows.
