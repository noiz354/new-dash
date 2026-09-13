# Expansion Checklist — Batch Governance & Sistem (8 layar)

> Batch: governance & sistem. Cakupan HANYA 8 layar di bawah; 12 layar operasi/aset dikerjakan 2 batch lain — tidak diduplikasi.
> Sistem desain: semua layar **sistem A** (logo: aset netral A/B). Bahasa: Indonesia. NO CODE.
> Konvensi tag: `[SUDAH-DI-READINESS §2/Hx|Mx|Lx]` = sudah ada di readiness §2; `[SUDAH-DI-READINESS §3]` = sudah ada di readiness §3 (wiring), belum di §2; `[BARU]` = belum di readiness §2 maupun §3.
> Dependensi kanon = konflik fakta yang HARUS diputuskan dulu (tenant, role, shift, zona, versi API, format ID) — bukan diperbaiki diam-diam.
> Vocabulary pola di kolom micro-interactions merujuk §7 (`ui_state_variants_patterns/`): `EmptyState`, `FormField`, `OfflineBanner`, `ErrorToast`, `TableSkeleton`, hover-reveal, focus-ring.

## Operations Dashboard (`operations_dashboard/`)
> Sumber: docs/ui-audit/operations-dashboard.md, readiness §2 (H1/M4/L4) + §3 (baris dispatch → work-order-detail.html; M4), navigation-audit.md §3–§5. Catatan: tidak ada file pass2 operations-dashboard (pass2 hanya 19 file; operations-dashboard + navigation-audit tidak ada) — seksi ini hanya dari audit pass-1 + readiness + navigasi.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`, file `work-order-detail.html`)** — tujuan klik baris/WO Code antrean dispatch (contoh `WO-2024-0892/0888/0901/0904`). ([SUDAH-DI-READINESS §2/H1]; dependensi kanon: penomoran campur `WO-2024-*` di layar ini vs `WO-2026-*` di hub lain menurut navigation-audit §5 + format kanonis `WO-2026-XXXX` readiness §4; duel seal chiller readiness G3)
- [ ] [P2] **Target global `+ New Dispatch / Request` (command palette `⌘K` + modal kontekstual)** — tombol header ada tanpa tujuan seragam di semua halaman. ([SUDAH-DI-READINESS §2/M4])
- [ ] [P3] **Global search `⌘K` lintas entitas (WO/AST/SKU/PO)** — hanya ada search lokal toolbar tabel. ([SUDAH-DI-READINESS §2/L4])
### 2. Undefined Micro-Interactions
- [ ] [P2] **Countdown SLA Clock live + penanda `STALE`** — pemicu: poll >60s basi pada kolom `SLA Clock` (`-01:42:15 BREACH` / `01:14:30 LEFT`). ([BARU]; sumber perilaku: operations-dashboard.md §1 State UI error)
- [ ] [P2] **Validasi modal Quick Create WO + toast sukses/gagal** — pemicu: submit `POST /api/v1/work-orders` (facility, asset, priority, summary, assignee). (referensi pola §7: `FormField` + `ErrorToast`)
- [ ] [P2] **Feedback aksi baris inline (Dispatch / Reassign / Auto-Assign / Expedite SKU)** — pemicu: klik aksi per baris; butuh optimistis + rollback + toast destruktif. (referensi pola §7: `ErrorToast`)
- [ ] [P2] **Banner telemetry degraded + `Retry`** — pemicu: ingestion gagal (badge hijau → merah `Telemetry Degraded`, latency `-`). (referensi pola §7: `OfflineBanner`)
- [ ] [P3] **Filter rail + search + pagination via query params + reset** — pemicu: pill rentang waktu / dropdown Facility / dropdown Shift / pagination `Showing 4 of 42`; kosong → pesan + `Reset Filter`. (referensi pola §7: `EmptyState` + `TableSkeleton`)
- [ ] [P3] **Ganti tab chart + skeleton/shimmer + `Retry`** — pemicu: tab `Cost vs Budget` / `Downtime Incidents` / `Energy Consumption`; chart tanpa data → sumbu + pesan. ([BARU]; sumber: operations-dashboard.md §1)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik `+ Quick Create Work Order` | Modal `POST /api/v1/work-orders`, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik `Export Executive Report (PDF/XLSX)` | Async job → unduh dossier (terkait `/reports`) | TERDEFINISI DI MOCKUP |
| Klik baris tabel / WO Code | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik `Dispatch Specialist` / `Reassign` / `Auto-Assign` / `Expedite SKU` | Aksi API inline, tetap di halaman + toast | TERDEFINISI DI MOCKUP |
| Klik `View System Diagnostic Logs` | `/audit-logs` | TERDEFINISI DI MOCKUP |
| Ubah filter rail / search / pagination | Query params (`?timeRange=&facilityId=&shift=&page=`) | TERDEFINISI DI MOCKUP |
| Klik ikon `notifications` header | `/notifications` | TERDEFINISI DI MOCKUP |
| Klik `+ New Dispatch / Request` (header global) | Command palette / modal kontekstual (M4) | TAK TERDEFINISI |
| Klik refresh | Re-fetch KPI/tabel + spinner inline | TERDEFINISI DI MOCKUP |

## Reports & Analytics Hub (`reports_analytics_hub/`)
> Sumber: docs/ui-audit/reports.md + docs/ui-audit/pass2/reports.md, readiness §3 (Preview Dossier → `report-dossier.html`; drawer jadwal; M4) + §2 (M4/L4 + seed kanon G3), navigation-audit.md §3–§5. Anti-artifak: `screen.png` salah sorot `Audit Trail & Logs` (kedua pass konfirmasi) — bukan desain, breadcrumb/H1 yang berlaku.
### 1. Missing Sub-Pages
- [ ] [P2] **Detail/pratinjau dossier (`/reports/[id]`, file `report-dossier.html`)** — tujuan tombol Preview `visibility` tiap baris (viewer: parameter, riwayat generasi, daftar ekspor) atau modal preview PDF yang disepakati. ([SUDAH-DI-READINESS §3]; tidak ada di §2)
- [ ] [P2] **Drawer schedule configuration (`ReportScheduleEditor`, rute `/reports/schedules`)** — tujuan `Schedule Automated Dispatch` + menu `more_vert` per baris (cron, penerima, format, zona waktu). ([SUDAH-DI-READINESS §3]; tidak ada di §2)
- [ ] [P3] **Drawer filter dimensi alokasi** — tujuan tombol `tune` di Category Cost Allocation. ([BARU]; sumber: reports.md §2–§3, pass2/reports.md §2–§3)
- [ ] [P3] **Riwayat job export/generate (status, retry, kedaluwarsa unduhan)** — daftar job `EXP-*`/`RPT-*` yang pernah di-generate. ([BARU]; sumber: pass2/reports.md §3 item 4)
- [ ] [P2] **Target global `+ New Dispatch / Request`** — pola global belum diputuskan. ([SUDAH-DI-READINESS §2/M4])
- [ ] [P3] **Global search `⌘K` (termasuk pencarian `RPT-*`)** — hanya ada filter klasifikasi lokal. ([SUDAH-DI-READINESS §2/L4])
### 2. Undefined Micro-Interactions
- [ ] [P2] **Job async generate/export (spinner `Compiling OLAP Dossier...` → `Dossier Ready` → restore; state `FAILED` + `Retry`)** — pemicu: `Generate & Download Dossier` / `Export Full PDF Dossier` / export per baris. (referensi pola §7: `ErrorToast`)
- [ ] [P2] **Badge replika `SYNCED` → `REPLICA LAG/STALE`** — pemicu: sync analitik basi. (referensi pola §7: `OfflineBanner`)
- [ ] [P2] **Validasi query builder + preview 0 records** — pemicu: rentang tanggal, ≥1 metrik, format output; 0 records → tampilkan SQL + saran longgarkan filter. (referensi pola §7: `FormField` + `EmptyState`)
- [ ] [P3] **Filter klasifikasi dossier kosong + `Reset`** — pemicu: filter tanpa hasil → pesan + `Build Custom Query`. (referensi pola §7: `EmptyState`)
- [ ] [P3] **Toast hasil export per baris (PDF/XLSX)** — pemicu: klik aksi per baris dossier. (referensi pola §7: `ErrorToast`)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik `Schedule Automated Dispatch` | Drawer jadwal kirim dossier | TAK TERDEFINISI |
| Klik `Export Full PDF Dossier` | Async job → unduh dossier gabungan + toast | TERDEFINISI DI MOCKUP |
| Klik `+ Build Custom Query (SQL/Visual)` | Scroll/toggle `#query-builder-panel` inline | TERDEFINISI DI MOCKUP |
| Klik Preview `visibility` per baris | Pratinjau PDF inline atau `/reports/[id]` | TAK TERDEFINISI |
| Klik Export PDF/XLSX per baris | Unduh file (aksi) | TERDEFINISI DI MOCKUP |
| Klik `more_vert` (Schedule) per baris | Menu konteks → editor jadwal kirim | TAK TERDEFINISI |
| Klik `Run Simulation / Live Preview` | Panel preview inline (`#query-preview-result`, `46ms · 412 Records`) | TERDEFINISI DI MOCKUP |
| Klik `Generate & Download Dossier` | Async job → unduh file | TERDEFINISI DI MOCKUP |
| Klik `tune` (Category Cost Allocation) | Drawer filter dimensi alokasi | TAK TERDEFINISI |
| Klik `+ New Dispatch / Request` (header) | Pola global M4 | TAK TERDEFINISI |

## Audit Trail & System Logs Hub (`audit_trail_system_logs_hub/`)
> Sumber: docs/ui-audit/audit-trail.md + docs/ui-audit/pass2/audit-trail.md, readiness §2 (H1/H3/M4) + §3 (baris audit-trail: aksi inline), navigation-audit.md §3–§5. Dependensi kanon: tenant `APX-NUSA-01` (layar ini + org) vs `APX-GL-9021` (settings); label proof bar `HTMX POST /api/v2/procurement/pr-0314/endorse` vs kontrak `v1` lain; prefix `PR-2026-0314` vs `PO-2026-0298` (putuskan pisah PR requisition vs PO order + tautan turunannya). Bukan missing: `AST-HVAC-004`/`AST-ELEC-012` → `/assets/[id]` EXISTS, `PART-FLTR-401` → `/inventory?sku=` EXISTS, `RBAC: Sr. Field Tech` → `/organization` EXISTS (koreksi pass-2 §7c atas klaim pass-2 §2 yang terlalu luas).
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`, file `work-order-detail.html`)** — tujuan entity `WO-2026-0894` (`STATE_CHANGE`); dead-end yang dirujuk ≥10 titik lintas hub. ([SUDAH-DI-READINESS §2/H1]; dependensi kanon WO seal ganda + LOTO + format ID readiness G3)
- [ ] [P1] **Detail PR/PO/GRN + 3-Way Match (`/purchasing/[id]`, file `purchase-detail.html`)** — tujuan entity `PR-2026-0314`. ([SUDAH-DI-READINESS §2/H3]; dependensi kanon pisah prefix PR vs PO)
- [ ] [P2] **Modal Rollback Simulation (dry-run, read-only)** — hasil simulasi (dampak, dry-run diff, konfirmasi; tidak mutasi ledger) untuk tombol inspector. ([BARU]; sumber: audit-trail.md §2–§3, pass2/audit-trail.md §2–§3)
- [ ] [P3] **Panel hasil `Verify Cryptographic Root` inline** — root hash, block height, waktu verifikasi di widget Merkle. ([BARU]; sumber: pass2/audit-trail.md §3 item 3)
- [ ] [P3] **Ekspor log terjadwal berkala** — hanya ada ekspor ad-hoc (bandingkan reports hub yang punya scheduler). ([BARU]; sumber: audit-trail.md §3 item 5)
- [ ] [P2] **Target global `+ New Dispatch / Request`** — pola global belum diputuskan. ([SUDAH-DI-READINESS §2/M4])
### 2. Undefined Micro-Interactions
- [ ] [P1] **Hasil verifikasi gagal (`HASH MISMATCH` banner + blok terdampak)** — pemicu: `Verify Cryptographic Root` gagal. (referensi pola §7: `ErrorToast`)
- [ ] [P2] **Seleksi baris feed (`highlightRow`) → fetch inspector per `eventId`** — pemicu: klik baris feed; tanpa seleksi → placeholder. ([BARU]; sumber: pass2/audit-trail.md §1+§7b: `switchView`/`highlightRow`/clipboard presisi)
- [ ] [P2] **Polling 5s + badge `STALE` + `Force Refetch`** — pemicu: stream terputus / checkbox `Live HTMX Polling (5s)` off. (referensi pola §7: `TableSkeleton` + `OfflineBanner`)
- [ ] [P2] **`Copy Full Hash` + fallback textarea selektabel** — pemicu: klik copy hash penuh / clipboard gagal. ([BARU]; sumber: audit-trail.md §1, pass2/audit-trail.md §1)
- [ ] [P3] **Toggle `Formatted Diff` / `Raw JSON Payload` (`switchView`)** — pemicu: tab inspector + `4 Fields Mutated`. ([BARU]; sumber: pass2/audit-trail.md §1+§7b)
- [ ] [P3] **Toast `Flag Review` + export async + retry** — pemicu: flag/export gagal. (referensi pola §7: `ErrorToast`)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik `Export CSV / JSON Log` | Unduh file async sesuai filter aktif | TERDEFINISI DI MOCKUP |
| Klik `Compliance PDF Report` | Async job → unduh PDF | TERDEFINISI DI MOCKUP |
| Klik `Verify Cryptographic Root` | Verifikasi inline, hasil di widget Merkle | TERDEFINISI DI MOCKUP |
| Klik baris feed | Seleksi inline → inspector (`highlightRow`) | TERDEFINISI DI MOCKUP |
| Klik entity `PR-2026-0314` / `WO-2026-0894` | `/purchasing/[id]` / `/work-orders/[id]` | TAK TERDEFINISI |
| Klik entity `AST-*` / `PART-*` / `RBAC:*` | `/assets/[id]` / `/inventory?sku=` / `/organization` | TERDEFINISI DI MOCKUP |
| Klik `Copy Full Hash` | Clipboard (bukan navigasi) | TERDEFINISI DI MOCKUP |
| Klik `Download Signed Proof` | Unduh bukti bertanda tangan | TERDEFINISI DI MOCKUP |
| Klik `Rollback Simulation` | Modal hasil simulasi dry-run | TAK TERDEFINISI |
| Klik `Flag Review` | Flag inline + toast | TERDEFINISI DI MOCKUP |
| Pagination / rows-per-page / filter pills | Query params (`?scope=&entity=&page=`) | TERDEFINISI DI MOCKUP |

## Notifications & SLA Alerts Hub (`notifications_sla_alerts_hub/`)
> Sumber: docs/ui-audit/notifications.md + docs/ui-audit/pass2/notifications.md, readiness §2 (H1/H2/H3/M4/M5/L2/L4) + §3 (notif → work-order-detail.html + dialog konfirmasi L2), navigation-audit.md §3–§5. Anti-artifak: `screen.png` salah sorot `Audit Trail & Logs` (kedua pass) — bukan desain. Dependensi kanon: zona campur (`Quiet Hours 00:00–06:00` tanpa zona vs Shift A WIB vs `Today 15:30 UTC` — sepakati tampil lokal WIB, simpan UTC); `Quiet Hours` vs `Shift Auto-Mute di luar Shift A 07:00–15:30 WIB` (dua definisi hening belum selaras, pass2 §7b); direktori kontak AS `+1 415-555-0192` vs operasi Jakarta (normalisasi saat seeding).
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — tujuan CTA primer `View Work Order` (`WO-2026-0894`); tanpanya jalur triase→eksekusi terputus. ([SUDAH-DI-READINESS §2/H1])
- [ ] [P1] **Detail PR/PO + tab 3-Way Match (`/purchasing/[id]`)** — tujuan `Review 3-Way Match` + konteks `PR-2026-0314`. ([SUDAH-DI-READINESS §2/H3]; dependensi kanon pisah PR vs PO)
- [ ] [P1] **Dialog konfirmasi destruktif (AlertDialog + idempotency key + jejak audit)** — wajib untuk `One-Click Authorize PO` ($2,900) dan `Revoke Active Session` yang kini sekali klik. ([SUDAH-DI-READINESS §2/L2]; sumber risiko: notifications.md §3 Temuan + pass2/notifications.md §3 item 5)
- [ ] [P2] **Route field `/(field)/audits` + `/(field)/run/[auditId]`** — tujuan `View Field Checklist` (daftar + checklist mobile). ([SUDAH-DI-READINESS §2/H2]; dependensi kanon progres `INS-2026-0412` + GPS Kalimantan readiness G3)
- [ ] [P2] **Modal Reassign Tech** — tujuan aksi `Reassign Tech` (dipakai ulang WO/inventory). ([BARU]; sumber: notifications.md §2–§3, pass2/notifications.md §2)
- [ ] [P2] **Flow transfer antar crib (`/inventory/transfers/new?sku=`)** — tujuan `Transfer from Central Crib`; putuskan modal vs route prefill. ([SUDAH-DI-READINESS §2/M5])
- [ ] [P2] **Target global `+ New Dispatch / Request`** — pola global belum diputuskan. ([SUDAH-DI-READINESS §2/M4])
- [ ] [P3] **Global search `⌘K`** — hanya filter lokal kategori/search/severity. ([SUDAH-DI-READINESS §2/L4])
### 2. Undefined Micro-Interactions
- [ ] [P1] **Perilaku konfirmasi authorize/revoke (batal vs setuju, idempoten, kartu tetap unread bila gagal)** — pemicu: `One-Click Authorize PO` / `Revoke Active Session` / `Reject Justification`. (referensi pola §7: `ErrorToast`; dialog mengikuti pola `FormField` §7)
- [ ] [P2] **`Mark All Read` optimistis + rollback** — pemicu: `markAllRead()` (KPI→`0` + `opacity-75`); gagal → kembalikan count. ([BARU]; sumber perilaku JS: pass2/notifications.md §1+§7b)
- [ ] [P2] **Toggle kanal/preferensi optimistis + rollback** — pemicu: toggle matriks routing / kebijakan eskalasi; P1 terkunci. (referensi pola §7: `ErrorToast`)
- [ ] [P2] **WebSocket putus → `Disconnected` + `Reconnect` + jeda inject** — pemicu: bus `WS-PUSH: 12ms` mati. (referensi pola §7: `OfflineBanner`)
- [ ] [P2] **Countdown `Auto-escalation in 08:34` + `STALE` bila basi** — pemicu: timer eskalasi kartu kritis. ([BARU]; sumber: notifications.md §1, pass2/notifications.md §1)
- [ ] [P3] **Tab kategori + live search + severity via query params + empty message + reset** — pemicu: pills `38/8/12/6/5/7` + `alert-search-input` (kini hanya `display:none` tanpa pesan kosong). (referensi pola §7: `EmptyState`)
- [ ] [P3] **`Trigger Test P1 Alert` sintetis (hanya development)** — pemicu: debugger bus menyisipkan `TEST-ALARM-998`; prod memakai bus nyata. ([BARU]; sumber: pass2/notifications.md §1+§6: prepend + hapus `animate-pulse` 1500ms)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik `Mark All Read` | `PATCH` massal, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik `Export Log (CSV)` | Unduh file (aksi) | TERDEFINISI DI MOCKUP |
| Klik `View Work Order` (`WO-2026-0894`) | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik `Escalate to Eng Mgr` / `Dispatch Backup Tech` | Aksi API inline, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik `One-Click Authorize PO` | `POST` otorisasi + dialog konfirmasi (wajib) | TAK TERDEFINISI |
| Klik `Review 3-Way Match` | `/purchasing/[id]` (tab match) | TAK TERDEFINISI |
| Klik `Reject Justification` | Aksi tolak + alasan, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik `Auto-Approve Reorder (10 ea)` | Approve `PR-2026-0315`, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik `View Inventory Ledger` | `/inventory?sku=PART-SEAL-8821` | TERDEFINISI DI MOCKUP |
| Klik `Transfer from Central Crib` | Flow transfer stok (M5) | TAK TERDEFINISI |
| Klik `View Field Checklist` | `/(field)/run/[auditId]` | TAK TERDEFINISI |
| Klik `Reassign Tech` | Modal reassign | TAK TERDEFINISI |
| Klik `View Audit Trace Log` | `/audit-logs?q=AUDIT-EVT-9042` | TERDEFINISI DI MOCKUP |
| Klik `Revoke Active Session` | `DELETE` sesi + dialog konfirmasi (wajib) | TAK TERDEFINISI |
| Toggle kanal / kebijakan eskalasi / quiet hours | `PUT` preferensi, tetap di halaman | TERDEFINISI DI MOCKUP |

## Organization RBAC Governance Hub (`organization_rbac_governance_hub/`)
> Sumber: docs/ui-audit/organization-rbac.md + docs/ui-audit/pass2/organization-rbac.md, readiness §2 (H1/M3/M4/L2) + §3 (kartu user → work-order-detail.html; impersonasi + banner), navigation-audit.md §3–§5. Dependensi kanon: Shift A ganda dalam satu layar (`07:00–15:30 WIB` KPI vs `06:00–22:00` kartu ABAC — kanonis notif hub `07:00-15:30 WIB`); `6 Defined Roles` vs seed settings `8 Roles` (selisih 2 role sistem tak terjelaskan); tenant `APX-NUSA-01` vs `APX-GL-9021`. Anti-artifak: 3 avatar hotlink `googleusercontent` (ganti Avatar internal, jangan hotlink); `confirm()` native wajib diganti.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — tujuan konteks `WO-2026-0894 (Chiller #4)` di kartu Marcus Kowalski. ([SUDAH-DI-READINESS §2/H1])
- [ ] [P1] **Dialog deaktivasi (`AlertDialog`: alasan, tanggal efektif, alihkan WO aktif, terminasi sesi; ketik nama untuk suspend direktur ke atas)** — pengganti `confirmDeactivation()` native. ([SUDAH-DI-READINESS §2/L2]; sumber: organization-rbac.md §3 + pass2/organization-rbac.md §3 item 4)
- [ ] [P2] **Auth prod: `(auth)/login` + callback SSO Okta SAML + enroll MFA FIDO2** — hub mengatur SSO/MFA/SCIM tanpa layar login; wajib sebelum go-live. ([SUDAH-DI-READINESS §2/M3]; dependensi kanon: kebijakan SSO/MFA/SCIM layar ini — IdP Okta, MFA enforced 100%, timeout 30/120 mnt, SCIM <50ms)
- [ ] [P2] **Profil user (`/organization/users/[id]`: riwayat login, sesi, WO aktif, sertifikasi) + revoke sesi** — klik kartu kini hanya mengisi panel. ([SUDAH-DI-READINESS §2/L2]; sumber: pass2/organization-rbac.md §3 item 1)
- [ ] [P2] **Mode Audit Impersonate (read-only + banner sesi persisten + jejak audit `admin AS user` + tombol keluar)** — tombol kini hanya toast. ([SUDAH-DI-READINESS §2/L2]; sumber: organization-rbac.md §2–§3, pass2/organization-rbac.md §3 item 2)
- [ ] [P2] **Modal Edit Assignment (role, crew, shift, geofence, tanggal efektif)** — tombol tanpa desain form. ([BARU]; sumber: organization-rbac.md §2–§3, pass2/organization-rbac.md §2)
- [ ] [P2] **Flow status sync SCIM per user + retry + webhook log** — modal invite hanya nama/email/role; modal SSO view-only. ([BARU]; sumber: organization-rbac.md §3 item 5)
- [ ] [P2] **Target global `+ New Dispatch / Request`** — pola global belum diputuskan. ([SUDAH-DI-READINESS §2/M4])
### 2. Undefined Micro-Interactions
- [ ] [P1] **Perilaku dialog deaktivasi (batal vs suspend + terminasi sesi telemetry aktif)** — pemicu: `Deactivate User`; gagal → user tetap aktif + toast. ([BARU]; sumber: organization-rbac.md §1: `confirm()` native; pass2/organization-rbac.md §1+§7b)
- [ ] [P2] **Filter roster 4 dimensi (`filterUsers`) + badge `6 Displayed` + empty + reset** — pemicu: search `Ctrl+/` + select Team/Role/Status; 0 hasil → saran reset. (referensi pola §7: `EmptyState`)
- [ ] [P2] **Draft matriks + dirty flag + `Deploy`/`Discard` + rollback optimistis** — pemicu: checkbox 15 modul × 6 kapabilitas per tab role; gagal → kembali ke baseline + toast. (referensi pola §7: `ErrorToast`)
- [ ] [P2] **Validasi modal Provision + SCIM gagal (modal tetap terbuka, error per field)** — pemicu: submit `Provision via SCIM` (nama wajib, email domain, badge unik). (referensi pola §7: `FormField` + `ErrorToast`)
- [ ] [P2] **Banner sesi impersonasi read-only** — pemicu: `Audit Impersonate` aktif. (referensi pola §7: banner sesi, pola 2B `ui-state-patterns`)
- [ ] [P3] **`Clone Policy as New Role` → draft role baru di list** — pemicu: footer simulator. ([BARU]; sumber: organization-rbac.md §1, pass2/organization-rbac.md §1)
- [ ] [P3] **Toast `Reset MFA / Key` (link terkirim)** — pemicu: aksi reset per user. ([BARU]; sumber: organization-rbac.md §2)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik `Export Audit Log` | Unduh CSV L30D RBAC (kini hanya toast) + terkait `/audit-logs` | TERDEFINISI DI MOCKUP |
| Klik `SSO & Security Policies` | Modal viewer, tetap di halaman (edit di IdP) | TERDEFINISI DI MOCKUP |
| Klik `+ Provision User` / `Provision via SCIM` | Modal → `POST` SCIM, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik kartu user | Seleksi inline `#quickActionPanel` (bukan navigasi) | TERDEFINISI DI MOCKUP |
| Klik konteks `WO-2026-0894` di kartu | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik `Edit Assignment` | Modal editor assignment | TAK TERDEFINISI |
| Klik `Reset MFA / Key` | Kirim link reset + toast | TERDEFINISI DI MOCKUP |
| Klik `Audit Impersonate` | Mode impersonasi + banner + jejak audit | TAK TERDEFINISI |
| Klik `Deactivate User` | Suspend + terminasi sesi via dialog (bukan `confirm()`) | TAK TERDEFINISI |
| Ganti tab role / checkbox matriks | State lokal (`?role=` + dirty flag) | TERDEFINISI DI MOCKUP |
| Klik `Deploy Rule(s)` | `PUT` rules + toast | TERDEFINISI DI MOCKUP |
| Klik `Clone Policy as New Role` | Draft role baru, tetap di halaman | TERDEFINISI DI MOCKUP |

## Settings System Configuration (`settings_system_configuration/`)
> Sumber: docs/ui-audit/settings.md + docs/ui-audit/pass2/settings.md, readiness §2 (M4/M5? + seed/tenant G3) + §3 (drawer editor; dialog destruktif; viewer simulasi; BLOKER secret), navigation-audit.md §3–§5. Dependensi kanon: tenant `APX-GL-9021` vs `APX-NUSA-01` (hipotesis global-vs-site belum fakta); seed `8 Roles` vs org `6 Roles`; work week `Mon–Sat 07:00–22:00` vs varian Shift A (`07:00–15:30` / `06:00–22:00`); `ENV: PROD (US-EAST-1)` vs operasi `Asia/Jakarta` + broker privat + S3 us-east (tentukan region/residency). Keamanan: secret `apx_live_sec_…` (last4 `b401` menurut pass-1 / `bb401` menurut pass-2 — kanonisasi saat seeding; nilai penuh hanya di `code.html`, tidak direplikasi di sini) tertulis plain di atribut `value` input `type="password"` — anggap bocor, rotasi saat seeding.
### 1. Missing Sub-Pages
- [ ] [P1] **Remediasi secret terpapar (hanya `last4` di klien + reveal sekali-tampil + anggap secret mockup bocor)** — produksi JANGAN render secret ke klien. ([SUDAH-DI-READINESS §3 BLOKER KEAMANAN]; sumber: settings.md §3 + pass2/settings.md §3 item 3)
- [ ] [P1] **Dialog konfirmasi destruktif (ketik konfirmasi + jejak audit ke `/audit-logs`)** — wajib untuk `Reset Counters`, `Purge Test Transactions (>30 Days)`, `Rotate`, `Maint Mode ON`, `Flush Ingest Buffer` yang kini sekali klik. ([SUDAH-DI-READINESS §3]; sumber: settings.md §3 item 3 + pass2/settings.md §3 item 2)
- [ ] [P2] **Flow `Issue New API Credential` / `Reveal` sekali saja / `Rotate`** — secret penuh hanya dari respons sekali-tampil. ([SUDAH-DI-READINESS §3]; skala P2 untuk rotasi sesuai brief)
- [ ] [P2] **Drawer editor konfigurasi (`Sheet` + form `zod` dipakai ulang: pola sekuens ×5, endpoints integrasi, webhook register/edit)** — semua tombol `Configure`/`Edit`/`Register` tanpa tujuan. ([SUDAH-DI-READINESS §3]; sumber: settings.md §3 item 1 + pass2/settings.md §3 item 1)
- [ ] [P2] **Viewer hasil restore simulation (RPO/RTO, checksum, dry-run diff)** — tujuan `Trigger Restore Simulation`. ([SUDAH-DI-READINESS §3]; sumber: settings.md §3 item 2)
- [ ] [P3] **Deep-link tab (`/settings?tab=data` dkk)** — 5 tab tanpa URL agar log audit/notifikasi bisa menunjuk tab. ([BARU]; sumber: settings.md §3 item 4)
- [ ] [P2] **Target global `+ New Dispatch / Request`** — pola global belum diputuskan. ([SUDAH-DI-READINESS §2/M4])
### 2. Undefined Micro-Interactions
- [ ] [P1] **Konfirmasi `Maint Mode` ON (dampak env PROD) + audit otomatis** — pemicu: switch `maintToggle` (`OFFLINE (ARMED)` → `ONLINE (ACTIVE LOCK)`). ([BARU]; sumber: settings.md §1 + pass2/settings.md §1+§7b)
- [ ] [P2] **Save + banner feedback (`TX-904128 · 14ms`) + `Retry` tanpa hilangkan nilai form** — pemicu: `Save System Parameters`; gagal → banner merah. ([BARU]; sumber: settings.md §1–§2 + pass2/settings.md §1+§7b: simulasi 600ms → banner 4000ms)
- [ ] [P2] **`Test Connection` / `Ping` / `Send Test Email` / `Re-sync Ledgers` (spinner + badge `DEGRADED` + detail error)** — pemicu: aksi per kartu integrasi/webhook. (referensi pola §7: `ErrorToast` + `OfflineBanner`)
- [ ] [P2] **Feedback job seed/backup (reload/purge/telemetry, snapshot ad-hoc, baris baru di tabel)** — pemicu: aksi tab Data; purge wajib konfirmasi P1 di atas. ([BARU]; sumber: settings.md §1 + `triggerSeedAction`)
- [ ] [P3] **Tab lazy-fetch (hanya tab aktif fetch) + skeleton kartu/tabel** — pemicu: `switchTab()` 5 tab. (referensi pola §7: `TableSkeleton`)
- [ ] [P3] **Empty webhook/snapshot/kunci (CTA register/create/issue)** — pemicu: list kosong. (referensi pola §7: `EmptyState`)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Toggle Maint Mode | Aksi env `POST` maint on/off + dialog + audit | TERDEFINISI DI MOCKUP |
| Klik `Export Bundle (JSON/YAML)` | Unduh file (aksi) | TERDEFINISI DI MOCKUP |
| Klik `Save System Parameters` | `PUT` + banner `TX-904128` | TERDEFINISI DI MOCKUP |
| Pindah 5 tab | State tab (produksi: `?tab=`) | TAK TERDEFINISI |
| Klik `Re-index Facilities` | Job reindex; hasil di `/facilities` | TERDEFINISI DI MOCKUP |
| Klik `Configure` per baris sekuens | Drawer editor pola nomor | TAK TERDEFINISI |
| Klik `Reset Counters` | Aksi destruktif + dialog + audit | TAK TERDEFINISI |
| Klik seed reload/purge/telemetry | Job async + banner | TERDEFINISI DI MOCKUP |
| Klik `Create Ad-hoc Snapshot Now` | `POST` snapshot → baris baru | TERDEFINISI DI MOCKUP |
| Klik `Download TAR.GZ` | Unduh arsip | TERDEFINISI DI MOCKUP |
| Klik `Trigger Restore Simulation` | Viewer hasil simulasi | TAK TERDEFINISI |
| Klik `Configure Endpoints` / `Send Test Email` / `Re-sync Ledgers` | Drawer konfigurasi integrasi | TAK TERDEFINISI |
| Klik `Test Connection` / `Ping` webhook | Aksi inline + status health/latency | TERDEFINISI DI MOCKUP |
| Klik `Edit` / `Register New Webhook URL` | Drawer editor webhook | TAK TERDEFINISI |
| Klik `Issue New API Credential` / `Reveal` / `Rotate` | Aksi kredensial + dialog sekali-tampil | TAK TERDEFINISI |

## UI State Variants Patterns (`ui_state_variants_patterns/`)
> Sumber: docs/ui-audit/ui-state-patterns.md + docs/ui-audit/pass2/ui-state-patterns.md, readiness §2 (baris `ui_state_variants_patterns`: BUKAN route) + §3 (N/A kontrak komponen) + §5 (adopsi di semua file baru), navigation-audit.md §2 (bukan route) + §4 item 14. **BUKAN route** — lab pola/kontrak komponen untuk semua halaman; tidak dikunjungi. Koreksi faktual: pass-1 §2 salah menyatakan tidak ada sidebar `data-path`; verifikasi pass-2: file MEMILIKI sidebar global identik (`<aside>` 1, `data-path` 15 item) dan `screen.png` menyorot `Operations Dashboard` sebagai fallback default (wajar untuk non-route). Dependensi/anti-artifak contoh dalam file (pakai kanonis saat seeding, jangan replikasi): `WO-9042` → `WO-2026-####`; `Elena Rostova` → `Elena Voronova`; `TECH-094` → skema `RFID-*`; `AST-CHILLER-03` → `AST-HVAC-004`. Label `HTMX v1.9.12`/`hx-trigger` hanya teks demo — prod memakai SWR polling (keputusan migrasi).
### 1. Missing Sub-Pages — N/A (BUKAN route; gap = pembangunan + adopsi komponen bersama `@/components/states/`)
- [ ] [P2] **Komponen `EmptyState` (§01: clean queue + stok nominal)** — adopsi di `/service-requests`, `/inventory`, `/reports`, `/notifications`, `/audit-logs`, `/(field)/sync`. ([SUDAH-DI-READINESS §2/—]; sumber: ui-state-patterns.md §3 item 1)
- [ ] [P2] **Komponen `FormField` + guard submit (§02: error merah + ikon, sukses hijau + lock SCADA, submit disabled beralasan, counter 38/250)** — adopsi di dispatch WO, provision user (`/organization`), query builder (`/reports`), konfigurasi (`/settings`). ([SUDAH-DI-READINESS §2/—]; sumber: ui-state-patterns.md §3 item 2)
- [ ] [P2] **Komponen `OfflineBanner` (2A: `Reconnecting in 4s`, indexedDB, `Force Ping Now`, counter 4 WO queued)** — adopsi di shell `(dispatch)` + `(field)` + buffer `idb-keyval`. ([SUDAH-DI-READINESS §2/—]; sumber: ui-state-patterns.md §3 item 3)
- [ ] [P2] **Komponen `ErrorToast` + trace (2B: `Trace: #ERR-xxxx`, `Retry`/`Copy Log`)** — adopsi di semua mutation. ([SUDAH-DI-READINESS §2/—]; sumber: ui-state-patterns.md §3 item 4)
- [ ] [P3] **Komponen `TableSkeleton` + polling meta (§03: 4 baris `animate-pulse`, interval + target container)** — adopsi di `/operations`, `/work-orders`, `/audit-logs`. ([SUDAH-DI-READINESS §2/—]; sumber: ui-state-patterns.md §3 item 5)
- [ ] [P3] **Standar hover-reveal aksi baris + focus ring 2px offset + kanban drag** — adopsi global tabel/kanban + klaim `WCAG AA 2px offset`. ([SUDAH-DI-READINESS §2/—]; sumber: ui-state-patterns.md §3 item 6 + pass2 §7b)
### 2. Undefined Micro-Interactions — vocabulary acuan semua layar (demo di mockup TERDEFINISI; wiring prod TAK TERDEFINISI — lihat kolom Status §3)
- [ ] [P2] **`Force Ping Now` + flush antrean indexedDB saat online kembali** — pemicu: banner offline 2A. (referensi pola §7: `OfflineBanner` itu sendiri; kontrak prod)
- [ ] [P2] **`Retry Request` idempoten (`Idempotency-Key`) + `Copy Log` trace** — pemicu: toast 500 2B. (referensi pola §7: `ErrorToast` itu sendiri; kontrak prod)
- [ ] [P3] **Skeleton → baris nyata per baris (`/work-orders/[id]`)** — pemicu: selesai poll 15s/30s + penanda `STALE`. (referensi pola §7: `TableSkeleton` itu sendiri)
- [ ] [P3] **Hover-reveal aksi baris (view/edit) + focus ring + kanban elevated** — pemicu: hover/fokus/drag (`-translate-y-1 shadow-xl cursor-grab`). ([BARU] sebagai kontrak prod; demo TERDEFINISI)
- [ ] [P3] **Guard submit disabled + alasan + counter + LOTO wajib** — pemicu: form dispatch (2 errors, scope 38/250, checkbox OSHA 480V belum centang). (referensi pola §7: `FormField` itu sendiri)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik `Toggle Error Toast` | Toggle `#state-toast` inline (demo) | TERDEFINISI DI MOCKUP |
| Klik close pada Pattern 2B | `hidden` pada `#state-toast` (demo) | TERDEFINISI DI MOCKUP |
| Klik CTA contoh §01 (`View Archived Requests`, `Submit New Request`, `Review Par Levels`, `Create Requisition`) | Ilustrasi pola, bukan navigasi (`/service-requests?state=archived`, `/inventory?view=par`, `/purchasing/new?sku=` ikut hub masing-masing) | TERDEFINISI DI MOCKUP |
| Submit form demo §02 (`onsubmit preventDefault`) | Tidak submit nyata; prod → `POST /api/v1/work-orders` → `/work-orders/[id]` | TAK TERDEFINISI |
| Klik `Force Ping Now` (2A demo) | Prod: `POST /api/v1/telemetry/ping` + flush antrean | TAK TERDEFINISI |
| Klik `Retry Request` / `Copy Log` (2B demo) | Prod: ulangi idempoten + clipboard trace | TAK TERDEFINISI |
| Hover baris / fokus keyboard / drag kanban | Preview drawer / form edit / `PATCH` status kolom (prod) | TAK TERDEFINISI |

## Apex Ops Logo (`apex_ops_logo/`)
> Sumber: docs/ui-audit/logo.md + docs/ui-audit/pass2/logo.md, readiness §3 (komponen `Logo` tunggal) + §5 (adopsi di semua file baru), navigation-audit.md §5 (duplikasi markup → satu komponen; varian MISSING). **BUKAN route** — master aset SVG (`viewBox 160×40`: tile `#1E40AF` rx8 + apex `#60A5FA` + node putih + baseline `#93C5FD` + `APEX #0F172A`/`OPS #2563EB` + tagline `#64748B`). Catatan presisi: 7 baris (pass-1) vs 8 baris dengan tag penutup (pass-2) — setara. `screen.png` hanya me-render mark kecil (±5,9 KB, tanpa wordmark) — cukup untuk mark, bukan lockup penuh.
### 1. Missing Sub-Pages — N/A (BUKAN route; gap = ekspor aset + komponen tunggal)
- [ ] [P2] **Komponen tunggal `Logo`/`LogoMark` (`props: variant, size`; `alt`/aria-label selalu ada)** — pengganti markup logo yang diduplikasi tiap header hub. ([SUDAH-DI-READINESS §3]; sumber: logo.md §3 + pass2/logo.md §3 item 1)
- [ ] [P2] **Varian `logo-white.svg` (wordmark+tagline putih untuk sidebar gelap) + `mark.svg` (36×36) + `favicon.svg`/`.ico` + PWA icon** — tidak ada di master. ([SUDAH-DI-READINESS §3]; sumber: logo.md §1+§3 + pass2/logo.md §3 item 2)
- [ ] [P3] **Keputusan tipografi wordmark (system-ui vs Inter sistem A dengan tracking `-0.02em`/`0.08em` vs outline ke path)** — agar render deterministik. ([BARU]; sumber: logo.md §3 item 3 + pass2/logo.md §3 item 3)
### 2. Undefined Micro-Interactions — N/A aset statis; padanan perilaku yang harus didefinisikan
- [ ] [P3] **`alt="Apex Ops logo"`/aria-label + fallback inisial `AO` bila file gagal dimuat** — pemicu: aset logo gagal load. ([BARU]; sumber: logo.md §1 State UI)
- [ ] [P3] **`Skeleton` kotak 36×36 + baris teks saat logo remote loading** — pemicu: logo remote (tidak berlaku bila SVG inline lokal). ([BARU]; sumber: logo.md §1 State UI)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik logo di sidebar/header tiap halaman | `/` (landing atau `/operations`) — konvensi global | TERDEFINISI DI MOCKUP |
| Render file `apex_ops_logo/code.html` sendiri | N/A — aset, bukan route | TERDEFINISI DI MOCKUP |
| Muat varian putih/mark/favicon | `logo-white.svg` / `mark.svg` / `favicon.ico` | TAK TERDEFINISI |
