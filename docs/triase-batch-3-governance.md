# Triase Batch 3 — Governance & Sistem (Step 2)

> Sumber: `docs/exp-check/part-governance.md` (244 baris, 91 checkbox, 8 layar).
> Metode: spec-driven — tiap item dibuktikan via grep kode/rute; tanpa bukti = PROMOTE/(U), bukan DONE.
> Legenda: DONE = ada & bekerja di kode · PROMOTE = backlog (bangun/perbaiki) · (U) = ada sebagian, kedalaman belum terverifikasi · USANG = klaim basi/ditolak.
> Aturan kanon (b1/b45): dependensi kanon TIDAK diputus di sini, dicatat saja.

## 1. Operations Dashboard (9 item)

- DONE (4): link baris/WO Code → `/work-orders/[id]` (rute ada, batch 1); palette `+ New Dispatch` (CommandPalette.tsx ada, batch 1); search `⌘K` (sama); SLA Clock live + BREACH (WoTimers.tsx: countdown + `-HH:MM:SS BREACH`; WoDialogs tangani `WO_STALE_STATE`).
- PROMOTE (5): modal Quick Create WO + POST (tak ada match); aksi baris inline optimistis (Dispatch/Reassign/Auto-Assign/Expedite); banner `Telemetry Degraded` + Retry (komponen OfflineBanner ada, wiring dashboard tak terbukti); filter rail via query params + reset; tab chart + skeleton/shimmer + Retry.

## 2. Reports & Analytics Hub (11 item)

- DONE (4): rute dossier `/reports/[id]` (page ada); drawer Schedule Automated Dispatch (dialog ada di ReportsHub; persistensi cron (U)); palette global; `⌘K`.
- PROMOTE (7): drawer filter dimensi (tune); riwayat job EXP-*/RPT-*; generate/export async (Compiling→Ready, FAILED+Retry); badge replika SYNCED→LAG/STALE; validasi query builder + preview 0 records (builder UI ada, validasi tak terbukti); filter kosong + Reset; toast export per baris.

## 3. Audit Trail & System Logs Hub (12 item)

- DONE (11): entity WO/PR/PO/AST/PART/RBAC → rute masing-masing (entityHref, diverifikasi TASK-20); Rollback Simulation dry-run (TASK-20); panel Verify Cryptographic Root (TASK-20); banner HASH MISMATCH (jalur invalid ada, TASK-20); seleksi baris feed (TASK-20); polling jujur + Force Refetch nyata (TASK-20); Copy Full Hash (TASK-20); toggle Formatted Diff/Raw JSON (TASK-20); Flag Review jujur + export CSV/JSON (TASK-20); palette global.
- PROMOTE (1): ekspor log terjadwal berkala.

## 4. Notifications & SLA Alerts Hub (15 item)

- DONE (7): CTA View Work Order → rute ada; Review 3-Way Match → rute ada; konfirmasi destruktif (ConfirmDialog pada Auto-approve $14.500 + Revoke Session; idempotensi/jejak audit (U)); route field audits/run (batch 1); palette; `⌘K`; Test P1 Alert berlabel simulated (TASK-26).
- PROMOTE (8): modal Reassign Tech; flow transfer antar-crib; markAllRead optimistic + rollback (tombol ada, rollback tak terbukti); toggle kanal/preferensi; banner WS putus (label `WS-PUSH: 12ms` fiksi — lihat F-COPY; transport jujur SSE sudah DONE via TASK-26); countdown auto-eskalasi + STALE; tab/search/severity via query params + empty message; (sisa 1: perilaku kartu tetap unread bila gagal — gabung markAllRead).

## 5. Organization RBAC Hub (15 item)

- DONE (8): konteks WO → rute ada; dialog deaktivasi = ConfirmDialog (bukan `confirm()` native); profil `/organization/users/[id]` (rute ada; revoke perilaku (U)); palette; perilaku dialog deaktivasi (suspend via dialog); filter roster + badge Displayed (empty state (U)); Clone Policy (dialog + Discard Changes nyata); Reset MFA/Key (ConfirmDialog + toast).
- (U) (1): Impersonate — tombol + dialog + Start Session ada; read-only enforcement + banner + jejak `admin AS user` belum terverifikasi.
- PROMOTE (6): auth prod SSO Okta SAML + MFA FIDO2 (login password+TOTP ada; SSO/FIDO2 untuk go-live); modal Edit Assignment; sync SCIM per user + retry + webhook log; PUT rules server + rollback (draft lokal + Discard nyata; Deploy berlabel simulated); validasi modal Provision; banner sesi impersonasi.

## 6. Settings System Configuration (13 item)

- DONE (4): remediasi secret (key crypto-random runtime, mask last4, reveal-once, rotate — P1 BLOKER selesai di kode); flow Issue/Reveal/Rotate kredensial; palette; Test Connection + Re-sync Ledgers (detail error per kartu (U)).
- (U) (2): viewer hasil restore simulation (tombol + jobs page ada; RPO/RTO/diff belum terverifikasi); feedback job seed/backup (jobs page ada; `triggerSeedAction` tak terbukti).
- PROMOTE (7): dialog konfirmasi destruktif (Reset/Purge/Rotate/Maint); drawer editor konfigurasi; deep-link `?tab=`; konfirmasi Maint Mode ON + audit; save banner TX + Retry; tab lazy-fetch + skeleton; empty webhook/snapshot/kunci.

## 7. UI State Variants Patterns — BUKAN rute, lab kontrak (11 item)

- DONE (3): `EmptyState.tsx`, `OfflineBanner.tsx`, `ErrorToast.tsx` ada + diadopsi (audit-trail, work-orders, assets, service-requests, findings, field-run).
- (U) (1): `FormField` + guard (tak ada file di components/ops; adopsi tak terbukti).
- PROMOTE (7): `TableSkeleton` (tak ada file); standar hover-reveal + focus ring + kanban drag; kontrak prod Force Ping + flush; Retry idempoten + Copy Log; skeleton→baris + STALE; guard submit + LOTO.

## 8. Apex Ops Logo — BUKAN rute, aset (5 item)

- DONE (1): `components/Logo.tsx` ada (pengganti markup duplikat).
- PROMOTE (4): varian logo-white/mark/favicon/PWA icon; keputusan tipografi wordmark; alt/fallback inisial AO; skeleton 36×36.

## Rekap

| Layar | DONE | (U) | PROMOTE | USANG | Total |
|---|---|---|---|---|---|
| Dashboard | 4 | 0 | 5 | 0 | 9 |
| Reports | 4 | 0 | 7 | 0 | 11 |
| Audit | 11 | 0 | 1 | 0 | 12 |
| Notifications | 7 | 0 | 8 | 0 | 15 |
| Organization | 8 | 1 | 6 | 0 | 15 |
| Settings | 4 | 2 | 7 | 0 | 13 |
| State Patterns | 3 | 1 | 7 | 0 | 11 |
| Logo | 1 | 0 | 4 | 0 | 5 |
| **Total** | **42** | **4** | **45** | **0** | **91** |

## Dependensi kanon (JANGAN diputus — catat saja)

- Penomoran WO `WO-2024-*` vs `WO-2026-*`; duel seal chiller (G3).
- Tenant `APX-NUSA-01` vs `APX-GL-9021`; `6 Roles` vs `8 Roles`; varian Shift A; prefix PR vs PO; Quiet Hours vs Shift Auto-Mute; zona waktu; kontak AS vs Jakarta.
- `screen.png` reports & notifications salah sorot Audit Trail (artefak audit, bukan desain).
- Purchasing/vendors: artefak mobile shell + Space Grotesk + bottom-nav (produksi = shell desktop + sidebar).
- ui-patterns: ID contoh (`WO-9042`, `Elena Rostova`, `TECH-094`, `AST-CHILLER-03`) GANTI dengan kanonis saat seeding; label HTMX hanya teks demo (prod = SWR polling).
- Logo: presisi 7 vs 8 baris setara; screen hanya mark kecil.
