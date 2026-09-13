# Audit Kesiapan Multi-Page Generation — Apex Ops

> Tanggal: 2026-09-13. Status: AUDIT (dokumen dulu, belum ada generate halaman).
> Latar: 4 draf prompt anti-shortcut (Opsi 1 Master, Opsi 2 Chunking/Estafet,
> Opsi 3 Recovery, Opsi 4 Wiring) diaudit terhadap realitas repo sebelum boleh dipakai
> ke Stitch/Bolt/Cursor. Keputusan user: output = **HTML standalone**,
> adaptasi teknologi menyusul hasil audit ini.
> Rujukan: `docs/ui-audit/navigation-audit.md` (§3 peta navigasi, §4 missing pages,
> §5 inkonsistensi, §6 temuan lintas layar), `docs/ui-audit/*.md` (audit 20/20 +
> pass-2), `AGENTS.md`, `TODO.md`.

---

## 1. Gap Analysis: 4 Draf Prompt vs Realitas Repo

| # | Gap | Tingkat | Penjelasan & perbaikan teks |
|---|---|---|---|
| G1 | Draf menyebut **Bootstrap 5** (`Langkah 1` Opsi 2, implisit di Opsi 1) | **BLOCKER** | Repo memakai **Tailwind** (Play CDN di mockup) + font Inter / JetBrains Mono / (Space Grotesk khusus field) + ikon Material Symbols Outlined + token sistem **A** (dispatch/desktop: canvas `#F8FAFC`, primary cobalt `#2563EB`/`#1E40AF`, radius 4/8px) vs sistem **B** (field/rugged: border tebal 1.5–2px `#0F172A`, hard shadow, touch target min 48×48px). AI yang diberi "Bootstrap 5" akan menghasilkan UI di luar design system. Ganti klausa teknologi dengan teks di §4. |
| G2 | Draf tidak melarang **artefak copy-paste Stitch** | **BLOCKER** | Audit menemukan pola berulang yang TIDAK boleh direplikasi: bottom-nav mobile (`my-audits/run-checklist/report-finding/sync-status`) muncul di halaman desktop purchasing/vendors; `<title>Run Checklist</title>` di halaman purchasing; foto udara Chicago untuk kampus Nusantara; foto bukti ber-EXIF Eropa vs GPS Kalimantan; avatar hotlink `googleusercontent`; `screen.png` salah sorot nav. Setiap prompt wajib memuat daftar larangan ini (§4 memuatnya). |
| G3 | Draf tidak mengikat **kanon data** | **BLOCKER** | Audit dua pass menemukan identitas ganda yang akan diwarisi halaman baru bila tak diputuskan dulu: OEM `AST-HVAC-004` (Trane vs Daikin); 2 WO mengklaim pekerjaan seal chiller yang sama (`WO-2026-0894` vs `WO-2026-8802`); harga `PART-SEAL-8821` ($1.420 vs $1.450); SKU bearing (`6205` vs `6204`); tenant ganda (`APX-GL-9021` vs `APX-NUSA-01`); seed `8 Roles` vs `6 Roles`; Shift A (`07:00-15:30 WIB` vs `06:00-22:00`); sisa MSA Trane (312d vs 288d); progres `INS-2026-0412` (65% vs 50%); gembok LOTO (`#4092` vs `#M-44`); ID disingkat (`WO-0894`, `CHILL-NUSA-04`) vs format kanonis (`WO-2026-0894`, `AST-HVAC-004`). Prompt final wajib memuat format ID kanonis + larangan mengarang fakta baru (lihat §4, klausa CANON). |
| G4 | Draf tidak merujuk **DoD & aturan repo** | WARNING | `AGENTS.md` menuntut: satu layar = satu unit kerja; verifikasi vs `screen.png`; token DESIGN.md; ID operasional monospace; responsif 3 breakpoint; tanpa CDN Tailwind play di kode produksi; temuan dicatat di PROGRESS (jangan diam-diam diperbaiki). Opsi 2 (chunking) sudah selaras dengan aturan ini — jadikan mode default; Opsi 1 hanya untuk modul ≤3 halaman. Prompt final mencantumkan DoD ringkas (§4). |
| G5 | Model filename `NAMA_FILE.html` vs route | OK (dengan konvensi) | Sesuai keputusan (HTML standalone), model filename tetap dipakai, tapi wajib konvensi: `kebab-case`, sidebar identik 15 data-path di semua file, setiap tombol Next/View Detail/Submit punya `href` ke filename eksak. Tabel pemetaan filename ada di §2. |
| G6 | Opsi 4 menyebut `hx-get` | OK (terbatas) | Satu-satunya interaksi nyata di arsip adalah fragment HTMX di layar facility — untuk prototipe standalone cukup `href` standar; `hx-get` hanya bila meniru perilaku facility dan harus dinyatakan eksplisit. |
| G7 | Risiko pemotongan token pada modul besar | WARNING | Mitigasi: selalu Opsi 2 (maksimal 1 halaman per request), Opsi 1 dilarang untuk modul >3 halaman. Inilah inti "anti-shortcut" dan sudah benar arahnya di draf. |

**Kesimpulan §1:** draf layak dipakai **setelah** G1–G3 diperbaiki (teks perbaikan di §4).
G4–G7 bersifat prosedural dan ditutup oleh urutan kerja §5.

---

## 2. Inventarisasi Sasaran Opsi 3 (Recovery) — 14 Missing Pages

> Sumber: `navigation-audit.md` §4. Kolom "File standalone" adalah nama file
> yang diminta ke AI saat memakai prompt Recovery/Estafet (§4).
> Kolom "Dependensi kanon" = keputusan data yang HARUS diambil dulu (lihat G3).

### Prioritas HIGH (dead-end di jalur kerja utama)

| # | Missing page | File standalone | Pemilik modul | Dependensi kanon |
|---|---|---|---|---|
| H1 | Detail Work Order (`/work-orders/[id]`) — dead-end terbesar, dirujuk semua layar konversi/dispatch | `work-order-detail.html` | Work Orders | Putuskan WO seal ganda (0894 vs 8802); LOTO `#4092` vs `#M-44`; format `WO-2026-XXXX` |
| H2 | 3 route field: daftar audit, temuan baru, status sync (`/(field)/audits`, `/(field)/findings/new`, `/(field)/sync`) — alur run→submit→sync terputus | `field-audits.html`, `field-finding-new.html`, `field-sync.html` (sistem B) | Mobile Execution | Progres `INS-2026-0412` (65 vs 50); GPS Kalimantan `0.7893°S, 113.9213°E`; override PASS = modal PIN (bukan `alert()`) |
| H3 | Detail PR/PO/GRN + 3-Way Match (`/purchasing/[id]`) — tombol `View PO`, `Review`, `Audit`, `Authorize` tanpa tujuan | `purchase-detail.html` | Purchasing | Pisahkan prefix PR vs PO; `CHILL-NUSA-04` → `AST-HVAC-004`; rantai `PO-2026-0298`→GRN→ledger sebagai acuan benar |

### Prioritas MEDIUM

| # | Missing page | File standalone / bentuk | Dependensi kanon |
|---|---|---|---|
| M1 | Detail vendor + MSA document viewer (`/vendors/[id]`) — `View Executed PDF`, `Initiate Amendment` menggantung | `vendor-detail.html` | Sisa MSA Trane (312d vs 288d) |
| M2 | Detail service request (`/service-requests/[id]`) — hasil konversi SR→WO & riwayat per tiket belum terdefinisi | `service-request-detail.html` | Semantik hasil konversi ( M2 menutup dead-end empty state `Review Converted WOs`) |
| M3 | Auth: login / MFA / SSO callback (`(auth)/login`) — wajib produksi, tak ada di mockup mana pun | `login.html` | Kebijakan SSO/MFA/SCIM dari org hub |
| M4 | Target global `+ New Dispatch / Request` — ada di semua header tanpa tujuan seragam | Bukan halaman: command palette (`⌘K`) + modal kontekstual | Diputuskan sekali, berlaku global |
| M5 | Prefill flows (`Create WO`/`Schedule PM` dari registry, `Log Defect`/`Dispatch Room Audit` dari facility) | Bukan halaman baru: konvensi query (`?asset=`, `?location=`) | Disepakati sebelum wiring (§3) |
| M6 | BIM 3D viewer (`Open BIM 3D Model`) | Putuskan: tab asset-detail vs `asset-bim.html` | — |

### Prioritas LOW (penunjang / enhancement, setelah HIGH+MEDIUM)

| # | Item | Catatan |
|---|---|---|
| L1 | Shift plan view (`Shift Plan →`) + shift handover | Butuh kanon jam Shift A (G3); tersebar di PM/WO/field hub |
| L2 | User profile & session (avatar header, `Revoke Active Session`, `Audit Impersonate`) | Aksi destruktif wajib dialog konfirmasi (temuan audit: sekali klik tanpa konfirmasi) |
| L3 | Print views (`Print Work Permit`, `Print PO Batches`, `Print Badge QR`) | Layout cetak, bukan alur kerja |
| L4 | Global search (`⌘K`) | Enhancement; tidak ada di mockup mana pun |
| — | `ui_state_variants_patterns` | BUKAN route — referensi pola (skeleton/toast/empty/error) untuk semua halaman baru |

---

## 3. Inventarisasi Sasaran Opsi 4 (Wiring) — Elemen Mati per Layar

> "Mati" = `href="#"`, tanpa handler JS, atau target tak terdefinisi (dari audit
> 20/20 + pass-2). Target kanan adalah file §2 atau konvensi §2/M5.
> Prasyarat: H1–H3 sudah ada sebagai file (kalau belum, Opsi 3 dulu).

| Layar | Elemen mati | Target wiring |
|---|---|---|
| operations-dashboard | Baris tabel dispatch (WO-2024-0892/0888/0901/0904); tombol `+ New Dispatch / Request` | `work-order-detail.html`; M4 |
| work-orders | 5 link histori Last Executed; `View Evidence`; `Print Work Permit`; `Shift Handover`; `Request Tech Assist`; `Export WO Log` | `work-order-detail.html`; evidence viewer; L3; L1; flow assist; unduhan (kait `/reports`) |
| service-requests | `Convert to Work Order & Dispatch Lead`; `Review Converted WOs` (empty state); `Change` (linked asset); `Batch Triage`, `Re-Assign Zone`; `Export Ticket Log` | `work-order-detail.html` (hasil konversi); M2; modal lookup aset (M5); perilaku batch didefinisikan; unduhan |
| preventive-maintenance | Link WO histori; `New PM Plan Definition`; ikon checklist (`CL-HVAC-Q` dkk) | `work-order-detail.html`; form plan (modal/`pm-plan-new.html`); detail checklist plan |
| field-inspections | `Open Run` (`INS-2026-0412`); `Preview`; `Export Audit Log` | `mobile-execution.html` setara run (mockup mobile EXISTS); pratinjau read-only; unduhan |
| findings-conversion | `Audit Integrity Report` | Viewer laporan integritas ledger |
| mobile-execution (sistem B) | `Submit Audit & Auto-Dispatch WO` (kedua target MISSING) | `field-audits.html` + `work-order-detail.html` (H1, H2) |
| asset-registry | `Open BIM 3D Model`; `Create WO`/`Schedule PM` | M6; prefill M5 |
| asset-detail | Link `#WO-2025-0812`, `#PO-2025-0081`, `#TO-8891`, `#ADJ-2024-Q4`; sub-tab kosong (`IoT Diagnostics`, `PM Schedules`, `Compliance & Docs`) | `work-order-detail.html` / `purchase-detail.html` / halaman terkait; isi tab atau cabut tab |
| facilities | `Dispatch Room Audit`; `Log Defect`; hasil `TMPL-HVAC-CHL-02` | Prefill M5; `field-inspection-detail.html` |
| inventory | Aksi posting mutasi (butuh `Idempotency-Key`, temuan pass-2); guardrail SKU CRITICAL | Drawer/endpoint didefinisikan; bukan navigasi |
| purchasing | `View PO`, `Review`, `Audit`, `Authorize`, `Receive`, `GRN-9941` | `purchase-detail.html` (H3) + tab review/audit/match |
| vendors | Baris vendor/chevron; `View Executed PDF`; `Initiate Amendment`; `Dispatch Work Order`; `Commendation` | `vendor-detail.html` (M1); MSA viewer; flow amandemen; prefill `?vendorId=`; aksi apresiasi |
| reports | `Preview Dossier` (→ `/reports/[id]`); `Schedule Automated Dispatch`; `Schedule Configuration`; `+ New Dispatch / Request` | `report-dossier.html`; drawer jadwal; M4 |
| notifications | `View Work Order` (WO-2026-0894); `Revoke Session`; `Authorize PO` | `work-order-detail.html` (H1); dialog konfirmasi (L2) |
| organization-rbac | Kartu user `WO-2026-0894`; `Audit Impersonate` | `work-order-detail.html` (H1); mode impersonasi + banner |
| settings | `Configure` sekuens; `Reset Counters`; `Trigger Restore Simulation`; `Configure Endpoints`; webhook `Test/Ping/Edit` | Drawer editor; dialog konfirmasi destruktif; viewer hasil simulasi. **BLOKER KEAMANAN: secret `apx_live_sec_...` terpapar di mockup — halaman baru TIDAK boleh meniru pola ini (hanya `last4`).** |
| audit-trail | Filter/klinik baris (`highlightRow`/`switchView`); pagination 7396 | Aksi inline, bukan navigasi |
| ui-state-patterns, logo | N/A (kontrak komponen, bukan route) | Adopsi pola + komponen `Logo` tunggal |

---

## 4. Prompt Final Adaptasi (Siap Tempel — HTML Standalone + Tailwind)

> Perubahan dari draf: teknologi diganti Tailwind + token A/B (G1), tambah
> klausa ANTI-ARTEFAK (G2), klausa CANON data (G3), DoD ringkas (G4).
> Ganti `[BRACKET]` sesuai modul. Bahasa Inggris dipertahankan (AI generator
> lebih patuh pada instruksi Inggris).

### Opsi 1 — Master Anti-Shortcut (modul ≤3 halaman)

```text
**CRITICAL INSTRUCTION FOR MULTI-PAGE GENERATION:**
I need a complete end-to-end flow for the [MODULE NAME, e.g. Work Order Detail] module.
Do NOT compress this flow into a single page, a single component, or use tabs to fake navigation. Do NOT use placeholders like "<!-- rest of code -->" or truncated snippets.

Tech stack (STRICT): standalone HTML + Tailwind CSS (CDN play), fonts Inter (body) + JetBrains Mono (all operational IDs) [+ Space Grotesk headlines ONLY for rugged/field screens], Material Symbols Outlined icons.
Design tokens: [SYSTEM A for desktop/dispatch — canvas #F8FAFC, primary cobalt #2563EB/#1E40AF, radius 4/8px, subtle shadows] | [SYSTEM B for field/rugged — 1.5–2px #0F172A borders, hard shadow `0 4px 0 0 rgba(15,23,42,.9)`, min 48×48px touch targets].
Reuse the exact sidebar from the existing screens (same 15 nav items, same order, same active-state logic).

You MUST generate [COUNT, max 3] completely distinct HTML files/screens:
1. [FILE_1.html] - [one-line function]
2. [FILE_2.html] - [one-line function]
3. [FILE_3.html] - [one-line function]

CANON (do not invent conflicting facts): operational IDs MUST follow these formats — Work Orders `WO-2026-XXXX`, Assets `AST-XXX-XXX`, Parts `PART-XXX-XXXX`, POs `PO-2026-XXXX`, PRs `PR-2026-XXXX`. Reuse these canonical seeds, never alter them: asset `AST-HVAC-004`, `PO-2026-0298`, ticket `WO-2026-0894`, inspection `INS-2026-0412`.

ANTI-ARTIFACTS (never reproduce): mobile bottom-nav (my-audits/run-checklist/report-finding/sync-status) on desktop screens; wrong <title> values; stock/foreign photography (Chicago aerial, European EXIF locations — operation is Nusantara/Kalimantan, GPS 0.7893°S 113.9213°E); hotlinked avatars; `alert()`/`confirm()` for destructive or override actions (use designed modal dialogs); exposed API secrets (show only last4).

Ensure every "Next", "View Detail", or "Submit" button has the correct `href` pointing directly to the exact filename of the subsequent screen so the prototype works seamlessly. Provide complete, unabridged code for every file.
```

### Opsi 2 — Chunking / Estafet (default untuk modul besar, 1 halaman per request)

Langkah 1:

```text
We are building the [MODULE NAME] flow. There will be [COUNT] pages in total: [FILE_1.html], [FILE_2.html], [FILE_3.html].
[SAME tech-stack + design-token + sidebar paragraph as Option 1.]
[SAME CANON + ANTI-ARTIFACTS paragraphs as Option 1.]

Right now, generate ONLY Page 1: [FILE_1.html].
Provide the complete, unabridged HTML code. Ensure the main action button links via `href` to `[FILE_2.html]`.
```

Langkah 2 (setelah AI selesai, ulangi per halaman):

```text
Perfect. Now generate ONLY Page 2: [FILE_2.html].
Maintain the exact same design system, sidebar layout, and CSS logic as Page 1. [Repeat CANON one-liner: IDs in WO-2026-XXXX / AST-* / PART-* / PO-2026-XXXX formats; reuse canonical seeds.]
Ensure the "Back" button links to `[FILE_1.html]` and the "Next/Submit" button links to `[FILE_3.html]`. Provide the full, unabridged HTML.
```

### Opsi 3 — Recovery Halaman Hilang

```text
You did not generate all the requested pages for this flow. Due to token limits or shortcuts, you missed the detail/sub-pages.

**Task:** Generate the complete, full HTML code for the missing screens ONLY:
1. [MISSING_PAGE_1.html] (e.g. work-order-detail.html — the Detail View when a table row is clicked)
2. [MISSING_PAGE_2.html] (e.g. field-sync.html — the Sync Status screen)

[SAME tech-stack + design-token + sidebar paragraph as Option 1.]
[SAME CANON + ANTI-ARTIFACTS paragraphs as Option 1.]

Do NOT output snippets. I need the entire, standalone HTML files for these missing pages so I can attach them to the existing flow. Wire their entry points: [BUTTON_A] in [EXISTING_FILE.html] must link to [MISSING_PAGE_1.html].
```

### Opsi 4 — Wiring Navigasi Putus

```text
The UI pages for [MODULE NAME] are generated, but the navigation links are broken or missing (currently `href="#"`).

**Task:** Review the interactive elements (buttons, table rows, tabs) in [FILE.html]. Provide the exact HTML snippets I need to update in my code to wire them together:
- [BUTTON_A] must route to `[TARGET_A.html]`
- Table row click on [ROW] must route to `[TARGET_B.html]`
Use standard `href` attributes. Keep the sidebar, design tokens, and canonical IDs ([list the IDs on this screen]) unchanged. Do not restyle anything.
```

### DoD tiap halaman hasil generate (dilampirkan ke setiap request)

```text
Acceptance: (1) layout hierarchy matches the reference screen; (2) design tokens correct (System A vs B); (3) responsive at <768 / 768–1023 / ≥1024; (4) status badges + monospace IDs correct; (5) zero href="#" and zero placeholders remain on this page.
```

---

## 5. Urutan Eksekusi yang Direkomendasikan (setelah audit ini disetujui)

1. **Keputusan kanonisasi (prasyarat, tanpa AI):** tetapkan OEM `AST-HVAC-004`, WO seal tunggal, tenant tunggal, jam Shift A, sisa MSA, progres `INS-2026-0412`, gembok LOTO, versi API kanonis (v1 vs v2), dan rotasi secret settings. Tanpanya, halaman baru mewarisi konflik (G3).
2. **Gelombang HIGH (Opsi 3 + Opsi 2):** H1 `work-order-detail.html` → H2 tiga file field (sistem B) → H3 `purchase-detail.html`. Satu halaman per request; verifikasi vs `screen.png` + token DESIGN.md sebelum lanjut (aturan `AGENTS.md`).
3. **Gelombang MEDIUM (Opsi 3 + Opsi 2):** M1–M3, M6; M4–M5 sebagai keputusan desain + konvensi query (bukan file).
4. **Gelombang Wiring (Opsi 4):** sambungkan elemen §3 per layar, mulai dari layar yang menunjuk ke H1 (dashboard, notifications, org-rbac, PM, asset-detail).
5. **Gelombang LOW:** L1–L4 bila diperlukan; pola ui-states + komponen `Logo` diadopsi di semua file baru.
6. **Pencatatan:** setiap inkonsistensi baru dicatat di `PROGRESS.md` bagian Temuan (jangan diam-diam diperbaiki); `TODO.md` dicentang per halaman.

> Catatan: tabel §2–§3 dokumen ini adalah "daftar belanja" yang dirujuk prompt
> Recovery/Wiring — AI diberi nomor item (mis. "generate H1 + H3") agar tidak
> ada halaman yang terlewat atau digabung.
```

