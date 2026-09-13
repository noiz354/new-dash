# Expansion Checklist — 20 Layar Apex Ops

> Tanggal: 2026-09-13. Status: AUDIT (checklist dulu, NO CODE).
> Metode: 3 batch paralel memverifikasi + memperluas `docs/AUDIT_MULTI_PAGE_READINESS.md`
> §2 (missing pages) + §3 (wiring) terhadap audit 20/20 + pass-2 + navigation-audit.
> Aturan pengikat tiap item: klausa CANON (fakta mockup saja, konflik = dependensi),
> ANTI-ARTIFACTS (tanpa replikasi artefak Stitch), sistem A (desktop) vs B (field).
> Tag: [SUDAH-DI-READINESS §x] = sudah terinventarisasi; [BARU] = temuan checklist ini;
> [ASUMSI] = tanpa sumber mockup/audit.

## Rekap Prioritas Global (270 item)

| Batch | Seksi | Item | P1 | P2 | P3 |
|---|---|---|---|---|---|
| Inti operasi (6 layar) | § Operasi | 73 | 17 | 40 | 16 |
| Aset & resource (6 layar) | § Aset | 106 | 11 | 59 | 36 |
| Governance & sistem (8 layar) | § Governance | 91 | 14 | 49 | 28 |
| **Total** | **20 layar** | **270** | **42** | **148** | **80** |

> P1 = dead-end jalur kerja utama / aksi destruktif tanpa konfirmasi / keamanan.
> P2 = alur medium, batch/prefill, validasi. P3 = low/enhancement.
> State transitions TAK TERDEFINISI di mockup: 148 baris (66 aset + 33 governance + 49 operasi).

---
# Expansion Checklist — Batch Inti Operasi (6 Layar)

> Batch: work orders hub, service requests triage, preventive maintenance hub,
> field inspections hub, findings & conversion desk, mobile field execution.
> Kanon ID: Work Order `WO-2026-XXXX`, aset `AST-*`, parts `PART-*`,
> PO `PO-2026-XXXX`, tenant `APX-NUSA-01`. Konflik yang belum diputus
> (WO seal ganda 0894 vs 8802, LOTO #4092 vs #M-44, progres INS-2026-0412
> 65 vs 50, harga PART-SEAL-8821) ditulis sebagai dependensi, tidak diputus di sini.
> Sistem A (desktop/dispatch) untuk 5 layar pertama; sistem B (rugged: border
> tebal, touch target min 48px) hanya untuk layar mobile. Anti-artifacts:
> tanpa bottom-nav mobile di desktop, tanpa foto/EXIF asing, tanpa avatar hotlink.
> NO CODE — dokumen checklist murni.

## Work Order Management & Execution Hub (`work_order_management_execution_hub/`)

> Sumber: docs/ui-audit/work-orders.md + docs/ui-audit/pass2/work-orders.md, readiness §2 (H1, L1, L3) + §3 baris work-orders, navigation-audit §3–§5.

### 1. Missing Sub-Pages

- [ ] [P1] **Halaman detail Work Order mandiri** — memecah layar ini (de-facto detail WO-2026-0894 atas AST-HVAC-014) dari daftar/kanban 42 WO agar baris pipeline bisa dibuka. (tag: [SUDAH-DI-READINESS §2/H1]; dependensi kanon: WO seal ganda 0894 vs 8802, LOTO #4092 vs #M-44, format WO-2026-XXXX)
- [ ] [P2] **Evidence viewer / galeri bukti** — membuka foto LOTO Step 01 dan dropzone Step 04 lengkap dengan hash verifikasi SHA-256. (tag: [BARU]; audit §2–§3 View Evidence TAK TERDEFINISI; [ASUMSI] bentuk lightbox vs route)
- [ ] [P2] **Drawer requisition parts dengan prefill inventaris** — alur tombol requisition part tambahan ke konteks WO. (tag: [SUDAH-DI-READINESS §2/M5]; konvensi query belum disepakati)
- [ ] [P2] **Alur shift handover** — serah terima checklist terbuka, timer labor berjalan, dan parts antar shift. (tag: [SUDAH-DI-READINESS §2/L1]; dependensi kanon: jam Shift A belum diputus; pass2 menilai MEDIUM sebagai pola lintas-hub)
- [ ] [P2] **Flow request tech assist** — dispatch bantuan teknisi tambahan dari Step 04 aktif. (tag: [BARU]; audit §2 TAK TERDEFINISI; [ASUMSI] bentuk modal vs halaman)
- [ ] [P3] **Print view work permit** — layout cetak izin kerja LOTO plus matriks sign-off. (tag: [SUDAH-DI-READINESS §2/L3])
- [ ] [P3] **Tujuan unduhan Export WO Log** — samakan pola export global via job unduhan kait laporan. (tag: [BARU]; audit §2 TAK TERDEFINISI)

### 2. Undefined Micro-Interactions

- [ ] [P1] **Konfirmasi transisi state berisiko** — pemicu klik Put On Hold, Escalate to Vendor, Mark Task Complete; butuh modal konfirmasi plus alasan, dengan syarat Step 5 plus LOTO plus foto sebelum complete. (tag: referensi pola ui-state-patterns dialog; temuan audit: aksi sekali klik tanpa konfirmasi)
- [ ] [P2] **Autosave dan penanda STALE pada catatan Step 04** — pemicu pengetikan dan poll 10 detik basi; butuh indikator tersimpan, label STALE, dan toast retry saat simpan gagal tanpa menghilangkan draf. (tag: referensi pola ui-state-patterns toast/skeleton)
- [ ] [P2] **Drag kartu antar-lane pipeline** — pemicu drag and drop; butuh update optimistis status plus rollback bila PATCH gagal. (tag: [BARU]; [ASUMSI] perilaku drag belum didefinisikan mockup)
- [ ] [P2] **Validasi inline quick-log labor** — pemicu submit pencatatan jam; butuh durasi dan kode aktivitas wajib diisi. (tag: [BARU]; referensi pola ui-state-patterns form validation)
- [ ] [P3] **Filter cepat keyboard atas pipeline** — pemicu hotkey; butuh command palette lintas entitas WO, aset, parts. (tag: [SUDAH-DI-READINESS §2/L4]; [ASUMSI] cakupan entitas)

### 3. State Transitions

| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik Create WO | Modal buat WO, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik/gusur lane pipeline | Filter tahap / ubah status, tetap di halaman | TAK TERDEFINISI |
| Klik Export WO Log | Job unduhan kait laporan | TAK TERDEFINISI |
| Klik Shift Handover | Alur handover (L1) | TAK TERDEFINISI |
| Klik Print Work Permit | Print view (L3) | TAK TERDEFINISI |
| Klik View Evidence Step 01 | Evidence viewer | TAK TERDEFINISI |
| Klik Request Tech Assist | Flow assist | TAK TERDEFINISI |
| Klik requisition part tambahan | Drawer inventaris prefill (M5) | TAK TERDEFINISI |
| Klik Resume / Put On Hold / Escalate / Mark Complete | Aksi API inline, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik chip AST-HVAC-014 | Detail aset | TERDEFINISI DI MOCKUP |
| Klik referensi SR-2026-0894 | Triase dengan konteks tiket (detail ikut M2) | TERDEFINISI DI MOCKUP |
| Ganti view List / Kanban / Calendar | Query view, tetap di halaman | TERDEFINISI DI MOCKUP |
| Countdown SLA mencapai nol | Pill BREACHED plus eskalasi | TAK TERDEFINISI |

## Service Requests Triage Hub (`service_requests_triage_hub/`)

> Sumber: docs/ui-audit/service-requests.md + docs/ui-audit/pass2/service-requests.md, readiness §2 (H1, M2, M4, M5) + §3 baris service-requests, navigation-audit §3–§5.

### 1. Missing Sub-Pages

- [ ] [P1] **Halaman hasil konversi SR ke WO** — tujuan tombol Convert to Work Order plus Dispatch Lead dan tombol Review Converted WOs di empty state. (tag: [SUDAH-DI-READINESS §2/H1])
- [ ] [P2] **Detail service request per tiket** — riwayat per tiket dan tautan hasil konversi SR ke WO; putuskan query tiket vs route detail penuh. (tag: [SUDAH-DI-READINESS §2/M2]; dependensi: semantik hasil konversi)
- [ ] [P2] **Asset lookup drawer mode pilih** — tujuan tombol Change pada linked asset AST-HVAC-014; mengembalikan ID aset terpilih. (tag: [SUDAH-DI-READINESS §2/M5])
- [ ] [P2] **Definisi perilaku batch bar** — hasil Batch Triage dan Re-Assign Zone atas item ter-checklist. (tag: [BARU]; audit §2–§3 TAK TERDEFINISI; [ASUMSI] bentuk hasil toast vs halaman)
- [ ] [P2] **Taksonomi dispatch level dan kode tipe WO** — definisi global DISPATCH LEVEL 1 vs level lain dan pemetaan kode breakdown, korektif, PM follow-up, inspeksi diagnostik ke SLA. (tag: [BARU]; temuan pass2 §7b; [ASUMSI] nilai level selain 1)
- [ ] [P3] **Target Export Ticket Log** — samakan pola export global via job unduhan. (tag: [BARU]; audit §3 TAK TERDEFINISI)

### 2. Undefined Micro-Interactions

- [ ] [P1] **Konfirmasi konversi dan dispatch P1** — pemicu klik Convert; butuh modal ringkasan tipe WO, aset, teknisi, dan LOTO wajib centang sebelum kirim. (tag: [BARU]; LOTO wajib untuk P1 fakta mockup)
- [ ] [P1] **Penanganan tiket BREACHED** — pemicu SLA negatif pada SR-2026-0887; butuh eskalasi visual plus aksi prioritas penugasan ulang. (tag: [BARU]; [ASUMSI] alur eskalasi breach)
- [ ] [P2] **Validasi form konversi** — tipe WO, aset, dan teknisi wajib; warning overlap PM Shift A non-blokir. (tag: referensi pola ui-state-patterns inline validation)
- [ ] [P2] **Optimistic update dan STALE antrean plus SCADA** — pemicu poll 10 detik; strip basi jadi abu plus label STALE, konversi gagal membuat tiket tetap NEW plus toast. (tag: referensi pola ui-state-patterns toast/skeleton)
- [ ] [P2] **Modal reject atau duplikat dan request-info** — pemicu klik aksi sekunder; butuh alasan duplikat dan pertanyaan wajib. (tag: [BARU]; [ASUMSI] isi field)
- [ ] [P3] **Kirim chat gagal di live room** — bubble merah plus tombol Retry. (tag: referensi pola ui-state-patterns)

### 3. State Transitions

| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik Convert to Work Order plus Dispatch Lead | WO hasil di detail WO (H1) | TAK TERDEFINISI |
| Klik Review Converted WOs di empty state | Daftar WO hasil konversi | TAK TERDEFINISI |
| Klik Change pada linked asset | Drawer lookup aset (M5) | TAK TERDEFINISI |
| Klik Batch Triage / Re-Assign Zone | Hasil batch terdefinisi | TAK TERDEFINISI |
| Klik Export Ticket Log | Job unduhan log tiket | TAK TERDEFINISI |
| Klik Submit New Request | Modal submit, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Request Info / Reject Duplicate | Aksi status inline, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik baris tiket | Seleksi inline, panel kanan berganti | TERDEFINISI DI MOCKUP |
| Tab status, filter, pagination | Query param, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Send di quick reply | Komentar terkirim, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Preview Empty Queue View | Toggle demo, bukan navigasi | TERDEFINISI DI MOCKUP |
| Klik header New Dispatch Request | Command palette plus modal kontekstual (M4) | TAK TERDEFINISI |

## Preventive Maintenance Scheduling & Automation Hub (`preventive_maintenance_scheduling_automation_hub/`)

> Sumber: docs/ui-audit/preventive-maintenance.md + docs/ui-audit/pass2/preventive-maintenance.md, readiness §2 (H1, L1) + §3 baris preventive-maintenance, navigation-audit §3–§5.

### 1. Missing Sub-Pages

- [ ] [P1] **Tujuan 5 link histori Last Executed** — tautan WO-2025-0144, WO-2025-0421, WO-2024-8902, WO-2024-6101, WO-2024-2209 ke detail WO agar audit eksekusi bisa diverifikasi. (tag: [SUDAH-DI-READINESS §2/H1])
- [ ] [P2] **Form definisi plan baru dan edit plan** — tujuan tombol New PM Plan Definition dan ikon edit per baris; putuskan modal vs route baru. (tag: [BARU]; audit §2–§3 TAK TERDEFINISI)
- [ ] [P2] **Checklist detail plan** — viewer atau editor checklist CL-HVAC-Q dan sejenisnya; putuskan berbagi dengan template builder inspeksi lapangan. (tag: [BARU]; dependensi keputusan permukaan checklist)
- [ ] [P2] **Drawer detail plan per baris** — tujuan ikon checklist dan edit per plan. (tag: [BARU]; usulan pass2; [ASUMSI] bentuk drawer)
- [ ] [P3] **Shift plan view** — tujuan Shift Calendar View dan Shift Plan; putuskan tab kalender vs halaman shift. (tag: [SUDAH-DI-READINESS §2/L1]; dependensi kanon jam Shift A; pass2 mengusulkan MEDIUM sebagai pola lintas-hub)
- [ ] [P3] **Hasil export CSV plan** — job unduhan kait laporan. (tag: [BARU]; [ASUMSI] pola export)

### 2. Undefined Micro-Interactions

- [ ] [P2] **Hasil batch dispatch sukses dan gagal parsial** — pemicu Execute Dispatch Batch; butuh toast per plan, antrean tetap berisi saat gagal, dan rollback optimistis. (tag: referensi pola ui-state-patterns toast)
- [ ] [P2] **Validasi form plan baru** — cadence, ambang meter, assignee, dan checklist wajib. (tag: [BARU]; referensi pola ui-state-patterns inline validation)
- [ ] [P2] **Status engine basi dan Modbus putus** — badge berubah merah plus label STALE dengan nilai terakhir dipakai. (tag: referensi pola ui-state-patterns)
- [ ] [P2] **Penanda hasil simulasi vs dispatch nyata** — pemicu Simulate Generation Run; butuh penanda visual agar simulasi tak tertukar dispatch. (tag: [BARU]; usulan pass2 kontrak simulate-run; [ASUMSI] bentuk penanda)
- [ ] [P3] **Urutan ready-first dan sinyal kesiapan dispatch** — tampilkan kesiapan shift, bahan bakar, dan parts staged di antrean. (tag: [BARU]; [ASUMSI] aturan sortir)

### 3. State Transitions

| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik Generate Work Orders Now / Execute Dispatch Batch | Aksi batch inline, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Simulate Generation Run | Simulasi tanpa dispatch, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Dispatch per baris | Aksi single dispatch plus toast | TERDEFINISI DI MOCKUP |
| Klik ikon checklist / edit per baris | Drawer checklist atau form plan | TAK TERDEFINISI |
| Klik 5 link WO histori | Detail WO (H1) | TAK TERDEFINISI |
| Klik New PM Plan Definition | Form plan baru | TAK TERDEFINISI |
| Klik Shift Calendar View | Tampilan kalender shift | TAK TERDEFINISI |
| Klik Shift Plan | Halaman shift plan (L1) | TAK TERDEFINISI |
| Tab kategori, search, pagination | Query param, tetap di halaman | TERDEFINISI DI MOCKUP |
| Tab trigger Hybrid / Calendar / Telemetry | Ganti matriks, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik ikon export CSV | Job unduhan | TAK TERDEFINISI |

## Field Inspections Audit Queue Hub (`field_inspections_audit_queue_hub/`)

> Sumber: docs/ui-audit/field-inspections.md + docs/ui-audit/pass2/field-inspections.md, readiness §2 (H2, L1) + §3 baris field-inspections, navigation-audit §3–§5.

### 1. Missing Sub-Pages

- [ ] [P1] **Route eksekusi mobile per audit** — tujuan Open Run INS-2026-0412 dan fast-link Mobile Tablet Execution View; mockup mobile ada tetapi route belum. (tag: [SUDAH-DI-READINESS §2/H2]; dependensi kanon: progres INS-2026-0412 65 vs 50, GPS Kalimantan)
- [ ] [P1] **Keputusan permukaan findings** — Review Findings INS-2026-0398 dan fast-link conversion desk menaut ke tab atau section findings dengan deep-link temuan terpilih. (tag: [BARU]; terkait H2; dependensi: WO seal ganda hasil konversi)
- [ ] [P2] **Drawer detail audit pola terpadu** — tujuan Preview dan Details memakai satu pola drawer read-only plus deep-link opsional per audit. (tag: [BARU]; usulan pass2; [ASUMSI] bentuk drawer)
- [ ] [P2] **Konten tab Templates and Forms** — tab ada tanpa konten; putuskan filter tabel vs daftar template. (tag: [BARU]; audit §3 dan Temuan pass1 TAK TERDEFINISI)
- [ ] [P2] **Mode create template** — builder kanan saat ini mengedit draf v2.4 TMPL-HVAC-CHL-02; butuh mode create untuk tombol tambah template. (tag: [BARU]; [ASUMSI] perilaku mode create)
- [ ] [P3] **Target Export Audit Log** — job unduhan kait laporan atau audit log. (tag: [BARU]; [ASUMSI] tujuan unduhan)
- [ ] [P3] **Shift handover** — tombol handover tanpa tujuan seragam lintas hub. (tag: [SUDAH-DI-READINESS §2/L1])

### 2. Undefined Micro-Interactions

- [ ] [P1] **Fast-link tanpa anchor menjadi link accessible** — pemicu klik atau keyboard pada dua kartu bawah; butuh link fokusabel pengganti div klik. (tag: [BARU]; temuan navigation-audit §5 dan audit: div tanpa anchor tak accessible)
- [ ] [P2] **Force Dispatch gagal** — toast plus baris tetap OVERDUE. (tag: referensi pola ui-state-patterns toast)
- [ ] [P2] **Publish template gagal validasi** — error inline per kriteria tanpa guardrail; template tetap Draft. (tag: [BARU]; referensi pola ui-state-patterns inline validation)
- [ ] [P2] **Reorder step builder aksesibel** — handle drag kini visual saja; butuh drag and drop nyata yang bisa keyboard. (tag: [BARU]; [ASUMSI] mekanisme keyboard)
- [ ] [P2] **Gateway IoT putus** — widget merah OFFLINE plus nilai terakhir dan label STALE. (tag: referensi pola ui-state-patterns)
- [ ] [P3] **Filter tanpa hasil** — pesan plus Reset Filter termasuk tab Templates kosong. (tag: referensi pola ui-state-patterns empty state)

### 3. State Transitions

| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik Open Run INS-2026-0412 | Run mobile per audit (H2) | TAK TERDEFINISI |
| Klik Force Dispatch INS-2026-0409 | Aksi dispatch paksa inline | TERDEFINISI DI MOCKUP |
| Klik Preview INS-2026-0415 | Pratinjau read-only (drawer) | TAK TERDEFINISI |
| Klik Review Findings INS-2026-0398 | Permukaan findings | TAK TERDEFINISI |
| Klik Details INS-2026-0420 | Detail audit (drawer) | TAK TERDEFINISI |
| Klik Create Inspection Template | Mode create builder | TAK TERDEFINISI |
| Klik Add Step / Save Draft / Publish | Aksi builder inline | TERDEFINISI DI MOCKUP |
| Klik fast-link Mobile Execution | Run mobile per audit (H2) | TAK TERDEFINISI |
| Klik fast-link Findings Desk | Permukaan findings | TAK TERDEFINISI |
| Klik Export Audit Log | Job unduhan | TAK TERDEFINISI |
| Klik Shift Handover | Alur handover (L1) | TAK TERDEFINISI |
| Tab antrean, search, dropdown, pagination | Query param, tetap di halaman | TERDEFINISI DI MOCKUP |

## Inspection Findings Auto-WO Conversion Desk (`inspection_findings_auto_wo_conversion_desk/`)

> Sumber: docs/ui-audit/findings-conversion.md + docs/ui-audit/pass2/findings-conversion.md, readiness §2 (H1, M5) + §3 baris findings-conversion, navigation-audit §2–§4.

### 1. Missing Sub-Pages

- [ ] [P1] **Halaman hasil konversi temuan ke WO** — tujuan Convert Finding to Work Order plus hasil batch 3 temuan; sukses simulasi WO-2026-8802 kini hanya teks tombol. (tag: [SUDAH-DI-READINESS §2/H1]; dependensi kanon: WO seal ganda 0894 vs 8802, harga PART-SEAL-8821 1.420 vs 1.450, format WO-2026-XXXX)
- [ ] [P2] **Keputusan permukaan findings** — halaman ini tanpa item sidebar; pastikan hidup sebagai tab atau section field inspections dengan deep-link temuan FND-2026-0188. (tag: [BARU]; didukung breadcrumb dan navigation-audit §2)
- [ ] [P2] **Evidence viewer dan integrity report** — tujuan Full Specimen View foto bukti dan Audit Integrity Report rantai hash ledger. (tag: [BARU]; readiness §3 viewer laporan integritas)
- [ ] [P2] **Prefill PM dari temuan** — tujuan Schedule Routine PM ke definisi plan dengan konteks temuan. (tag: [SUDAH-DI-READINESS §2/M5])
- [ ] [P2] **Redefinisi pill Unresolved** — pill klaim 5 Unresolved sementara tab 5 plus 4 plus 3 dari 12 menyisakan 9; selaraskan definisi hitungan kritis vs sisa. (tag: [BARU]; temuan pass2 §7b)
- [ ] [P2] **Semantik Batch Convert 3** — definisikan mekanisme seleksi batch yang tak terlihat di mockup plus halaman hasil batch. (tag: [BARU]; temuan pass2 §7b; [ASUMSI] mekanisme seleksi)
- [ ] [P3] **Export CSV ledger defect** — samakan pola export global. (tag: [BARU]; [ASUMSI] pola export)

### 2. Undefined Micro-Interactions

- [ ] [P1] **Konfirmasi dismiss dengan justifikasi wajib** — pemicu klik Dismiss Finding; butuh modal justifikasi plus error inline bila kosong karena aksi destruktif. (tag: [BARU]; referensi pola ui-state-patterns dialog)
- [ ] [P1] **Guard LOTO tak dicentang** — tombol Convert disabled plus tooltip karena WO tak bisa tutup tanpa voucher lock dan sertifikat purge. (tag: [BARU]; fakta LOTO mockup; [ASUMSI] teks tooltip)
- [ ] [P2] **BOM shortage** — badge berubah SHORTAGE plus tombol convert disabled beralasan saat parts tak tersedia. (tag: [BARU]; [ASUMSI] ambang shortage)
- [ ] [P2] **Konversi gagal** — toast destruktif plus temuan tetap CRITICAL FAIL tidak pindah ke CONVERTED. (tag: referensi pola ui-state-patterns toast)
- [ ] [P2] **Derivasi SLA P1 OSHA 4 jam** — SLA 18:15 tepat 4 jam setelah pencatatan 14:15; eksplisitkan aturan derivasi di kontrak. (tag: [BARU]; temuan pass2 §7b; [ASUMSI] aturan umum)
- [ ] [P3] **Filter tanpa hasil** — kartu kosong plus reset filter. (tag: referensi pola ui-state-patterns empty state)

### 3. State Transitions

| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik Convert Finding to Work Order | WO hasil di detail WO (H1) | TAK TERDEFINISI |
| Klik Batch Convert to Work Orders 3 | Daftar WO hasil batch | TAK TERDEFINISI |
| Klik Dismiss Finding | Modal justifikasi plus aksi inline | TERDEFINISI DI MOCKUP |
| Klik Schedule Routine PM | Prefill plan dari temuan (M5) | TAK TERDEFINISI |
| Klik Export CSV | Unduhan CSV ledger | TAK TERDEFINISI |
| Klik Audit Integrity Report | Viewer laporan integritas ledger | TAK TERDEFINISI |
| Klik Full Specimen View | Evidence viewer foto | TAK TERDEFINISI |
| Klik kartu defect atau Select | Seleksi inline, konsol kanan berganti | TERDEFINISI DI MOCKUP |
| Tab filter dan search | Query param, tetap di halaman | TERDEFINISI DI MOCKUP |

## Mobile Field Inspection Execution Desk (`mobile_field_inspection_execution_desk/`)

> Sistem B rugged (border tebal, touch target min 48px, headline Space Grotesk).
> Sumber: docs/ui-audit/mobile-execution.md + docs/ui-audit/pass2/mobile-execution.md, readiness §2 (H1, H2, L2) + §3 baris mobile-execution, navigation-audit §3–§5.

### 1. Missing Sub-Pages

- [ ] [P1] **Tiga tab field tanpa mockup** — daftar audits, temuan baru, dan status sync; tanpa sync, draf offline tak bisa ditinjau atau diunggah sehingga alur run ke submit ke sync terputus di perangkat field. (tag: [SUDAH-DI-READINESS §2/H2]; dependensi kanon: progres INS-2026-0412 65 vs 50, GPS Kalimantan, override PASS memakai modal PIN)
- [ ] [P1] **Tujuan pasca-submit** — kembali ke daftar audits plus toast tautan WO terbuat yang menunjuk ke detail WO. (tag: [SUDAH-DI-READINESS §2/H2 plus H1]; dependensi: WO seal ganda hasil konversi)
- [ ] [P1] **Modal PIN supervisor** — ganti dialog demo override PASS atas step FAIL; catat audit trail peng-override karena ini kontrol keselamatan. (tag: [BARU]; temuan keamanan pass1 dan pass2)
- [ ] [P2] **Spesifikasi sinkronisasi offline** — urutan unggah draf lalu foto lalu voice, resolusi konflik, dan retry sebelum service worker diimplementasi. (tag: [BARU]; usulan pass2 §7b; [ASUMSI] kebijakan konflik)
- [ ] [P2] **Review evidence LOTO** — tujuan tombol Review bukti Step 01 berupa lightbox foto. (tag: [BARU]; [ASUMSI] bentuk lightbox)
- [ ] [P3] **Profil dan sesi teknisi** — tujuan avatar header ikut backlog organisasi. (tag: [SUDAH-DI-READINESS §2/L2])
- [ ] [P3] **Pemilih site drawer** — ganti konteks site HQ Nusantara di header. (tag: [BARU]; [ASUMSI] perilaku pemilih)

### 2. Undefined Micro-Interactions

- [ ] [P1] **Validasi FAIL wajib sebelum submit** — vonis FAIL wajib reading plus minimal 1 foto plus catatan; tombol submit disabled plus hint bila bukti kurang. (tag: [BARU]; kontrol keselamatan; referensi pola ui-state-patterns validation)
- [ ] [P1] **Fallback offline otomatis** — submit saat offline menyimpan draf lokal plus badge antrean Sync bertambah dan ikon berubah offline. (tag: [BARU]; [ASUMSI] teks badge; klaim cache offline fakta mockup)
- [ ] [P2] **Modbus gagal baca** — tombol sync merah plus fallback input manual Step 03. (tag: referensi pola ui-state-patterns error state)
- [ ] [P2] **Status rekaman voice note** — status merekam berdurasi lalu tersimpan; gagal simpan memunculkan error inline plus ulangi. (tag: [BARU]; [ASUMSI] durasi maksimum)
- [ ] [P3] **Keputusan pinch-zoom dimatikan** — viewport mematikan zoom manual; dokumentasikan pengecualian sarung tangan vs aksesibilitas. (tag: [BARU]; temuan pass2 §7b; [ASUMSI] keputusan akhir)

### 3. State Transitions

| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik Submit Audit plus Auto-Dispatch WO | Daftar audits plus WO terbuat (H2 plus H1) | TAK TERDEFINISI |
| Klik Save Offline Local Draft | Antrean sync (H2) | TAK TERDEFINISI |
| Toggle PASS atau FAIL Step 02 | State inline; PASS butuh PIN supervisor | TERDEFINISI DI MOCKUP |
| Klik Retake Photo / Add Voice Note | Capture inline kamera atau mic | TERDEFINISI DI MOCKUP |
| Klik Sync via IoT Modbus Step 03 | Baca sensor inline 118 PSI | TERDEFINISI DI MOCKUP |
| Klik Review bukti Step 01 | Lightbox foto LOTO | TAK TERDEFINISI |
| Klik tab Audits / Finding / Sync | Tiga route field (H2) | TAK TERDEFINISI |
| Klik kapsul defect kritis | Form temuan baru dari audit berjalan | TAK TERDEFINISI |
| Ganti scope lokasi header | Sheet pilihan site, tetap di halaman | TAK TERDEFINISI |
| Klik avatar profil | Profil atau sesi teknisi (L2) | TAK TERDEFINISI |
# Expansion Checklist — Part Aset & Resource (Batch A)

> Cakupan batch: 6 layar di bawah ini saja. Semua desktop = sistem A (Apex Operational Facility System).
> Skema prioritas: P1 = dead-end jalur utama, aksi destruktif tanpa konfirmasi, keamanan; P2 = alur medium (3-Way Match, posting mutasi + Idempotency-Key, guardrail SKU CRITICAL); P3 = low/enhancement.
> Format ID kanon: `AST-*`, `PART-*`, `PO-2026-XXXX`, `PR-2026-XXXX`, `WO-2026-XXXX`.
> Dependensi kanon belum diputus (lihat docs/AUDIT_MULTI_PAGE_READINESS.md §1/G3, jangan diam-diam diperbaiki): OEM `AST-HVAC-004` Trane (registry) vs Daikin (detail); skor kesehatan 68 vs 88 vs 88,4; WO seal `WO-2026-0894` vs `WO-2026-8802` vs `WO-2025-0812`/`WO-2025-0044`; harga `PART-SEAL-8821` $1.450 vs $1.420; SKU bearing `PART-BRG-6205` vs `PART-BRG-6204`; sisa MSA Trane 312d vs 288d; bin `CRIB-B` vs `SUB-LCK-4B`; `CHILL-NUSA-04` vs `AST-HVAC-004`; label singkat `WO-0894` vs `WO-2026-0894`.

## Asset Registry — Enterprise Asset Ledger (`asset_registry_lifecycle_management_ledger/`)
> Sumber: docs/ui-audit/asset-registry.md + docs/ui-audit/pass2/asset-registry.md, readiness §2 (M5, M6, L3, H1) + §3, navigation-audit §3-§5.
### 1. Missing Sub-Pages
- [ ] [P2] **BIM 3D viewer** — Menampilkan model BIM dari tombol Open BIM 3D Model. (tag: [SUDAH-DI-READINESS §2/M6]; docs/ui-audit/asset-registry.md §3.2)
- [ ] [P2] **Form prefill Create WO (`/work-orders/new?asset=AST-HVAC-004`)** — Membuat WO dengan aset terisi otomatis dari drawer. (tag: [SUDAH-DI-READINESS §2/M5+H1]; dependensi: WO seal tunggal belum diputus; docs/ui-audit/asset-registry.md §3.1)
- [ ] [P2] **Form prefill Schedule PM (`/preventive-maintenance/new?asset=...`)** — Menjadwalkan PM dengan aset terisi otomatis dari drawer. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/asset-registry.md §3.1)
- [ ] [P2] **Flow Transfer Loc** — Memindahkan aset antar-lokasi dengan modal, alasan, dan audit trail. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.3)
- [ ] [P1] **Flow Decommission** — Menonaktifkan aset dengan konfirmasi wajib + alasan karena tombolnya destruktif sekali klik. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.3, pass2 §3.3)
- [ ] [P3] **Document viewer + upload** — Melihat/mengunggah manual OEM Trane CVHE 18,4 MB, P&ID RevC, SOP LOTO. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.4)
- [ ] [P3] **Print views (Batch QR Print + print tag QR #004)** — Mencetak label QR fisik massal/satuan. (tag: [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/asset-registry.md §3.5)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Konfirmasi Decommission** — Pemicu klik Decommission; butuh modal konfirmasi ketik + alasan + toast hasil + rollback. (pola ui-state-patterns §02 FormField guard + 2B ErrorToast; docs/ui-audit/pass2/asset-registry.md §3.3)
- [ ] [P2] **Modal Transfer Loc** — Pemicu klik Transfer Loc; butuh pilih lokasi tujuan + alasan + validasi + toast. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.3)
- [ ] [P2] **Modal Register New Asset** — Pemicu + Register New Asset; butuh field, validasi, target POST, spinner inline. (tag: [BARU]; docs/ui-audit/pass2/asset-registry.md §3.4)
- [ ] [P2] **Umpan balik Export async** — Pemicu Export (CSV/XLS); butuh status job + unduh + toast gagal. (pola ui-state-patterns §03 + 2B; docs/ui-audit/asset-registry.md §2)
- [ ] [P3] **Dialog Batch QR Print** — Pemicu Batch QR Print; butuh pratinjau cetak massal. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.5)
- [ ] [P3] **Search terkontrol** — Pemicu ketik di search (saat ini `value="AST-HVAC-004"` statis tanpa handler); butuh state `?q=`, empty state + Reset Filter. (tag: [BARU]; docs/ui-audit/pass2/asset-registry.md §7b.1)
- [ ] [P3] **Sinkronisasi filter/pagination** — Pemicu ganti tab kategori/pill/Rows/halaman; butuh query params + skeleton + kalibrasi `Page 1 of 308` (6 baris vs Rows 25). (tag: [BARU]; dependensi: total 1.842 vs perPage; docs/ui-audit/asset-registry.md Temuan no. 3)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik baris tabel / chevron | Drawer profil `AST-HVAC-004` inline, produksi `/assets/[id]` | TERDEFINISI DI MOCKUP |
| Klik Create WO | `/work-orders/new?asset=AST-HVAC-004` (prefill) | TAK TERDEFINISI |
| Klik Schedule PM | `/preventive-maintenance/new?asset=...` (prefill) | TAK TERDEFINISI |
| Klik Transfer Loc | Modal transfer + audit trail | TAK TERDEFINISI |
| Klik Decommission | Konfirmasi + status DECOMMISSIONED | TAK TERDEFINISI |
| Klik Open BIM 3D Model | BIM viewer (tab vs route belum diputus) | TAK TERDEFINISI |
| Klik + Register New Asset | Modal registrasi (`POST /api/v1/assets`) | TAK TERDEFINISI |
| Klik Export (CSV/XLS) | Job export async lalu unduh berkas | TAK TERDEFINISI |
| Klik Batch QR Print | Print view QR massal | TAK TERDEFINISI |
| Klik Preview / Download dokumen | Viewer + unduhan berkas (4 file 30,7 MB) | TAK TERDEFINISI |
| Klik Upload Drawing, Schematic or PDF Manual | Uploader dokumen aset | TAK TERDEFINISI |
| Klik print QR tag / more_vert | Print tag satuan / menu konteks | TAK TERDEFINISI |
| Ganti search / filter / tab kategori / pagination | Hasil terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik ikon notifications | `/notifications` | TERDEFINISI DI MOCKUP |
| Klik + New Dispatch / Request (header) | Command palette / modal kontekstual global | TAK TERDEFINISI |

## Asset Detail & Spare Parts Ledger (`asset_detail_spare_parts_inventory_ledger/`)
> Sumber: docs/ui-audit/asset-detail.md + docs/ui-audit/pass2/asset-detail.md, readiness §2 (H1, H3, M5) + §3, navigation-audit §3-§5.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `#WO-2025-0812` yang dirujuk 2x di ledger tanpa tujuan. (tag: [SUDAH-DI-READINESS §2/H1]; dependensi: WO seal tunggal `WO-2025-0812`/`WO-2025-0044` vs `WO-2026-0894` belum diputus; docs/ui-audit/asset-detail.md §3.1)
- [ ] [P2] **Detail PR/PO/GRN + 3-Way Match (`/purchasing/[id]`)** — Membuka `#PO-2025-0081` yang menggantung. (tag: [SUDAH-DI-READINESS §2/H3]; docs/ui-audit/asset-detail.md §3.2)
- [ ] [P2] **Detail transfer antar-gudang (`/inventory/transfers/[id]`)** — Membuka `#TO-8891 (Sat-B)`. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.3)
- [ ] [P2] **Detail adjustment cycle-count (`/inventory/adjustments/[id]`)** — Membuka `#ADJ-2024-Q4`. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.3)
- [ ] [P2] **Isi sub-tab IoT Diagnostics** — Menampilkan diagnostik/telemetri riwayat `AST-HVAC-004` (opsi `?tab=iot`). (tag: [BARU]; docs/ui-audit/pass2/asset-detail.md §3.2)
- [ ] [P2] **Isi sub-tab PM Schedules (12)** — Menampilkan 12 jadwal PM aset ini (opsi `?tab=pm`). (tag: [BARU]; docs/ui-audit/asset-detail.md §3.4)
- [ ] [P2] **Isi sub-tab Compliance & Docs** — Menampilkan sertifikat `#NBIC-990-2024` dan dokumen kepatuhan (opsi `?tab=docs`). (tag: [BARU]; docs/ui-audit/asset-detail.md §3.4)
- [ ] [P2] **Prefill Quick Dispatch WO (`/work-orders/new?asset=AST-HVAC-004`)** — Membuat WO dengan aset terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P2] **Prefill Log Inspection (`/field-inspections/new?asset=...`)** — Mencatat inspeksi dengan aset terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P3] **Dossier PDF aset** — Mengunduh dossier 360° `AST-HVAC-004`. (tag: [BARU]; docs/ui-audit/asset-detail.md §2)
- [ ] [P3] **Export full ledger (CSV/stream, 421 transaksi)** — Mengunduh/men-stream jurnal mutasi penuh beserta hash `SHA-256: 9e08fc...18a`. (tag: [BARU]; docs/ui-audit/asset-detail.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Guardrail Issue to WO saat SKU DEFICIT** — Pemicu Issue pada `PART-SEAL-8821` (par 4, net 0); butuh blokir/peringatan + tawarkan + PR Request. (tag: [BARU]; dependensi: saldo `PART-SEAL-8821` 1/1 net 0 vs 2/1/1 dan harga $1.450 vs $1.420 belum diputus; docs/ui-audit/asset-detail.md §1.6)
- [ ] [P2] **Modal Quick Dispatch WO** — Pemicu toolbar Quick Dispatch; butuh form prefill + validasi + toast. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P2] **Modal Log Inspection** — Pemicu toolbar Log Inspection; butuh form prefill + validasi. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P2] **Modal Add SKU to BOM** — Pemicu + Add SKU to BOM; butuh field SKU/par/bin + validasi. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.5)
- [ ] [P2] **Flow + PR Request baris kritis** — Pemicu + PR Request pada `PART-SEAL-8821`; butuh PR prefill SKU/qty/aset + approval. (tag: [BARU]; dependensi harga `PART-SEAL-8821`; docs/ui-audit/asset-detail.md §2)
- [ ] [P2] **Flow + Quick PO baris BELOW PAR** — Pemicu + Quick PO pada `PART-LUB-09`; butuh PO cepat prefill SKU. (tag: [BARU]; docs/ui-audit/asset-detail.md §2)
- [ ] [P3] **Copy tag + fallback** — Pemicu tombol copy `AST-HVAC-004`; sudah `onclick` clipboard di mockup, butuh fallback prompt + toast. (pola ui-state-patterns 2B; code.html `navigator.clipboard.writeText`; docs/ui-audit/pass2/asset-detail.md §1.3)
- [ ] [P3] **Warehouse scope toggle** — Pemicu ganti Central Distribution Hub vs Satellite Bin; butuh refresh BOM + banner fallback. (tag: [BARU]; dependensi: selisih saldo `PART-LUB-09`/`PART-FLTR-401` antar-scope belum diputus; docs/ui-audit/asset-detail.md Temuan no. 4)
- [ ] [P3] **Filter pill timeline** — Pemicu ganti All Events (54) / Work Orders (14) / Inspections (28) / Parts Replaced (8) / Calibration (4); butuh daftar terfilter + empty state. (pola ui-state-patterns §01 EmptyState; docs/ui-audit/asset-detail.md §1.4)
- [ ] [P3] **Telemetri STALE / reconnect** — Pemicu gauge basi; butuh badge STALE + status CONNECTING pada badge SAMPLING 1 detik. (pola ui-state-patterns §03 + 2A; docs/ui-audit/asset-detail.md §1 State UI)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik breadcrumb Asset Registry | `/assets` (daftar induk) | TERDEFINISI DI MOCKUP |
| Klik sub-tab Asset 360° and Lifecycle | Tab inline aktif halaman ini | TERDEFINISI DI MOCKUP |
| Klik sub-tab Spare Parts Ledger (18) | Scroll ke BOM atau `?tab=bom` | TERDEFINISI DI MOCKUP |
| Klik sub-tab IoT Diagnostics | Konten diagnostik (`?tab=iot`) | TAK TERDEFINISI |
| Klik sub-tab PM Schedules (12) | Daftar 12 jadwal (`?tab=pm`) | TAK TERDEFINISI |
| Klik sub-tab Compliance and Docs | Dokumen kepatuhan (`?tab=docs`) | TAK TERDEFINISI |
| Klik Quick Dispatch WO | Modal / prefill `?asset=AST-HVAC-004` | TAK TERDEFINISI |
| Klik Log Inspection | Form inspeksi prefill aset | TAK TERDEFINISI |
| Klik Dossier | Unduh PDF dossier aset | TAK TERDEFINISI |
| Klik tombol copy tag | Clipboard `AST-HVAC-004` + fallback | TERDEFINISI DI MOCKUP |
| Klik `#WO-2025-0812` (2 titik) | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik `#PO-2025-0081` | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik `#TO-8891 (Sat-B)` | Detail transfer antar-gudang | TAK TERDEFINISI |
| Klik `#ADJ-2024-Q4` | Detail adjustment cycle-count | TAK TERDEFINISI |
| Klik + PR Request / + Quick PO / Issue to WO | Flow PR / PO cepat / issue ke WO | TAK TERDEFINISI |
| Klik Add SKU to BOM | Modal tambah SKU | TAK TERDEFINISI |
| Klik Load Full Historical Ledger | Export CSV / stream 421 transaksi | TAK TERDEFINISI |
| Ganti warehouse scope / search BOM | BOM terfilter per gudang | TERDEFINISI DI MOCKUP |
| Ganti pill filter timeline | Event terfilter per tipe | TERDEFINISI DI MOCKUP |

## Facility Locations & Spatial Hierarchy (`facility_locations_spatial_hierarchy_management/`)
> Sumber: docs/ui-audit/facilities.md + docs/ui-audit/pass2/facilities.md, readiness §2 (H1, M5, M6, L3, Hx/G6) + §3, navigation-audit §3-§5. Satu-satunya layar dengan interaksi nyata fragment HTMX (`hx-get="/locations/tree/node/LOC-B2-MECH-204"`).
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `WO-2026-0894` (P1, SLA breach 42m) dan `WO-2026-0881` dari panel ruangan. (tag: [SUDAH-DI-READINESS §2/H1]; docs/ui-audit/facilities.md §3.2)
- [ ] [P2] **Prefill Dispatch Room Audit (`/field-inspections/new?locationId=LOC-B2-MECH-204`)** — Membuat audit ruangan dengan lokasi terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/facilities.md §3.1)
- [ ] [P2] **Prefill Log Defect (modal atau `/field-inspections/new?locationId=...`)** — Mencatat defect dengan lokasi terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/facilities.md §3.1)
- [ ] [P2] **Hasil audit ruangan `TMPL-HVAC-CHL-02`** — Melihat hasil 3/4 passed + 1 defect via `/field-inspections/[id]` atau drawer. (tag: [BARU]; docs/ui-audit/facilities.md §3.3)
- [ ] [P2] **Flow Reassign / Transfer aset antar-ruangan** — Memindahkan aset (mis. ke `LOC-B2-208`) dengan audit trail. (tag: [BARU]; docs/ui-audit/facilities.md §2)
- [ ] [P2] **Kontrak JSON pengganti fragment HTMX** — `GET /api/v1/locations/:id` + state `?locationId=` menggantikan `hx-get` HTML (fragment tidak diporting 1:1). (tag: [Hx]; docs/ui-audit/facilities.md §3.6, readiness §1/G6)
- [ ] [P2] **Entri BIM 3D viewer dari blueprint** — Membuka model Revit dari stempel `BIM REVIT 2026.2 MODEL MATCHED`. (tag: [SUDAH-DI-READINESS §2/M6]; docs/ui-audit/pass2/facilities.md §3.4)
- [ ] [P3] **Editor geometri Edit Polygon + Recalibrate GIS** — Mengubah poligon ruangan / rekalibrasi (putuskan build-vs-buy dulu). (tag: [BARU]; docs/ui-audit/facilities.md §3.4)
- [ ] [P3] **Modal + Add Sub-Location / Room** — Menambah node ruangan (`POST /api/v1/locations`). (tag: [BARU]; docs/ui-audit/facilities.md §2)
- [ ] [P3] **Print Badge QR ruangan** — Mencetak badge QR `LOC-B2-MECH-204`. (tag: [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/facilities.md §2)
- [ ] [P3] **Export GeoJSON / BIM** — Mengekspor geospasial via job async. (tag: [BARU]; docs/ui-audit/facilities.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P2] **Modal Quick Selector kaskade** — Pemicu Quick Selector (sudah toggle `hidden` inline); butuh 4 dropdown Campus-Building-Floor-Room + preview + validasi + select disabled saat opsi gagal. (pola ui-state-patterns §02; code.html toggle `quick-selector-modal`; docs/ui-audit/facilities.md §1.10)
- [ ] [P2] **Modal Log Defect** — Pemicu + Log Defect; butuh form prefill lokasi + validasi + toast. (tag: [BARU]; docs/ui-audit/facilities.md §3.1)
- [ ] [P2] **Modal Reassign / Transfer** — Pemicu Reassign / Transfer; butuh pilih ruangan tujuan + konfirmasi + audit trail. (tag: [BARU]; docs/ui-audit/facilities.md §2)
- [ ] [P2] **Validasi Add Sub-Location** — Pemicu submit tambah ruangan; butuh inline validation + pesan error per field. (pola ui-state-patterns §02; docs/ui-audit/facilities.md §2)
- [ ] [P2] **Countdown SLA ruangan** — Timer `SLA Breach in 42m` dan `Due Tomorrow 18:00` via polling + format tanggal. (tag: [BARU]; docs/ui-audit/facilities.md §1.9)
- [ ] [P3] **Layer / zoom / heatmap denah** — State view lokal (tab HVAC/Electrical/Fire + zoom + Heatmap sudah inline); butuh pan/zoom reaktif + legenda sinkron. (tag: [BARU] untuk reaktivitas; code.html SVG inline ±110 elemen; docs/ui-audit/pass2/facilities.md §1.6)
- [ ] [P3] **Klik simbol aset di denah** — Pemicu klik `CHILLER #04` (glow merah + pulse) menuju `/assets/AST-HVAC-004`. (tag: [BARU]; dependensi: label `WO-0894` vs `WO-2026-0894`; docs/ui-audit/facilities.md Temuan no. 2)
- [ ] [P3] **Kegagalan hx-get + sensor basi** — `hx-get` gagal butuh pesan + Retry di `#location-detail-container`; sensor basi butuh tile STALE; GIS mismatch butuh `MODEL MISMATCH` + link Recalibrate. (pola ui-state-patterns 2B + 2A; docs/ui-audit/facilities.md §1 State UI)
- [ ] [P3] **Unifikasi label hitungan ruangan** — Node `8 AST` vs pil `4 Linked` vs `Showing 4 of 8` butuh pagination/scroll eksplisit + satu sumber angka. (tag: [BARU]; docs/ui-audit/pass2/facilities.md §7b.1)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik node tree spasial | Swap fragment `hx-get /locations/tree/node/[id]` ke `#location-detail-container`, produksi `?locationId=` + JSON | TERDEFINISI DI MOCKUP |
| Klik Quick Selector | Modal kaskade terbuka | TERDEFINISI DI MOCKUP |
| Klik Apply Filter Across Dashboard | Set scope global `locationId` lintas dashboard | TERDEFINISI DI MOCKUP |
| Klik Cancel / close modal | Modal tertutup | TERDEFINISI DI MOCKUP |
| Ganti layer / zoom / Heatmap | View denah lokal berubah | TERDEFINISI DI MOCKUP |
| Klik View All 8 in Asset Registry | `/assets?locationId=LOC-B2-MECH-204` | TERDEFINISI DI MOCKUP |
| Klik baris Installed Assets (`AST-*`) | `/assets/[id]` | TERDEFINISI DI MOCKUP |
| Klik Dispatch Room Audit | Prefill `/field-inspections/new?locationId=` | TAK TERDEFINISI |
| Klik + Log Defect | Flow defect prefill lokasi | TAK TERDEFINISI |
| Klik Reassign / Transfer | Flow transfer antar-ruangan | TAK TERDEFINISI |
| Klik kartu `WO-2026-0894` / `WO-2026-0881` | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik hasil `TMPL-HVAC-CHL-02` | `/field-inspections/[id]` atau drawer hasil | TAK TERDEFINISI |
| Klik Edit Polygon | Editor geometri GIS/BIM | TAK TERDEFINISI |
| Klik Print Badge QR | Print view badge ruangan | TAK TERDEFINISI |
| Klik + Add Sub-Location / Room | Modal tambah node | TAK TERDEFINISI |
| Klik Export GeoJSON / BIM | Job export geospasial | TAK TERDEFINISI |
| Klik Recalibrate GIS | Job rekalibrasi GIS | TAK TERDEFINISI |
| Klik simbol CHILLER #04 di denah | `/assets/AST-HVAC-004` | TAK TERDEFINISI |

## Inventory — Spare Parts & Consumables Ledger (`inventory_spare_parts_management_ledger/`)
> Sumber: docs/ui-audit/inventory.md + docs/ui-audit/pass2/inventory.md, readiness §2 (H1, H3, M5, L3) + §3, navigation-audit §3-§5.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `WO-2026-0894` (reserved lock + feed + Associated WO desk). (tag: [SUDAH-DI-READINESS §2/H1]; docs/ui-audit/inventory.md §3.3)
- [ ] [P2] **Detail SKU (`/inventory/[sku]`)** — Menampilkan kartu stok, riwayat mutasi, BOM linkage, vendor per SKU dari tombol Details. (tag: [BARU]; docs/ui-audit/inventory.md §3.1)
- [ ] [P2] **Flow Receive Stock / GRN (`/inventory/receive` atau Dock Desk purchasing)** — Menerima `PO-2026-0298` +100 pcs `PART-FLTR-401` ke ledger. (tag: [BARU]; dependensi: bin `CRIB-B / Bay 01` vs `SUB-LCK-4B / Bay 01` belum diputus; docs/ui-audit/inventory.md §3.2)
- [ ] [P2] **Prefill Draft PO (`/purchasing/new?sku=PART-SEAL-8821`)** — Membuat draft PO dari baris kritis. (tag: [SUDAH-DI-READINESS §2/M5+H3]; docs/ui-audit/inventory.md §3.4)
- [ ] [P2] **Detail purchasing (`/purchasing/[id]`)** — Membuka `PO-2026-0298` dari feed GRN. (tag: [SUDAH-DI-READINESS §2/H3]; docs/ui-audit/inventory.md §3.3)
- [ ] [P3] **Detail PM (`PM-PLN-0104`)** — Membuka referensi Quarterly PM di feed ledger. (tag: [BARU]; dependensi: format `PM-PLN-0104` vs `PM-2025-0812` belum diputus; docs/ui-audit/inventory.md Temuan no. 4)
- [ ] [P3] **Detail transfer / adjustment (`/inventory/transfers/[id]`, `/inventory/adjustments/[id]`)** — Membuka `TRF-2026-0044` dan `ADJ-2026-0019`. (tag: [BARU]; docs/ui-audit/inventory.md §3.3)
- [ ] [P3] **Print QR / Barcode** — Mencetak label rak/bin. (tag: [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/inventory.md §3.5)
- [ ] [P3] **Export katalog (CSV/XLS)** — Mengekspor 4.218 SKU via job async. (tag: [BARU]; docs/ui-audit/inventory.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Verifikasi PIN approver nyata** — Badge `PIN Verified` (Marcus Vance) statis; butuh flow PIN/OTP nyata + kedaluwarsa + batas nilai tanpa approval. (tag: [BARU]; keamanan; docs/ui-audit/pass2/inventory.md §3.5)
- [ ] [P2] **Posting mutasi idempoten** — Pemicu Confirm & Post Mutation (saat ini `onsubmit preventDefault` demo); butuh POST + `Idempotency-Key` + optimistic update + rollback agar double-click tak menggandakan jurnal immutable. (pola ui-state-patterns 2B ErrorToast + trace; docs/ui-audit/pass2/inventory.md §7b.2)
- [ ] [P2] **Guardrail SKU CRITICAL unit terakhir** — Form mencontohkan transfer 1 ea terakhir (`Balance Post-Transfer: 0 Available in Crib-B`) sementara `WO-2026-0894` butuh seal sama; butuh blokir/approval khusus saat available ke 0. (tag: [BARU]; dependensi saldo `PART-SEAL-8821` belum diputus; docs/ui-audit/pass2/inventory.md §7b.1)
- [ ] [P2] **Validasi desk (qty, destinasi, WO)** — Qty tidak melebihi available, destinasi beda dari sumber, WO wajib untuk issue; tombol nonaktif + error inline. (pola ui-state-patterns §02; docs/ui-audit/inventory.md §1 State UI)
- [ ] [P2] **Mode Cycle Reconciliation** — Pemicu tab plus-minus; butuh form countedQty + alasan Cycle Count Variance menjadi `ADJ-2026-0020`. (tag: [BARU]; docs/ui-audit/inventory.md §1.6)
- [ ] [P3] **Dialog Receive Stock** — Pemicu + Receive Stock (PO / GRN); butuh pilih PO + lines + bin + validasi. (tag: [BARU]; docs/ui-audit/inventory.md §3.2)
- [ ] [P3] **Polling feed + filter pill** — Pil All (1.840) / Receipts / WO Out / Adjust / Transfers via `?txnType=` + polling + badge hash `sha256:d8a2..f041` / Syncing / Retry Sync. (pola ui-state-patterns §03 + 2A; docs/ui-audit/inventory.md §1.5)
- [ ] [P3] **Fokus SKU ke Mutation Desk** — Pemicu Transfer / Issue di baris; sudah set fokus inline, butuh empty state desk + stepper sinkron. (pola ui-state-patterns §01; docs/ui-audit/inventory.md §2)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik + Receive Stock (PO / GRN) | Flow penerimaan GRN / meja Dock purchasing | TAK TERDEFINISI |
| Klik Export (CSV/XLS) | Job export katalog lalu unduh | TAK TERDEFINISI |
| Klik Print QR / Barcode | Print view label rak/bin | TAK TERDEFINISI |
| Klik Draft PO (baris kritis) | `/purchasing/new?sku=PART-SEAL-8821` (prefill) | TAK TERDEFINISI |
| Klik Transfer / Issue (baris) | Fokus SKU di Mutation Desk inline | TERDEFINISI DI MOCKUP |
| Klik Details (baris optimal) | `/inventory/[sku]` | TAK TERDEFINISI |
| Ganti tab Inter-Hub Transfer / Cycle Reconciliation | Mode form desk berganti inline | TERDEFINISI DI MOCKUP |
| Ganti pill filter ledger | Feed terfilter `?txnType=` | TERDEFINISI DI MOCKUP |
| Klik Confirm & Post Mutation | `POST /api/v1/inventory/mutations` + saldo baru, tetap di halaman | TAK TERDEFINISI |
| Klik referensi `WO-2026-0894` | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik referensi `PO-2026-0298` | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik referensi `PM-PLN-0104` | `/preventive-maintenance/[id]` | TAK TERDEFINISI |
| Klik `TRF-2026-0044` / `ADJ-2026-0019` | Detail transfer / adjustment | TAK TERDEFINISI |
| Ganti search / warehouse / kategori / threshold / pagination | Katalog terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik ikon notifications | `/notifications` | TERDEFINISI DI MOCKUP |

## Purchasing & POs Management Hub (`purchasing_pos_management_hub/`)
> Sumber: docs/ui-audit/purchasing.md + docs/ui-audit/pass2/purchasing.md, readiness §2 (H1, H3, L3) + §3, navigation-audit §3 + §5. Sistem A untuk konten hub.
> Catatan anti-artifak (PINDAHKAN sebagai larangan, jangan jadikan usulan): `<title>Run Checklist`, header mobile field (`Apex Ops LIVE`, `HQ Nusantara > Chiller Plant B-204`), bottom-nav field (`Audits` / `Checklist` aktif / `Finding` / `Sync`) yang menutupi konten, font Space Grotesk sisa templat, dan tanpa `<aside>` sidebar — semuanya ARTEFAK copy-paste Stitch (docs/ui-audit/purchasing.md Temuan no. 1; navigation-audit §5). Produksi WAJIB: shell desktop + sidebar 15 item + header standar, bottom-nav dibuang, Space Grotesk dihapus.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail PR/PO/GRN + 3-Way Match (`/purchasing/[id]`)** — Menampung Review, View PO, Audit, Details + tab receiving/match + riwayat signature. (tag: [SUDAH-DI-READINESS §2/H3]; docs/ui-audit/purchasing.md §3.1)
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `WO-2026-0894` dari baris PR dan Sign-off Desk. (tag: [SUDAH-DI-READINESS §2/H1]; docs/ui-audit/purchasing.md §3.2)
- [ ] [P2] **Modal Create PR/PO (`#btnCreatePR` tanpa handler)** — Membuat PR/PO via form SKU, qty, vendor, WO link, budget envelope. (tag: [BARU]; docs/ui-audit/purchasing.md Temuan no. 2)
- [ ] [P2] **Flow Flag Discrepancy** — Menindaklanjuti selisih GRN via retur, klaim, atau partial-accept. (tag: [BARU]; docs/ui-audit/purchasing.md §3.4)
- [ ] [P2] **Flow Reject Justification** — Menolak PR dengan alasan menjadi REJECTED. (tag: [BARU]; docs/ui-audit/purchasing.md §3.4)
- [ ] [P2] **Flow Request OEM Quotes (RFQ)** — Mengirim RFQ menjadi RFQ_SENT. (tag: [BARU]; docs/ui-audit/purchasing.md §3.4)
- [ ] [P2] **Konten tab GRN + 3-Way Match** — Membedakan isi tab dari tabel PR via `?tab=grn` dan `?tab=match`. (tag: [BARU]; docs/ui-audit/pass2/purchasing.md §3.5)
- [ ] [P2] **Detail GRN-9941** — Melihat goods receipt hasil posting `PO-2026-0298`. (tag: [BARU]; bagian H3; docs/ui-audit/purchasing.md §2)
- [ ] [P3] **Export CSV / Audit + Print PO Batches** — Job export dan layout cetak batch PO. (tag: [SUDAH-DI-READINESS §2/L3] untuk print, [BARU] untuk export; docs/ui-audit/purchasing.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Dialog konfirmasi Authorize & Auto-Dispatch PO $2.900** — Pemicu `#btnAuthorizePO` (saat ini sekali klik simulasi EDI 1,2 dtk); butuh ringkasan PR/vendor/amount/envelope `$64.200 SUFFICIENT` + konfirmasi + `Idempotency-Key` sebelum EDI. (pola ui-state-patterns §02 guard + 2B; dependensi: `CHILL-NUSA-04` vs `AST-HVAC-004`; docs/ui-audit/pass2/purchasing.md §7b.1)
- [ ] [P2] **Idempotensi Post GRN** — Pemicu `#btnPostGRN` (simulasi 1,4 dtk menjadi `GRN-9941 Posted`); butuh POST idempoten + auto-post ledger; EDI gagal butuh toast + status PO tetap (tidak setengah-dispatch). (pola ui-state-patterns 2B; docs/ui-audit/pass2/purchasing.md §7b.2)
- [ ] [P2] **Guard mismatch qty GRN** — Expected vs Received `PART-FLTR-401` 100 pcs tidak sama menjadi MISMATCH dan wajib Flag Discrepancy sebelum posting. (pola ui-state-patterns §02 inline validation; docs/ui-audit/purchasing.md §1 State UI)
- [ ] [P2] **Guard envelope tak cukup** — Sisa envelope di bawah $2.900 membuat Authorize nonaktif + peringatan over-budget. (pola ui-state-patterns §02; docs/ui-audit/purchasing.md §1 State UI)
- [ ] [P2] **Modal Reject Justification + Request OEM Quotes** — Pemicu dua tombol tanpa handler; butuh form alasan / flow RFQ + status. (tag: [BARU]; docs/ui-audit/purchasing.md §2)
- [ ] [P2] **Validasi Create PR** — Field SKU, qty, vendor, WO link, envelope + error inline + submit disabled beralasan. (pola ui-state-patterns §02; docs/ui-audit/purchasing.md §3.3)
- [ ] [P3] **Countdown SLA + shortcut search** — `P1 SLA: 48m left` via poll 30 dtk; `Ctrl/Cmd + /` fokus search (sudah inline, pertahankan). (tag: [BARU] untuk polling; code.html script inline; docs/ui-audit/pass2/purchasing.md §1.8)
- [ ] [P3] **Skeleton triase + status transmitting/posting** — Status `Transmitting EDI...` / `Posting to Immutable Stock Ledger...` sudah disimulasi dan wajib dipertahankan sebagai pola. (pola ui-state-patterns §03; docs/ui-audit/purchasing.md §1 State UI)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Ganti tab Purchase Requests / Purchase Orders / GRN / 3-Way Match | Daftar terfilter `?tab=` inline | TERDEFINISI DI MOCKUP |
| Klik Review (`PR-2026-0314`) | Fokus Sign-off Desk inline, produksi `/purchasing/[id]` tab review | TERDEFINISI DI MOCKUP |
| Klik Receive (`PO-2026-0298`) | Fokus Dock Receiving Desk inline, produksi GRN detail | TERDEFINISI DI MOCKUP |
| Klik View PO (`PR-2026-0309` ke `PO-2026-0302`) | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik Audit (`PO-2026-0285` partial receipt) | `/purchasing/[id]` tab match | TAK TERDEFINISI |
| Klik Details (`PR-2026-0295` rejected) | Riwayat rejection read-only | TAK TERDEFINISI |
| Klik link `WO-2026-0894` (baris + sign-off) | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik + Create Purchase Request / PO | Modal create + POST | TAK TERDEFINISI |
| Klik Authorize & Auto-Dispatch PO | Dialog konfirmasi lalu `POST` menjadi `PO-2026-0315`, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Post Goods Receipt (GRN) & Sync Ledger | `POST` menjadi `GRN-9941` + auto-post ledger, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Flag Discrepancy | Modal selisih GRN (retur/klaim/partial) | TAK TERDEFINISI |
| Klik Reject Justification / Request OEM Quotes | Aksi approval / flow RFQ | TAK TERDEFINISI |
| Klik Export CSV / Audit, Print PO Batches | Job export / print view | TAK TERDEFINISI |
| Ganti search / Priority / Status / pagination | Hasil terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik bottom-nav Audits / Checklist / Finding / Sync | Bukan navigasi hub ini (ARTEFAK, buang) | TAK TERDEFINISI |

## Vendors & Contractors Management Hub (`vendors_contractors_management_hub/`)
> Sumber: docs/ui-audit/vendors.md + docs/ui-audit/pass2/vendors.md, readiness §2 (M1, H1, H3, M5, L3) + §3, navigation-audit §3 + §5. Sistem A untuk konten hub.
> Catatan anti-artifak (PINDAHKAN sebagai larangan, jangan jadikan usulan): `<title>Run Checklist`, header mobile field, bottom-nav field 4 tab yang menutupi konten, font Space Grotesk sisa templat, tanpa `<aside>` dan tanpa script inline sama sekali (semua tombol dead click) — ARTEFAK copy-paste Stitch (docs/ui-audit/vendors.md Temuan no. 1 + no. 3; navigation-audit §5). Produksi WAJIB: shell desktop + sidebar 15 item, bottom-nav dibuang.
### 1. Missing Sub-Pages
- [ ] [P2] **Detail vendor + MSA document viewer (`/vendors/[id]`)** — Scorecard `VND-HVAC-0012` via URL + View Executed PDF + Initiate Amendment (kalibrasi: pass2 menilai HIGH, pass1/readiness M1 MEDIUM — diputuskan saat rebuild). (tag: [SUDAH-DI-READINESS §2/M1]; docs/ui-audit/pass2/vendors.md §3.1)
- [ ] [P2] **Flow onboarding vendor/MSA** — Formulir multi-langkah data perusahaan, DUNS, sertifikasi, termin MSA + approval. (tag: [BARU]; docs/ui-audit/vendors.md §3.4)
- [ ] [P2] **Flow Initiate Amendment** — Mengamandemen `MSA-2024-TRN-09` menjadi `AMD-2026-0012` IN_REVIEW. (tag: [BARU]; docs/ui-audit/vendors.md §3.4)
- [ ] [P2] **Detail Work Order + purchasing dari kartu dispatch** — Membuka `WO-2026-0894` (ETA 35 mins) dan `PO-2026-0298` (GRN RECEIVED $4.800). (tag: [SUDAH-DI-READINESS §2/H1+H3]; docs/ui-audit/vendors.md §3.3)
- [ ] [P2] **Prefill Dispatch Work Order (`/work-orders/new?vendorId=VND-HVAC-0012`)** — Dispatch WO dengan vendor terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/vendors.md §3.2)
- [ ] [P3] **Keputusan Expiry Ledger (6 Expiring)** — Filter inline `?msaStatus=expiring` vs halaman ledger terpisah. (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P3] **Aksi Commendation** — Apresiasi vendor (saat ini tanpa handler). (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P3] **Dossier vendor + Export Compliance (CSV/PDF)** — Riwayat audit vendor dan job export kepatuhan. (tag: [BARU]; cetak ikut [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/vendors.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Kunci Dispatch saat MSA kedaluwarsa** — Vendor tanpa MSA aktif (banner No Active MSA) atau MSA kedaluwarsa membuat Dispatch Work Order terkunci + banner merah. (tag: [BARU]; kasus: `MSA-2023-ABB-02` RENEWAL DUE 28d; docs/ui-audit/vendors.md §1 State UI)
- [ ] [P2] **Modal Onboard New Vendor / MSA** — Pemicu tombol primer; butuh validasi DUNS `00-132-9481`, kontak, domain + approval. (tag: [BARU]; docs/ui-audit/vendors.md §3.4)
- [ ] [P2] **Modal Initiate Amendment** — Pemicu tombol amendment; butuh form termin/nilai + approval. (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P2] **Modal Dispatch Work Order prefill vendor** — Pemicu Dispatch; butuh form `?vendorId=` + teknisi cleared (`Badge #TEC-884`, RFID Active) + toast. (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P2] **Countdown renewal MSA tunggal** — `RENEWAL DUE (28d)`, `60D WINDOW`, dan sisa Trane dari satu API agar konflik 312d vs 288d berakhir. (tag: [BARU]; dependensi sisa MSA 312d vs 288d belum diputus; docs/ui-audit/pass2/vendors.md §3.5)
- [ ] [P3] **Direct Ring hotline** — Pemicu Direct Ring; aksi `tel:1-800-555-TRANE` + disabled saat tak terjangkau. (tag: [BARU]; dependensi: nomor `+1 (555)` vs operasi Nusantara + kontak `Robert Langdon` belum diputus; docs/ui-audit/pass2/vendors.md §7b.1)
- [ ] [P3] **Sync Oracle ERP gagal** — Footer menjadi Sync Failed + Retry. (pola ui-state-patterns 2B; docs/ui-audit/vendors.md §1 State UI)
- [ ] [P3] **PDF MSA gagal dimuat** — Viewer error + unduh langsung. (pola ui-state-patterns 2B; docs/ui-audit/vendors.md §1 State UI)
- [ ] [P3] **Empty state direktori** — Pencarian tanpa hasil menampilkan pesan + CTA Onboard. (pola ui-state-patterns §01 EmptyState; docs/ui-audit/vendors.md §1 State UI)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik baris vendor / chevron / badge Active | `/vendors/[id]` (contoh `VND-HVAC-0012`) | TAK TERDEFINISI |
| Klik View Executed PDF | Viewer dokumen `MSA-2024-TRN-09` | TAK TERDEFINISI |
| Klik Initiate Amendment | Flow amandemen kontrak | TAK TERDEFINISI |
| Klik Dispatch Work Order | Prefill `/work-orders/new?vendorId=` | TAK TERDEFINISI |
| Klik Commendation | Aksi apresiasi vendor | TAK TERDEFINISI |
| Klik Direct Ring | `tel:1-800-555-TRANE` (aksi, bukan navigasi) | TERDEFINISI DI MOCKUP |
| Klik kartu `WO-2026-0894` | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik kartu `PO-2026-0298` | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik + Onboard New Vendor / MSA | Modal onboarding + approval | TAK TERDEFINISI |
| Klik Expiry Ledger (6 Expiring) | Filter inline `?msaStatus=expiring` atau halaman ledger | TERDEFINISI DI MOCKUP |
| Klik Export Compliance (CSV/PDF) | Job export kepatuhan | TAK TERDEFINISI |
| Klik print / history (kartu profil) | Dossier vendor / riwayat audit | TAK TERDEFINISI |
| Ganti search / MSA Status / Risk / chip domain / pagination | Direktori terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik bottom-nav Audits / Checklist / Finding / Sync | Bukan navigasi hub ini (ARTEFAK, buang) | TAK TERDEFINISI |
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
