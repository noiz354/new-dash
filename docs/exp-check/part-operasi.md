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
