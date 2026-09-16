# GAP-08 Spec — Honest copy cluster (F31) + EVT-fallback fail-closed (F32)

Source: `docs/audit-non-e2e-remediation-map.md` §F31 + §F32 (decisions: MUST FIX, P1/S/LOCAL).
Rule: **copy-only + one fail-closed logic change. No backend, no new routes, no wiring.**
Mutation-semantics toasts that F13/F15/F19 will replace wholesale get only a
`(local simulation)` qualifier — their full integration stays in their own gaps.

## G8.1 F31 — site table (old → new)

| # | File:line | Old | New |
|---|---|---|---|
| 1 | SideNav:75 | `Live Sync Active` | `Sync: SSE only` |
| 2 | SideNav:119/121 | `Broker: 10.14.0.8` + green `HEALTHY` | `Broker: not configured` + neutral `STANDBY` |
| 3 | NotificationsHub:127 | `paged D. Chen + on-duty VP` | `escalation logged (no pager integration)` |
| 4 | NotificationsHub:303 | `D. Chen paged · P1 bridge opened` | `Escalation logged · bridge not opened (no pager integration)` |
| 5 | NotificationsHub:319 | `paged to B-204 · ETA 12 min` | `dispatch logged · tech not paged (no dispatch integration)` |
| 6 | NotificationsHub:489 | `WS-PUSH: 12ms` | `SSE: 12ms` (transport is genuinely SSE — TASK-26) |
| 7 | ReportsHub:154 | `READ REPLICA: SYNCED` | `direct DB read · no replica` |
| 8 | ReportsHub:104 | `streams from read replica` | `local extract (no replica)` |
| 9 | FacilityHub:161 | `Spatial Sync: Realtime · Broker 10.14.0.8 · HEALTHY` | `Spatial sync: local demo · no broker` |
| 10 | FacilityHub:111 | `crew paged` | `crew notify logged (no pager)` |
| 11 | FacilityHub:105 | `BIM overlay re-synced` | `BIM overlay re-synced (local)` |
| 12 | FacilityHub:257 | `drift 0.00m.` (recalibrate toast) | append ` (local simulation)` |
| 13 | PmHub:85 | `parts + shift leads notified…` | `parts + shift leads notify logged (local simulation)…` |
| 14 | PmHub:93 | `leads paged · parts allocated` | `leads notify logged (no pager) · local simulation` |
| 15 | PmHub:280 | `Broker flagged … pages shift leads` | `Queue flagged … notify logged (local)` |
| 16 | PmHub:287 | badge `DISPATCHED → WO` | badge `DISPATCHED (local) → WO` |
| 17 | dialogs:47 | `PO-2026-0315 DISPATCHED · key …` | append ` (local simulation — no EDI transmit)` |
| 18 | dialogs:50 | badge `PO-2026-0315 DISPATCHED` | `PO-2026-0315 DISPATCHED (local)` |
| 19 | SettingsHub:132 | `production KV-store + 3 node clusters` | `local state only — not persisted` |
| 20 | SettingsHub:279 | `persist to production KV-store & replicated…` | `local demo state — not persisted · TX-{tx} (local)` |
| 21 | SettingsHub:183-184 | `12ms · 1,420 msgs/min · 0 drops` + `SCADA link healthy` | `no link · 0 msgs/min · broker not connected (local demo)` |
| 22 | SettingsHub:195 | `handshake 200 OK` | `handshake not performed (no webhook delivery)` |
| 23 | SettingsHub:307/311 | `Live FX: Fixer.io` / `Exchange sync: Active (Updated 14 mins ago)` | `FX: manual (no Fixer.io integration)` / `Exchange sync: off (no FX integration)` |
| 24 | SettingsHub:333 | re-index toast `GIS + roster rebound.` | append ` (local simulation)` |
| 25 | SettingsHub:446/447/449 | SOC2/backup `Active…` / verified snapshot line | `Planned design (no backup job running)…` / `Not running · (planned: Hourly Diff + Daily Full)` / `No verified snapshot (demo schedule below)` |
| 26 | SettingsHub:491 | `1,420 msgs/min (12ms ping)` | `Not connected (no live ingest)` |
| 27 | SettingsHub:508/510/511 | `99.94% (0 Bounces)` / test-mail toast / `DKIM / SPF Valid` | `no delivery data (local demo)` / `local demo — no mail sent` / `DKIM / SPF: not verified` |
| 28 | SettingsHub:515/517/522 | `Oracle ERP` header / `Synced (…)` / re-sync toast | `Oracle ERP (not connected)` / `Not connected (local demo)` / `local demo — no ERP sync performed` |
| 29 | SettingsHub:533 | `Real-time HTTP event callbacks for … PagerDuty` | prefix `(local registry, no delivery) — …` |
| 30 | SettingsHub:627 | `mTLS Enforced · … present client certs` | `mTLS: not enforced (planned) · …` |
| 31 | SettingsHub:662 | `ingest draining to new broker` | `ingest NOT rerouted (no live broker)` |
| 32 | SettingsHub:30 | `Glacier Deep` (seed retention label) | `Glacier Deep (planned — no backup job)` |
| 33 | SettingsHub:284 | tab suffix `· mTLS Enforced` | `· mTLS planned` |
| 34 | OrgHub:430 | `MFA Enforced · Okta SCIM: 12ms · L30D 0 Breaches` | `MFA policy: local demo · Okta SCIM not configured` |

## G8.2 F32 — EVT-fallback fail-closed (`components/ui/critical-action-dialog.tsx`)

- Current `:75`: `setAuditId(res.auditId || EVT-random)` — fabricates an audit
  ID when the executor returns none. Zero callers in the tree (shared component),
  so fail-closed breaks nothing.
- Fix: `if (!res.auditId)` → `phase 'failure'` with honest message
  `Action response missing audit proof — treated as NOT recorded. Retry.` —
  never render a success panel without a server-issued audit ID.
- Adjacent (same file, same lie): success panel `:213-215` claims
  `Root Merkle Verified` with no client verification anywhere → reword to
  `Audit ID recorded — verify in trail`. (`Merkle` then disappears from this
  file; guard-test asserts it.)

## G8.3 Guard-test (`tests/audit-truthfulness.test.ts`, GAP-08 block)

File-scoped absence checks for every removed string + presence checks for
qualifiers where the old string is a prefix of the new one. New `EVT` check:
`critical-action-dialog.tsx` must not contain `Math.random`.

## G8.4 Explicitly OUT of GAP-08 (stay in their gaps)

- F13/F19/F15 full wiring (PmHub/FacilityHub/PO handlers rewritten there).
- F23 jobs `auditHash` links + F14 vendor-contract `auditHash` links.
- F21 ReportsHub query numbers (`46ms · 412 records`, OPEX `Oracle ERP Sync: 4m ago`).
- F16/F29/F30 PIN-2468 removal (incl. dialog `pinRequired` default).
- F26 KV-backend product decision; F27 shifts badge (GAP-10).

## G8.5 Verification

`npm test` (incl. new GAP-08 block) · `tsc --noEmit` zero new errors ·
MCP browser spot-check `/settings` + `/notifications` honest copy, 0 console errors.
