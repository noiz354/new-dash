# GAP-07 Spec — Impersonation fake-audit → honest placeholder

## Problem (audit F29)

- `ProfileSessions`: `setImpersonating(true)` + banner "actions are
  audit-chained" + toast "audit chain on" — nol write, nol session change.
- `OrgHub`: dialog reason + PIN `2468` → toast "Impersonation session
  started · reason logged · 30-min tablet window" — nol API, nol audit row.
- Klaim "audit-chained / fully logged / reason logged" = fake success di
  fitur security-sensitif (P0-adjacent).

## Decision (opsi "cabut klaim")

Tidak ada endpoint audit-write generik (dan membuatnya agar klien bisa
menulis audit arbitrer = security smell). Impersonasi server-side asli
(session-swap) = big rock + butuh product decision. Maka:

- Hapus seluruh teater impersonasi di kedua file (state, banner, dialog,
  PIN 2468, toast).
- Ganti dengan honest disabled placeholder: "Audit Impersonate — Requires a
  server-issued impersonation session. Not available in this build; the
  action is disabled rather than simulated."
- Guard test: grep menegaskan frasa fiksi hilang dari kedua file.

## Tests

- tests/audit-truthfulness.test.ts: blok GAP-07 — kedua file bebas dari
  `audit-chained`, `audit chain on`, `reason logged`, `fully logged`,
  `Impersonation session started`, `2468` (PIN demo), `Impersonating`;
  placeholder jujur hadir (`server-issued`, `disabled rather than
  simulated`).

## Runtime

MCP browser dev :3145 sebagai m.vance: /profile → tombol disabled +
copy jujur; /organization → tombol disabled; console bersih; reload persist
(disabled tetap disabled — tidak ada state palsu).
