# Kanon Data Apex Ops — Satu Sumber Kebenaran

> Hasil kanonisasi 2026-09-13. Setiap konflik antar-mockup Stitch diputuskan
> SATU nilai kanonis. Prompt generate (Opsi 1–6) wajib menyertakan klausa CANON
> dan memakai nilai di bawah — bukan nilai artefak.
> Bukti dikumpulkan via `rg` langsung dari `code.html` (bukan dari ingatan audit).

## Aturan format ID (berlaku global)

| Entitas | Format kanon | Contoh |
|---|---|---|
| Work order | `WO-2026-NNNN` (selalu penuh, tanpa singkatan) | `WO-2026-0894` |
| Service request | `SR-2026-NNNN` | `SR-2026-0894` |
| Aset | `AST-XXX-NNN` | `AST-HVAC-004` |
| Suku cadang | `PART-XXX-NNNN` | `PART-SEAL-8821` |
| Inspeksi | `INS-2026-NNNN` | `INS-2026-0412` |
| Temuan | `FND-2026-NNNN` | `FND-2026-0188` |
| Purchase order | `PO-2026-NNNN` | `PO-2026-0298` |
| Purchase request | `PR-2026-NNNN` (jangan dicampur dengan PO) | `PR-2026-0314` |
| MSA | `MSA-YYYY-XXX-NN` | `MSA-2024-TRN-09` |
| PM plan | `PM-PLN-NNNN` | `PM-PLN-0104` |
| Template inspeksi | `TMPL-XXX-XX-NN` (valid lintas 3 layar, tanpa perubahan) | `TMPL-HVAC-CHL-02` |
| Kode ruangan | `B-NNN` + label "Room" (bukan WO) | `#B-201 Emer Gen Vault` |

## 1. Identitas & data master

| # | Konflik | Bukti rg | Keputusan kanon | Alasan & aksi generate |
|---|---|---|---|---|
| C1 | Pekerjaan seal chiller diklaim 2 WO | `WO-2026-0894` 16× di 10 file vs `WO-2026-8802` 2× hanya di findings desk | **WO-2026-0894** pada **AST-HVAC-004**; alur `FND-2026-0188 → WO-2026-0894` | Mayoritas + rantai registry DEFECT ACTIVE. `8802` = artefak, di-rewire |
| C2 | Nomor gembok LOTO | `#4092` (mobile: "Padlock #4092 Seal Intact") vs `M-44` (WO hub, panel DP-02) | **Gembok fisik `#4092`**; `M-44` = label titik lockout Panel DP-02, bukan nomor gembok | Dua hal berbeda yang tertukar label. Tampilkan keduanya dengan label benar |
| C3 | Harga `PART-SEAL-8821` | `$1,450.00` eksplisit (findings line item, CRIB-B/Bin C-04); klaim `$1,420` tak terkonfirmasi di inventory (angka 1,420 di repo = telemetry msgs/sec — tabrakan baca) | **$1,450.00** | Sumber eksplisit menang. `1,420` butuh verifikasi ulang saat seeding |
| C4 | OEM `AST-HVAC-004` | Trane: registry row "Trane EarthWise CVHE • S/N: TRA-99201-B" + MSA Trane Care Platinum #TC-8891-B + manual Trane_CVHE.pdf + vendor Trane. Daikin: hanya asset-detail (WAR-99214-DK, P/N 330291-C) | **Trane** (EarthWise CVHE, S/N TRA-99201-B) | Rantai MSA+manual+vendor menang 4-lawan-1. Entri Daikin di-rewire ke Trane |
| C5 | Skor kesehatan `AST-HVAC-004` | `68/100 NEEDS OVERHAUL` (teks eksplisit registry) vs donat `88` (svg asset-detail) | **68/100 NEEDS OVERHAUL** | Konsisten dengan DEFECT ACTIVE + status CRITICAL. Donat 88 = artefak |
| C6 | ID tenant | `APX-NUSA-01` (org hub + audit trail) vs `APX-GL-9021` (settings saja) | **APX-NUSA-01** | Konsisten operasi Nusantara/Jakarta. Settings diperbaiki |
| C7 | Ambang PM meter | Aturan tertulis `RUN_HOURS >= 5000` (PM hub) vs sel matriks `2.500` | **5000 jam** | Aturan tertulis menang. Sel 2.500 diperbaiki. `PM-PLN-0104` = batch parent (pass-2) |
| C8 | Bin suku cadang | `CRIB-B / Bay 01` (audit-trail GRN + purchasing autofill) vs `SUB-LCK-4B` (klaim tak terkonfirmasi via grep) | **CRIB-B / Bay 01** | Dua sumber vs nol sumber. `SUB-LCK-4B` verifikasi saat seeding |
| C9 | Bearing SKU `6205 vs 6204` | Kedua varian **tak ditemukan via grep** (`PART-BRG-620[45]` nol hasil) | **DITUNDA — verifikasi saat seeding** | Klaim audit belum terkonfirmasi. Format tetap `PART-BRG-NNNN` |
| C10 | Klaim `CHILL-NUSA-04` / `WO-0894` pendek | Keduanya TERKONFIRMASI ADA: `CHILL-NUSA-04` (purchasing:599 Critical Asset); `WO-0894` (facility SVG:408); bonus `WO-9042` (ui-states:403) | **GUGUR — artefak, di-rewire**: `CHILL-NUSA-04`→`AST-HVAC-004`; `WO-0894`→`WO-2026-0894`; `WO-9042`→`WO-2026-0904` | Fase A: klaim (tak ditemukan) DICABUT. Format penuh (§ atas) ditegakkan di semua file baru |
| C11 | Sisa MSA Trane | Tabel `ACTIVE (312d left)` + `MSA-2024-TRN-09` vs kartu lifecycle `288d` | **312d, MSA-2024-TRN-09** | Status tabel + kode MSA menang. Kartu diperbaiki |
| C12 | Progres `INS-2026-0412` | Klaim 65% (hub) vs 50% (mobile), angka **tak terkonfirmasi via grep** | **Sementara 65% (hub antrean otoritatif), VERIFIKASI ULANG** | Antrean hub pemilik progres. Mobile diperbaiki setelah verifikasi |

## 2. Orang & organisasi

| # | Konflik | Bukti rg | Keputusan kanon |
|---|---|---|---|
| C13 | Nama engineer | `Elena Voronova` 5+ file (audit-trail, vendors, org, notifications) vs `Rostova` 1× (ui-states) | **Elena Voronova**. `Rostova` = typo, diperbaiki |
| C14 | `Elena Moreno` (SR triage) | 1 layar: service-requests:367 (`Elena Moreno`, requestor) — tanpa kaitan lain; Voronova 5+ file (engineer lapangan); `Rostova` = typo (ui-states:443, findings:267, field:316) | **[ASUMSI-OTOMATIS] Persona TERPISAH**: `Elena Moreno` = requestor/front-desk di SR triage; `Elena Voronova` = engineer lapangan. Jangan digabung (default CODEX.md §0) | Menunggu konfirmasi user saat review; bila user menyatakan alias, kanon direvisi |
| C15 | Jumlah roles | Org hub (pemilik RBAC) `6 Roles` vs settings `8 Roles` | **6 Roles**. Settings diperbaiki |
| C16 | Shift A | `07:00–15:30 WIB` (notifications + opsi SR "Shift A") vs kartu ABAC `06:00–22:00` vs work-week settings `07:00–22:00 Sab` | **Shift A = 07:00–15:30 WIB**. Kartu ABAC diperbaiki. Work-week settings = jam operasional site (Sen–Sab 07:00–22:00), bukan definisi shift |
| C17 | Teknisi contoh `TECH-094` | Hanya ui-states | **Ganti format `RFID-*`** sesuai follower RFID repo |

## 3. Waktu, locale, teknis

| # | Konflik | Keputusan kanon |
|---|---|---|
| C18 | Zona waktu | Tampilan UI = **WIB (Asia/Jakarta, UTC+7)**. **UTC hanya untuk timestamp sistem/ledger** (gaya "Today 14:32 UTC") |
| C19 | Telepon `+1 (555)` fiktif (vendors 4×, SR 1×) | Ganti format **+62** (kantor `+62-21-…`, seluler `+62-812-…`) |
| C20 | Versi API | **v1 kanonis**. `HTMX POST /api/v2/procurement/pr-0314/endorse` (audit-trail) di-rewire ke **v1** |
| C21 | Secret `apx_live_sec_8921a9fb014…` plain di settings | **Dianggap bocor → rotasi saat seeding**. Prod: tampil `last4` + reveal sekali-tampil + PIN approver berkedaluwarsa |
| C22 | Countdown SLA `42m` (notifications, WO hub, SR konsisten) + envelope `$64,200.00` (purchasing) | **Kanon, tanpa perubahan** (3-lawan-0) |

## 4. Kebijakan media & artefak (bukan data — jangan direplikasi)

- Foto udara Chicago (facility), EXIF `48.12°N 11.58°E` (findings), avatar `googleusercontent` (org) → ganti placeholder lokal Nusantara saat seeding.
- `screen.png` reports & notifications salah sorot nav (biru di Audit Trail) → catat, jangan jadikan acuan nav.
- Bottom-nav mobile + `<title>Run Checklist</title>` di purchasing/vendors, `confirm()`/`alert()` demo, contoh `WO-9042` (ganti `WO-2026-0904`) → larangan ANTI-ARTIFACTS.

## 5. Klausa CANON (tempel ke semua prompt Opsi 1–6)

```text
CANON (docs/CANON_DATA.md Fase A final, wajib dipatuhi): WO seal =
WO-2026-0894 @ AST-HVAC-004 (Trane EarthWise CVHE S/N TRA-99201-B, skor 68
NEEDS OVERHAUL); LOTO padlock #4092 (M-44 = titik lockout Panel DP-02);
seal PART-SEAL-8821 = $1,450.00 @ CRIB-B/Bay 01 (ledger H1 total $1,765.00);
bearing PART-BRG-6204 vs PART-BRG-6205 = DUA SKU BERBEDA (jangan digabung);
tenant APX-NUSA-01; 6 Roles; Shift A 07:00-15:30 WIB; INS-2026-0412 = 65%;
Elena Voronova (engineer) vs Elena Moreno (requestor SR, persona terpisah
[ASUMSI-OTOMATIS]); API v1; UI WIB (UTC khusus ledger); telepon +62;
secret last4 + rotasi. ID SELALU format penuh (WO-2026-0894, AST-HVAC-004,
WO-2026-0904 — singkatan WO-0894/CHILL-NUSA-04/WO-9042 = ARTEFAK GUGUR).
PR-* (request) vs PO-* (order) jangan dicampur.
```
