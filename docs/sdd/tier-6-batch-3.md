# Tier 6 — Batch 3 Governance (45 PROMOTE + 4 (U))

> Detail triase: `docs/triase-batch-3-governance.md`. Dependensi kanon (WO-2024
> vs WO-2026, tenant APX-NUSA-01 vs APX-GL-9021, 6 vs 8 roles, Shift A, PR vs PO,
> Quiet Hours, zona, kontak, screen.png salah sorot, artefak mobile shell,
> ID contoh ui-patterns, presisi logo) TIDAK diputus di sini.

## Dashboard (5)

- Modal Quick Create WO + POST (pola Slice 1: draft→validation→submit).
- Aksi baris inline optimistis (Dispatch/Reassign/Auto-Assign/Expedite) + rollback jujur saat gagal.
- Banner Telemetry Degraded + Retry (wiring dashboard, copy jujur).
- Filter rail via query params + reset; tab chart + skeleton/shimmer + Retry.

## Reports (8)

- Drawer filter dimensi (tune); riwayat job EXP-*/RPT-*; generate/export async (Compiling→Ready, FAILED+Retry).
- Badge replika SYNCED→LAG/STALE (jujur); validasi query builder + preview 0 records; filter kosong + Reset; toast export per baris.

## Audit Trail (1)

- Ekspor log terjadwal berkala (job nyata via queue Tier T3, bukan timer fiksi).

## Notifications (9)

- Modal Reassign Tech; flow transfer antar-crib; markAllRead optimistic + rollback.
- Toggle kanal/preferensi (persist); banner WS putus → label jujur (terkait T1-2 F-COPY).
- Countdown auto-eskalasi + STALE; tab/search/severity via query params + empty message; kartu tetap unread bila gagal.

## Organization (5)

- Auth prod SSO Okta SAML + MFA FIDO2 (terkait T5-2 passkeys; interim: label scope jujur).
- Modal Edit Assignment; sync SCIM per user + retry + webhook log; PUT rules server + rollback (Deploy kini simulated → jadikan nyata atau labeli).
- Validasi modal Provision; banner sesi impersonasi (audit, pola GAP-07).

## Settings (7)

- Dialog konfirmasi destruktif (Reset/Purge/Rotate/Maint); drawer editor konfigurasi; deep-link `?tab=`; konfirmasi Maint Mode ON + audit; save banner TX + Retry; tab lazy-fetch + skeleton; empty webhook/snapshot/kunci.
- Terkait T6 settings KV (GAP-16): editor ∧ backend KV + hash-only secrets.

## UI States (6)

- `TableSkeleton`; standar hover-reveal + focus ring + kanban drag; kontrak prod Force Ping + flush; Retry idempoten + Copy Log; skeleton→baris + STALE; guard submit + LOTO.

## Logo (4)

- Varian logo-white/mark/favicon/PWA icon; keputusan tipografi wordmark; alt/fallback inisial AO; skeleton 36×36.

## (U) 4 — verifikasi saat implementasi

Persistensi cron Schedule Dispatch; revoke perilaku profil user; empty state roster Displayed; viewer hasil restore + RPO/RTO/diff; feedback job seed/backup; adopsi FormField + guard.

## Verdict batch

45 + 4 (U) berverdict → Batch 3 CLOSED.
