# Interaction Trees — 20 Layar Apex Ops

> Tanggal: 2026-09-13. Status: AUDIT (pohon interaksi dulu, NO CODE).
> Metode: 3 batch paralel memperdalam item P1/P2 `docs/EXPANSION_CHECKLIST.md`
> sampai terminal state (L0→L5). Format ketat per fitur; unhappy path maks 2 per aksi.
> L5 hanya memakai vocabulary `ui-state-patterns`; kebutuhan di luar itu ditandai
> [POLA-BARU] (usulan kontrak pola baru, bukan pola yang sudah ada).
> Aturan pengikat: CANON (konflik = dependensi), ANTI-ARTIFACTS, sistem A vs B.

## Rekap Global (201 pohon)

| Batch | Modul berpohon | Pohon (L0) | [POLA-BARU] (pemakaian) |
|---|---|---|---|
| Inti operasi (6 layar) | WO 12, SR 11, PM 10, Inspeksi 11, Findings 10, Mobile 11 | 65 | 9 (Evidence Lightbox, Print View, Integrity Report Viewer) |
| Aset & resource (6 layar) | Registry 11, Asset-detail 11, Facilities 11, Inventory 11, Purchasing 10, Vendors 10 | 64 | 15 (pratinjau cetak, countdown SLA/BREACH, pad PIN + kedaluwarsa, countdown renewal MSA, Direct Ring) |
| Governance & sistem (7 + 2 catatan) | Dashboard, Reports, Audit-trail 12, Notifications, Org-RBAC, Settings 12, + ui-patterns & logo (catatan) | 72 | 40 (AlertDialog destruktif, banner TX-904128/sesi impersonasi/HASH MISMATCH, command palette ⌘K, drawer/preview, schedule editor, dsb.) |
| **Total** | **19 modul berpohon + 2 catatan** | **201** | **64 pemakaian** |

> Pola [POLA-BARU] terbanyak (AlertDialog konfirmasi destruktif, banner, command palette)
> adalah kandidat kontrak komponen baru melengkapi `ui-state-patterns` saat rebuild.

---
# Pohon Interaksi — Batch Inti Operasi (6 Layar)

> Batch OPERASI: work orders hub, service requests triage, preventive maintenance hub,
> field inspections hub, findings and conversion desk, mobile field execution.
> Satu file, Markdown murni, tanpa kode HTML atau JS.
> Folder aktual: work_order_management_execution_hub, service_requests_triage_hub,
> preventive_maintenance_scheduling_automation_hub, field_inspections_audit_queue_hub,
> inspection_findings_auto_wo_conversion_desk, mobile_field_inspection_execution_desk.

## Legenda

> Level: L0 aksi di halaman utama, L1 sub-page atau view yang terbuka, L2 aksi user,
> L3 validasi atau unhappy path plus pesan inline (maks 2 per aksi),
> L4 koreksi dan re-submit, L5 terminal state.
> Rujukan: ck = docs/exp-check/part-operasi.md (modul plus seksi), audit = docs/ui-audit
> (nama file plus seksi). Setiap cabang L0 dan L1 membawa rujukan singkat.
> Vocabulary L5 (dari docs/ui-audit/ui-state-patterns.md): Success Toast, ErrorToast
> (plus Trace dan Retry atau Copy Log), TableSkeleton, EmptyState, OfflineBanner,
> FormField pesan inline, label STALE, spinner plus tombol disabled, status terupdate inline.
> Pola yang dibutuhkan tetapi tidak ada di vocabulary ditandai [POLA-BARU].
> Fakta tanpa sumber ditandai [ASUMSI]. Konflik kanon ditulis sebagai dependensi,
> tidak diputus di sini.

## Kanon dan dependensi batch ini

> ID kanon: WO-2026-XXXX, AST strip, PART strip, SR-2026-XXXX, INS-2026-XXXX,
> FND-2026-XXXX, PM-PLN-XXXX, tenant APX-NUSA-01.
> Dependensi (konflik mockup, jangan diputus): WO seal ganda 0894 vs 8802;
> LOTO Padlock 4092 vs M-44; progres INS-2026-0412 65 vs 50;
> harga PART-SEAL-8821 1.420 vs 1.450; EXIF foto Eropa 48.12N 11.58E vs GPS
> Kalimantan 0.7893S 113.9213E; Schmidt vs Kowalski; gateway Modbus
> 192.168.4.112 vs 10.14.0.8. Anti-artifacts: tanpa bottom-nav mobile di desktop,
> tanpa foto atau EXIF asing, tanpa avatar hotlink (inisial saja).
> Sistem B rugged (border tebal, target sentuh min 48px, headline Space Grotesk)
> hanya untuk modul mobile.

---

## 1. Work Order Management and Execution Hub (12 pohon)

### WO Hub: Create WO via tombol + Create WO

* L0: Klik + Create WO di title bar (ck WO S3 Create TERDEFINISI; audit work-orders S2)
  * L1: Modal buat WO, tetap di halaman (ck WO S1 P1 halaman detail mandiri sebagai konteks; audit work-orders S3 item 1)
    * L2: Isi scope, aset, prioritas lalu submit
      * L3: Field wajib kosong, pesan inline per field dan tombol Dispatch disabled beralasan (ck WO S2 P2 validasi inline; vocabulary FormField)
      * L4: Lengkapi field wajib lalu re-submit
        * L5: Spinner di tombol lalu Success Toast lalu WO baru muncul di lane DRAFT plus counts pipeline terupdate
      * L3: API 500 saat create, ErrorToast plus Trace plus Retry dan modal tetap terbuka (vocabulary ErrorToast)
      * L4: Klik Retry tanpa mengubah isi
        * L5: Spinner lalu Success Toast lalu WO baru di lane DRAFT plus counts terupdate

### WO Hub: Buka detail WO-2026-0894 dari pipeline

* L0: Klik baris atau kartu lane pipeline 42 WO (ck WO S3 klik atau gusur lane TAK TERDEFINISI; audit work-orders S2)
  * L1: Halaman detail WO-2026-0894 mandiri atas AST-HVAC-014, pecah dari daftar atau kanban (ck WO S1 P1; audit work-orders S3 item 1)
    * L2: Halaman memuat header eksekusi, checklist 5 step, labor, parts, compliance
      * L3: Poll 10 detik basi, countdown SLA plus telemetri berlabel STALE (ck WO S2 P2 autosave dan STALE; vocabulary STALE)
      * L4: Poll pulih otomatis atau klik Sync Now [ASUMSI label tombol]
        * L5: TableSkeleton singkat lalu konten tampil plus pill IN PROGRESS P1 CRITICAL terupdate
      * L3: Telemetri chiller terputus, tile tampil strip plus badge OFFLINE (audit work-orders S1 empty telemetri)
      * L4: Koneksi pulih, poll ulang otomatis
        * L5: TableSkeleton tile lalu 4 tile live terupdate plus badge Modbus OK

### WO Hub: Simpan progres Step 04 segel poros

* L0: Klik Save Step Progress di Step 04 Replace Worn Primary Shaft Mechanical Seal (ck WO S3 aksi API inline TERDEFINISI; audit work-orders S2)
  * L1: Step 04 tetap IN PROGRESS di halaman yang sama, indikator autosave terlihat (ck WO S2 P2 autosave dan STALE; audit work-orders S2)
    * L2: Ketik catatan teknisi plus torsi 45 Nm lalu simpan
      * L3: Simpan gagal, toast retry dan draf textarea dipertahankan plus label Autosaved basi (ck WO S2 P2; vocabulary ErrorToast)
      * L4: Klik Retry, draf tidak hilang
        * L5: Spinner inline tanpa mengubah lebar lalu Success Toast lalu indikator tersimpan terupdate
      * L3: Catatan kosong saat Step 5 sudah dekat sign-off, pesan inline wajib isi (ck WO S2 P2; vocabulary FormField)
      * L4: Isi catatan lalu simpan ulang
        * L5: Spinner lalu Success Toast lalu progres Step 4 of 5 terupdate

### WO Hub: Quick-log labor supplemental

* L0: Submit form Quick Log Supplemental Work untuk Marcus Kowalski (ck WO S2 P2 validasi quick-log; audit work-orders S1 panel labor)
  * L1: Panel labor dan time clock 01:42:18 di halaman yang sama (audit work-orders S1; audit work-orders S5 time-entries)
    * L2: Isi durasi plus kode aktivitas ACT-REPAIR atau DIAGNOSTIC atau TESTING lalu klik Log Time
      * L3: Durasi atau kode kosong, pesan inline per field (ck WO S2 P2; vocabulary FormField)
      * L4: Lengkapi lalu re-submit
        * L5: Spinner lalu Success Toast lalu entri jam tampil di roster plus elapsed terupdate
      * L3: API 500, ErrorToast plus Retry dan form mempertahankan isi (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu entri jam terupdate

### WO Hub: Transisi berisiko Put On Hold dan Escalate to Vendor

* L0: Klik Put On Hold atau Escalate to Vendor di toolbar eksekusi (ck WO S2 P1 konfirmasi transisi; audit work-orders S2 aksi sekali klik tanpa konfirmasi)
  * L1: Modal konfirmasi plus alasan wajib, tetap di halaman [ASUMSI bentuk modal] (ck WO S2 P1; audit work-orders S3 evidence handover terkait)
    * L2: Pilih alasan lalu konfirmasi
      * L3: Alasan kosong, pesan inline dan tombol konfirmasi disabled (ck WO S2 P1; vocabulary FormField)
      * L4: Isi alasan lalu konfirmasi ulang
        * L5: Spinner lalu Success Toast lalu pill status jadi ON HOLD atau eskalasi vendor terupdate
      * L3: Eskalasi vendor gagal, tombol kembali ke state semula plus toast retry (audit work-orders S1 error eskalasi; vocabulary ErrorToast)
      * L4: Klik Retry dari toast
        * L5: Spinner lalu Success Toast lalu status eskalasi terupdate

### WO Hub: Mark Task Complete dengan guard Step 5 plus LOTO plus foto

* L0: Klik Mark Task Complete Sign-off (ck WO S2 P1 syarat Step 5 plus LOTO plus foto; audit work-orders S1 Step 05 LOCKED)
  * L1: Modal sign-off matriks kepatuhan OSHA 1910.147 di halaman yang sama (audit work-orders S1; ck WO S1 P3 print permit terkait)
    * L2: Konfirmasi sign-off via Smart Badge
      * L3: Step 05 terkunci atau LOTO belum verified atau dropzone Step 04 kosong, tombol disabled plus hint alasan (ck WO S2 P1; vocabulary FormField guard submit)
      * L4: Selesaikan Step 05 plus verifikasi LOTO plus unggah foto bukti lalu konfirmasi ulang
        * L5: Spinner lalu Success Toast lalu pill COMPLETED plus sign-off Facility Mgr PENDING terupdate [ASUMSI PENDING lanjut ke manajer]
      * L3: Complete gagal di API, ErrorToast plus status tetap IN PROGRESS (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu status COMPLETED terupdate

### WO Hub: Filter pipeline dan ganti view List Kanban Calendar

* L0: Ganti view List 42 atau Kanban 7 Lanes atau Calendar, klik lane, atau hotkey Ctrl K (ck WO S3 view TERDEFINISI dan lane TAK TERDEFINISI; ck WO S2 P3 filter keyboard; audit work-orders S2 query view)
  * L1: Pipeline terfilter via query stage di halaman yang sama (audit work-orders S2 filter stage; ck WO S2 P3 command palette lintas entitas [ASUMSI cakupan])
    * L2: Pilih stage IN PROGRESS atau ketik filter cepat
      * L3: Lane kosong hasil filter, kartu lane kosong plus teks plus ajakan Create WO (audit work-orders S1 empty lane; vocabulary EmptyState)
      * L4: Klik reset filter atau Create WO
        * L5: TableSkeleton lane lalu 42 WO tampil kembali plus badge 94.8 persen SLA terupdate
      * L3: Poll basi saat filter aktif, label STALE di kartu lane (ck WO S2 P2; vocabulary STALE)
      * L4: Poll pulih otomatis
        * L5: TableSkeleton lalu counts lane terupdate

### WO Hub: Requisition part tambahan via drawer inventaris

* L0: Klik + Requisition Additional Part di ledger 1.735 dolar (ck WO S1 P2 drawer requisition M5; audit work-orders S2 drawer inventaris prefill)
  * L1: Drawer inventaris prefill konteks WO-2026-0894 [ASUMSI konvensi query] (ck WO S1 P2; audit work-orders S3 item 5)
    * L2: Pilih SKU plus qty lalu submit requisition
      * L3: SKU kosong atau qty nol, pesan inline (ck WO S2 P2 pola validasi; vocabulary FormField)
      * L4: Perbaiki lalu re-submit
        * L5: Spinner lalu Success Toast lalu ledger bertambah baris RESERVED plus total terupdate
      * L3: Stok tidak tersedia, badge SHORTAGE plus tombol disabled beralasan [ASUMSI ambang] (ck findings S2 P2 pola SHORTAGE lintas modul)
      * L4: Ganti SKU pengganti yang tersedia lalu submit
        * L5: Spinner lalu Success Toast lalu ledger terupdate

### WO Hub: View Evidence LOTO Step 01

* L0: Klik View Evidence foto loto_breaker_isolated.jpg 2.4 MB (ck WO S1 P2 evidence viewer; audit work-orders S2 viewer TAK TERDEFINISI)
  * L1: Evidence viewer galeri bukti plus hash verifikasi SHA-256 [ASUMSI lightbox vs route] (ck WO S1 P2; audit work-orders S3 item 4)
    * L2: Buka foto dan periksa hash ledger 7f8c92a10b48
      * L3: Foto gagal dimuat, ErrorToast plus Retry dan thumbnail placeholder bertahan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu foto tampil plus hash VERIFIED LEDGER [POLA-BARU: Evidence Lightbox]
      * L3: Hash tidak cocok [ASUMSI kasus], banner peringatan integritas inline
      * L4: Muat ulang bukti atau laporkan via eskalasi
        * L5: ErrorToast plus status verifikasi bertahan UNVERIFIED [POLA-BARU: Evidence Lightbox]

### WO Hub: Drag kartu antar lane pipeline

* L0: Drag kartu WO antar lane 7 tahap (ck WO S2 P2 drag antar lane; ck WO S3 gusur lane TAK TERDEFINISI; audit work-orders S2 PATCH status)
  * L1: Kartu tampil di lane tujuan secara optimistis, counts sementara berubah [ASUMSI perilaku drag] (ck WO S2 P2; vocabulary kanban elevated ui-state-patterns S3)
    * L2: Drop kartu di lane ON HOLD
      * L3: PATCH gagal, ErrorToast plus kartu rollback ke lane asal (ck WO S2 P2 rollback; vocabulary ErrorToast)
      * L4: Ulangi drag atau klik Retry
        * L5: Spinner kartu lalu Success Toast lalu counts lane terupdate
      * L3: SLA kartu breach saat dipindah [ASUMSI], pill BREACHED plus eskalasi inline (ck WO S3 countdown nol TAK TERDEFINISI)
      * L4: Konfirmasi pemindahan berisiko via modal alasan
        * L5: Spinner lalu Success Toast lalu pill status terupdate

### WO Hub: Shift Handover antar shift

* L0: Klik Shift Handover di title bar (ck WO S1 P2 handover L1; ck WO S3 TAK TERDEFINISI; audit work-orders S3 item 3)
  * L1: Alur handover checklist terbuka plus timer labor berjalan plus parts [ASUMSI bentuk] (ck WO S1 P2; dependensi jam Shift A belum diputus)
    * L2: Isi serah terima lalu submit
      * L3: Timer labor masih ACTIVE CLOCK, warning non-blokir untuk stop atau serahkan timer (ck WO S1 P2 timer berjalan; vocabulary FormField warning)
      * L4: Pilih serahkan timer lalu submit ulang
        * L5: Spinner lalu Success Toast lalu status handover tercatat plus roster terupdate
      * L3: Submit gagal, ErrorToast plus draf handover dipertahankan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu status terupdate

### WO Hub: Export WO Log dan Print Work Permit

* L0: Klik Export WO Log atau Print Work Permit (ck WO S1 P3 export TAK TERDEFINISI dan print L3; audit work-orders S2 dan S3 item 2)
  * L1: Job unduhan kait laporan untuk export, atau print view izin kerja LOTO plus matriks sign-off untuk print (ck WO S1 P2 P3; audit work-orders S3 item 2)
    * L2: Jalankan export atau buka print view
      * L3: Job export gagal, ErrorToast plus Retry dan tetap di halaman (vocabulary ErrorToast)
      * L4: Klik Retry job
        * L5: Spinner lalu Success Toast plus tautan unduh siap dan status job terupdate
      * L3: Data sign-off PENDING untuk print [ASUMSI], catatan inline bahwa matriks tercetak apa adanya
      * L4: Lanjut cetak atau kembali lengkapi sign-off
        * L5: Print view tampil plus matriks SIGNED atau PENDING [POLA-BARU: Print View]

---

## 2. Service Requests Triage Hub (11 pohon)

### SR Triage: Submit New Request via modal

* L0: Klik + Submit New Request di header triase (ck SR S3 TERDEFINISI; audit service-requests S2 modal submit)
  * L1: Modal submit request, tetap di halaman (audit service-requests S2; ck SR S3)
    * L2: Isi summary lokasi kategori lalu submit
      * L3: Summary atau lokasi kosong, pesan inline per field (ck SR S2 P2 validasi form; vocabulary FormField)
      * L4: Lengkapi lalu re-submit
        * L5: Spinner plus tombol disabled lalu Success Toast lalu tiket baru di tab NEW plus counts 142 terupdate
      * L3: Submit gagal 500, ErrorToast plus Trace plus Retry dan isi modal bertahan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu antrean plus counts terupdate

### SR Triage: Buka tiket SR-2026-0894 inline

* L0: Klik baris tiket SR-2026-0894 AC hot air Server Room (ck SR S3 baris tiket TERDEFINISI; audit service-requests S2 seleksi inline)
  * L1: Panel evaluasi kanan berganti ke SR-2026-0894 via query ticket, tanpa route detail penuh (ck SR S1 P2 detail per tiket M2; audit service-requests S3 item 2)
    * L2: Tinjau skor SCADA 92 CRITICAL plus telemetri T-RACK-04 28.4C
      * L3: Feed SCADA basi poll 10 detik, strip abu plus label STALE (ck SR S2 P2 STALE; vocabulary STALE)
      * L4: Klik Sync Now atau tunggu poll pulih
        * L5: TableSkeleton strip lalu telemetri plus gauge terupdate
      * L3: Filter tanpa hasil di antrean, varian ringkas empty plus Clear (audit service-requests S1; vocabulary EmptyState)
      * L4: Klik Clear filter
        * L5: TableSkeleton baris lalu 5 tiket untriaged tampil plus counts terupdate

### SR Triage: Convert to Work Order dan Dispatch Lead P1

* L0: Klik Convert to Work Order plus Dispatch Lead untuk SR-2026-0894 (ck SR S2 P1 konfirmasi konversi; ck SR S3 TAK TERDEFINISI hasil; audit service-requests S3 item 1 H1)
  * L1: Modal ringkasan tipe WO aset teknisi plus LOTO wajib centang, lalu halaman hasil WO di detail WO (ck SR S2 P1; ck SR S1 P1 hasil konversi H1)
    * L2: Pilih tipe WO-EM-01 plus AST-HVAC-014 plus Marcus Kowalski plus centang LOTO lalu kirim
      * L3: Tipe atau aset atau teknisi kosong, pesan inline dan tombol disabled; overlap PM Shift A tampil sebagai warning non-blokir (ck SR S2 P2 validasi; audit service-requests S1 warning overlap)
      * L4: Lengkapi field wajib (LOTO wajib untuk P1 fakta mockup) lalu kirim ulang
        * L5: Spinner lalu Success Toast plus tautan WO hasil lalu tiket pindah ke CONVERTED plus counts terupdate
      * L3: Konversi gagal, tiket tetap NEW plus toast destruktif (ck SR S2 P2; audit service-requests S1; vocabulary ErrorToast)
      * L4: Klik Retry konversi
        * L5: Spinner lalu Success Toast lalu status CONVERTED plus WO hasil terupdate

### SR Triage: Change linked asset via drawer lookup

* L0: Klik Change pada linked asset AST-HVAC-014 (ck SR S1 P2 drawer lookup M5; ck SR S3 TAK TERDEFINISI; audit service-requests S2 prefill)
  * L1: Asset lookup drawer mode pilih, mengembalikan ID aset terpilih (ck SR S1 P2; audit service-requests S3 prefill flow)
    * L2: Cari aset lalu pilih pengganti Liebert PAC 50kW dan konfirmasi
      * L3: Tidak ada hasil pencarian, EmptyState plus reset kata kunci (vocabulary EmptyState)
      * L4: Ubah kata kunci lalu pilih hasil
        * L5: Spinner lalu Success Toast lalu chip aset terupdate plus badge Verified SCADA Match
      * L3: Gagal memuat lookup, ErrorToast plus Retry dan pilihan lama bertahan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: TableSkeleton hasil lalu drawer tampil plus pilihan terupdate

### SR Triage: Reject atau Duplikat tiket

* L0: Klik Reject atau Duplicate di form konversi (ck SR S2 P2 modal reject; ck SR S3 aksi inline TERDEFINISI; audit service-requests S2)
  * L1: Modal alasan duplikat plus pertanyaan wajib [ASUMSI isi field], tetap di halaman (ck SR S2 P2; audit service-requests S5 reject)
    * L2: Isi alasan plus tiket duplikat lalu submit
      * L3: Alasan kosong, pesan inline dan tombol disabled (ck SR S2 P2; vocabulary FormField)
      * L4: Isi alasan lalu re-submit
        * L5: Spinner lalu Success Toast lalu tiket pindah REJECTED plus counts 9 terupdate
      * L3: Submit gagal, ErrorToast plus tiket tetap di antrean (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu status REJECTED terupdate

### SR Triage: Request Info ke requester

* L0: Klik Request Info untuk SR-2026-0894 (ck SR S2 P2 modal request-info; ck SR S3 TERDEFINISI; audit service-requests S2 dan S5)
  * L1: Modal pertanyaan wajib, tetap di halaman [ASUMSI isi field] (ck SR S2 P2)
    * L2: Tulis pertanyaan lalu kirim
      * L3: Pertanyaan kosong, pesan inline (vocabulary FormField)
      * L4: Isi lalu kirim ulang
        * L5: Spinner lalu Success Toast lalu tiket jadi TRIAGED plus feed live room bertambah
      * L3: Kirim gagal, ErrorToast plus draf pertanyaan bertahan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu status plus feed terupdate

### SR Triage: Filter tab status plus rail plus pagination

* L0: Pakai tab ALL 142 atau NEW 5 atau filter kategori lokasi plus pagination (ck SR S3 query param TERDEFINISI; audit service-requests S2 query params)
  * L1: Antrean terfilter via query status kategori lokasi page di halaman yang sama (ck SR S3; audit service-requests S2)
    * L2: Ketik omnisearch Ctrl slash atau ubah dropdown lalu terapkan
      * L3: Tanpa hasil, empty ringkas plus tombol Clear (audit service-requests S1; vocabulary EmptyState)
      * L4: Klik Clear
        * L5: TableSkeleton baris lalu antrean penuh tampil plus counts terupdate
      * L3: Poll antrean basi, strip STALE plus data terakhir dipakai (ck SR S2 P2; vocabulary STALE)
      * L4: Klik Sync Now
        * L5: TableSkeleton lalu antrean plus SLA clock terupdate

### SR Triage: Batch Triage dan Re-Assign Zone

* L0: Checklist item lalu klik Batch Triage atau Re-Assign Zone (ck SR S1 P2 batch TAK TERDEFINISI; ck SR S3 TAK TERDEFINISI; audit service-requests S2 dan S5)
  * L1: Hasil batch terdefinisi sebagai toast plus counts, bukan halaman [ASUMSI toast vs halaman] (ck SR S1 P2)
    * L2: Pilih aksi batch plus zona lalu jalankan
      * L3: Tidak ada item ter-checklist, hint inline pilih minimal satu (ck SR S1 P2; vocabulary FormField)
      * L4: Checklist satu tiket atau lebih lalu jalankan ulang
        * L5: Spinner lalu Success Toast per hasil lalu Selected count plus tab counts terupdate
      * L3: Batch gagal parsial, ErrorToast plus item gagal tetap ter-checklist (ck SR S2 P2 pola gagal konversi; vocabulary ErrorToast)
      * L4: Klik Retry untuk item gagal
        * L5: Spinner lalu Success Toast lalu counts terupdate

### SR Triage: Tiket BREACHED SR-2026-0887 eskalasi

* L0: Buka tiket BREACHED SR-2026-0887 SLA minus 12m 18s (ck SR S2 P1 tiket BREACHED; audit service-requests S1 SLA Overrun)
  * L1: Panel evaluasi dengan eskalasi visual plus aksi prioritas penugasan ulang [ASUMSI alur eskalasi] (ck SR S2 P1)
    * L2: Klik re-assign prioritas atau eskalasi
      * L3: Teknisi pengganti kosong, pesan inline (vocabulary FormField)
      * L4: Pilih teknisi lalu konfirmasi
        * L5: Spinner lalu Success Toast lalu pill penugasan plus SLA terupdate
      * L3: Eskalasi gagal, ErrorToast plus tiket tetap BREACHED (ck SR S2 P2 pola gagal; vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu status eskalasi terupdate

### SR Triage: Quick reply Send di live room

* L0: Klik Send di quick reply box feed Sarah dan SCADA bot (ck SR S3 TERDEFINISI; ck SR S2 P3 chat gagal; audit service-requests S2 dan S5 messages)
  * L1: Komentar terkirim di feed yang sama, tetap di halaman (ck SR S3; audit service-requests S2)
    * L2: Tulis pesan plus lampiran lalu Send
      * L3: Kirim gagal, bubble merah plus tombol Retry (ck SR S2 P3; audit service-requests S1; vocabulary ErrorToast)
      * L4: Klik Retry pada bubble
        * L5: Spinner lalu Success Toast ringan lalu bubble terkirim plus feed terupdate
      * L3: Teks kosong, tombol Send disabled plus hint inline (vocabulary FormField) [ASUMSI hint]
      * L4: Isi teks lalu Send ulang
        * L5: Spinner lalu pesan tampil di feed plus status terkirim

### SR Triage: Empty queue plus Review Converted WOs dan Export Ticket Log

* L0: Klik Preview Empty Queue View atau Review Converted WOs atau Export Ticket Log (ck SR S1 P1 hasil konversi dan P3 export; ck SR S3 toggle demo TERDEFINISI; audit service-requests S2 dan S3 item 4)
  * L1: Empty state Triage Inbox Cleared, atau daftar WO hasil konversi, atau job unduhan log tiket kait laporan (ck SR S1 P1; audit service-requests S3 item 4 pola export global)
    * L2: Klik Review Converted WOs atau jalankan export
      * L3: Export gagal, ErrorToast plus Retry (vocabulary ErrorToast)
      * L4: Klik Retry job
        * L5: Spinner lalu Success Toast plus tautan unduh siap
      * L3: Belum ada WO hasil konversi [ASUMSI], EmptyState plus ajakan kembali ke desk (vocabulary EmptyState)
      * L4: Klik Return to Active Desk
        * L5: TableSkeleton lalu antrean aktif tampil plus counts terupdate

---

## 3. Preventive Maintenance Scheduling and Automation Hub (10 pohon)

### PM Hub: New PM Plan Definition

* L0: Klik New PM Plan Definition di header (ck PM S1 P2 form baru TAK TERDEFINISI; audit preventive-maintenance S2 dan S3 item 2)
  * L1: Form definisi plan baru via modal atau route baru [ASUMSI pilihan diputus saat rebuild] (ck PM S1 P2)
    * L2: Isi nama aset cadence ambang meter assignee checklist lalu submit
      * L3: Cadence ambang assignee atau checklist kosong, pesan inline per field (ck PM S2 P2 validasi plan; vocabulary FormField)
      * L4: Lengkapi lalu re-submit
        * L5: Spinner plus tombol disabled lalu Success Toast lalu plan baru di master 38 plus counts terupdate
      * L3: Submit gagal 500, ErrorToast plus Trace plus Retry dan isi bertahan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu tabel plus counts terupdate

### PM Hub: Drawer detail plan dan checklist CL-HVAC-Q

* L0: Klik ikon checklist atau edit per baris plan (ck PM S1 P2 drawer dan checklist; ck PM S3 TAK TERDEFINISI; audit preventive-maintenance S2 dan S3 item 3)
  * L1: Drawer detail plan per baris atau viewer editor checklist berbagi dengan template builder inspeksi [ASUMSI bentuk dan berbagi] (ck PM S1 P2; dependensi keputusan permukaan checklist)
    * L2: Tinjau logic IF NOW dan alokasi parts PART-FLTR-401
      * L3: Gagal memuat drawer, ErrorToast plus Retry dan baris tetap (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: TableSkeleton drawer lalu detail plus checklist tampil
      * L3: Ambang meter 2.500 vs 5.000 inkonsisten [ASUMSI validasi], warning inline definisi threshold (audit preventive-maintenance Temuan 1; vocabulary FormField)
      * L4: Pilih threshold kanonis lalu simpan
        * L5: Spinner lalu Success Toast lalu matriks trigger terupdate

### PM Hub: Edit plan per baris

* L0: Klik ikon edit PM-PLN-0104 chiller AST-HVAC-004 (ck PM S1 P2 edit TAK TERDEFINISI; audit preventive-maintenance S2 form edit MISSING)
  * L1: Form edit plan di modal atau drawer yang sama dengan create [ASUMSI] (ck PM S1 P2)
    * L2: Ubah cadence atau assignee HVAC Shift Team A lalu simpan
      * L3: Field wajib dikosongkan, pesan inline dan tombol disabled (ck PM S2 P2; vocabulary FormField)
      * L4: Kembalikan isi valid lalu simpan ulang
        * L5: Spinner lalu Success Toast lalu baris plan terupdate
      * L3: Simpan gagal, ErrorToast plus isi bertahan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu baris terupdate

### PM Hub: Dispatch tunggal per baris

* L0: Klik Dispatch pada baris PM-PLN-0082 OVERDUE 3d (ck PM S3 TERDEFINISI; audit preventive-maintenance S2 aksi POST single)
  * L1: Aksi single dispatch inline plus toast per planId, tetap di halaman (ck PM S2 P2 hasil batch sukses gagal; audit preventive-maintenance S1)
    * L2: Konfirmasi dispatch satu plan
      * L3: Dispatch gagal, toast per planId plus baris tetap OVERDUE (ck PM S2 P2; audit preventive-maintenance S1; vocabulary ErrorToast)
      * L4: Klik Retry dispatch baris itu
        * L5: Spinner baris lalu Success Toast lalu baris jadi DISPATCHED plus antrean terupdate
      * L3: Shift capacity stall untuk M. Kowalski [ASUMSI guard], warning inline kapasitas sebelum kirim (audit preventive-maintenance S1 note Shift Capacity Stall)
      * L4: Ganti assignee atau lanjutkan dengan konfirmasi
        * L5: Spinner lalu Success Toast lalu WO hasil plus beban shift terupdate

### PM Hub: Execute Dispatch Batch 4 WOs

* L0: Klik Generate Work Orders Now atau Execute Dispatch Batch 4 WOs estimasi 16.5 Man-Hrs (ck PM S2 P2 batch; ck PM S3 TERDEFINISI; audit preventive-maintenance S1 antrean 4 item)
  * L1: Eksekusi batch inline, antrean dikosongkan visual hanya saat sukses (audit preventive-maintenance S1 dan S2 executeBatchDispatch)
    * L2: Jalankan batch PM-PLN-0082 0056 0104 0099
      * L3: Gagal parsial, toast per plan plus antrean tetap berisi plus rollback optimistis (ck PM S2 P2; audit preventive-maintenance S1; vocabulary ErrorToast)
      * L4: Retry item gagal saja
        * L5: Spinner Processing Telemetry lalu Success Toast lalu antrean cleared plus varian All Queued Dispatched dan WO hasil terupdate
      * L3: Satu plan tidak siap [ASUMSI], warning kesiapan shift bahan bakar parts staged non-blokir (ck PM S2 P3 ready-first; vocabulary FormField)
      * L4: Keluarkan plan belum siap lalu jalankan batch ulang
        * L5: Spinner lalu Success Toast lalu antrean plus kurva kepatuhan terupdate

### PM Hub: Simulate Generation Run

* L0: Klik Simulate Generation Run (ck PM S2 P2 penanda simulasi; ck PM S3 TERDEFINISI simulasi; audit preventive-maintenance S2 simulateRunAlert)
  * L1: Hasil simulasi tanpa dispatch nyata plus penanda visual SIMULASI [ASUMSI bentuk penanda] (ck PM S2 P2 kontrak simulate-run)
    * L2: Jalankan simulasi atas 4 item antrean
      * L3: Simulasi gagal dihitung [ASUMSI], ErrorToast plus antrean tidak berubah (vocabulary ErrorToast)
      * L4: Klik Retry simulasi
        * L5: Spinner lalu Success Toast simulasi plus panel berlabel SIMULASI dan tanpa WO baru
      * L3: Pengguna hampir tertukar dengan dispatch nyata [ASUMSI], banner penegas ini bukan dispatch plus tombol lanjutkan batch asli (ck PM S2 P2)
      * L4: Klik Execute Dispatch Batch yang benar
        * L5: Spinner lalu Success Toast dispatch nyata lalu antrean cleared

### PM Hub: Filter kategori plus search plus pagination plus tab trigger

* L0: Pakai tab All 38 atau HVAC 14 atau search Ctrl slash atau tab Hybrid Calendar Telemetry atau pagination (ck PM S3 TERDEFINISI; audit preventive-maintenance S2 query params)
  * L1: Tabel master terfilter via query kategori search page di halaman yang sama (ck PM S3; audit preventive-maintenance S2)
    * L2: Ketik search atau pindah tab trigger
      * L3: Tanpa hasil filter, pesan plus tombol reset (audit preventive-maintenance S1 wajib ditambah; vocabulary EmptyState)
      * L4: Klik reset filter
        * L5: TableSkeleton baris lalu Showing 5 of 38 tampil plus pagination terupdate
      * L3: Poll engine basi, countdown shimmer plus label STALE (audit preventive-maintenance S1; vocabulary STALE)
      * L4: Tunggu reconnect otomatis
        * L5: TableSkeleton KPI lalu countdown plus antrean terupdate

### PM Hub: Buka histori Last Executed WO

* L0: Klik link WO-2025-0144 atau 0421 atau 8902 atau 6101 atau 2209 di kolom Last Executed (ck PM S1 P1 lima link H1; ck PM S3 TAK TERDEFINISI; audit preventive-maintenance S3 item 1)
  * L1: Detail WO H1 untuk verifikasi audit eksekusi (ck PM S1 P1; audit preventive-maintenance S3 item 1)
    * L2: Tinjau WO histori dari plan PM-PLN-0082 elevator AST-ELEV-02
      * L3: WO histori tidak ditemukan atau beda era sekuens [ASUMSI], EmptyState plus ajakan kembali (audit preventive-maintenance Temuan 3 campur era; vocabulary EmptyState)
      * L4: Kembali ke hub PM
        * L5: TableSkeleton lalu tabel plan tampil plus baris asal terupdate
      * L3: Gagal memuat detail, ErrorToast plus Retry (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu detail WO tampil plus konteks plan terupdate

### PM Hub: Engine basi dan Modbus putus

* L0: Engine countdown basi atau Modbus gateway 10.14.0.8 putus (ck PM S2 P2 status basi; audit preventive-maintenance S1 error Modbus)
  * L1: Badge ACTIVE jadi merah OFFLINE plus label STALE dengan nilai terakhir dipakai (ck PM S2 P2; audit preventive-maintenance S1; vocabulary STALE dan OfflineBanner)
    * L2: Tinjau meter memakai nilai terakhir 4.812 run hours
      * L3: Poll tetap gagal, OfflineBanner plus tombol Force Ping plus counter antrean (vocabulary OfflineBanner)
      * L4: Klik Force Ping atau tunggu reconnect
        * L5: TableSkeleton kartu lalu badge ACTIVE plus Modbus OK plus 99.98 persen terupdate
      * L3: Dispatch ditekan saat STALE [ASUMSI], warning nilai terakhir non-blokir sebelum kirim (ck PM S2 P2 nilai terakhir)
      * L4: Konfirmasi lanjut atau batal sampai online
        * L5: Spinner lalu Success Toast lalu status dispatch terupdate

### PM Hub: Shift Calendar View plus Shift Plan plus Export CSV

* L0: Klik Shift Calendar View atau Shift Plan panah atau ikon export CSV (ck PM S1 P2 P3 shift L1 dan export; ck PM S3 TAK TERDEFINISI; audit preventive-maintenance S2 dan S3 item 4)
  * L1: Tampilan kalender shift atau halaman shift plan [ASUMSI tab vs halaman], atau job unduhan kait laporan untuk CSV [ASUMSI pola export] (ck PM S1 P2 P3; dependensi jam Shift A)
    * L2: Buka kalender shift atau jalankan export
      * L3: Export gagal, ErrorToast plus Retry (vocabulary ErrorToast)
      * L4: Klik Retry job
        * L5: Spinner lalu Success Toast plus tautan unduh siap
      * L3: Kapasitas shift 92 atau 64 atau 78 persen penuh saat dispatch [ASUMSI], warning workload non-blokir (audit preventive-maintenance S1 Gantt)
      * L4: Sesuaikan assignee shift lalu lanjutkan
        * L5: Spinner lalu Success Toast lalu bar Gantt plus antrean terupdate

---

## 4. Field Inspections Audit Queue Hub (11 pohon)

### Inspeksi Hub: Create Inspection Template mode create

* L0: Klik + Create Inspection Template (ck FI S1 P2 mode create; ck FI S3 TAK TERDEFINISI; audit field-inspections S2 dan S3 item 4)
  * L1: Builder kanan mode create kosong, bukan edit draf v2.4 TMPL-HVAC-CHL-02 [ASUMSI perilaku] (ck FI S1 P2)
    * L2: Isi nama protokol plus tambah step pertama lalu Save Draft
      * L3: Step tanpa guardrail atau tipe, error inline per kriteria dan tetap Draft (ck FI S2 P2 publish gagal validasi; vocabulary FormField)
      * L4: Lengkapi guardrail lalu simpan ulang
        * L5: Spinner lalu Success Toast lalu draf baru tampil di builder plus counts protokol terupdate
      * L3: Simpan gagal 500, ErrorToast plus isi builder bertahan (vocabulary ErrorToast)
      * L4: Klik Retry simpan
        * L5: Spinner lalu Success Toast lalu status draf terupdate

### Inspeksi Hub: Preview audit INS-2026-0415 read-only

* L0: Klik Preview pada INS-2026-0415 Cleanroom AST-ENV-108 SCHEDULED (ck FI S1 P2 drawer terpadu; ck FI S3 TAK TERDEFINISI; audit field-inspections S2)
  * L1: Drawer read-only plus deep-link opsional per audit [ASUMSI bentuk drawer] (ck FI S1 P2 usulan pass2)
    * L2: Tinjau pratinjau E. Rostova tanpa mengubah data
      * L3: Gagal memuat pratinjau, ErrorToast plus Retry dan antrean tetap (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: TableSkeleton drawer lalu pratinjau tampil plus status SCHEDULED terupdate
      * L3: Deep-link disalin saat offline [ASUMSI], OfflineBanner ringan plus tautan tersalin lokal (vocabulary OfflineBanner)
      * L4: Buka tautan setelah online
        * L5: TableSkeleton lalu pratinjau tampil

### Inspeksi Hub: Details audit INS-2026-0420

* L0: Klik Details pada INS-2026-0420 Fire Suppression ZONE-DC-04 READY (ck FI S1 P2 drawer terpadu; ck FI S3 TAK TERDEFINISI; audit field-inspections S2 putusan drawer vs route)
  * L1: Drawer detail read-only pola terpadu yang sama dengan Preview (ck FI S1 P2; audit field-inspections S3 item 3)
    * L2: Tinjau detail R. Davies plus telemetri terkait
      * L3: Gagal memuat, ErrorToast plus Retry (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: TableSkeleton lalu detail tampil plus status READY terupdate
      * L3: Filter asal tidak cocok lagi [ASUMSI], EmptyState plus Reset Filter (ck FI S2 P3 filter tanpa hasil; vocabulary EmptyState)
      * L4: Klik Reset Filter
        * L5: TableSkeleton tabel lalu Showing 5 of 18 tampil

### Inspeksi Hub: Open Run INS-2026-0412 ke eksekusi mobile

* L0: Klik Open Run INS-2026-0412 Chiller AST-HVAC-004 IN PROGRESS 65 persen (ck FI S1 P1 route eksekusi H2; ck FI S3 TAK TERDEFINISI; audit field-inspections S3 item 1)
  * L1: Run mobile per audit di shell field, mockup mobile EXISTS tetapi route MISSING (ck FI S1 P1; dependensi progres 65 vs 50 dan GPS Kalimantan)
    * L2: Lanjut eksekusi Step di tablet
      * L3: Run gagal dimuat, ErrorToast plus baris antrean tetap IN PROGRESS (vocabulary ErrorToast)
      * L4: Klik Retry buka run
        * L5: TableSkeleton run lalu checklist mobile tampil plus progres tersinkron [ASUMSI rumus selaras]
      * L3: Perangkat offline saat membuka [ASUMSI], OfflineBanner plus tawarkan draf lokal terakhir (vocabulary OfflineBanner)
      * L4: Buka draf lokal atau tunggu online
        * L5: Skeleton lalu run tampil plus badge offline dan antrean Sync terupdate

### Inspeksi Hub: Force Dispatch INS-2026-0409 OVERDUE

* L0: Klik Force Dispatch pada INS-2026-0409 Generator AST-GEN-01 OVERDUE 3h (ck FI S2 P2 Force Dispatch gagal; ck FI S3 TERDEFINISI; audit field-inspections S1 dan S2 POST force-dispatch)
  * L1: Aksi dispatch paksa inline, tetap di halaman (ck FI S3; audit field-inspections S2)
    * L2: Konfirmasi dispatch paksa ke T. Chen
      * L3: Gagal, toast plus baris tetap OVERDUE (ck FI S2 P2; audit field-inspections S1; vocabulary ErrorToast)
      * L4: Klik Retry dispatch
        * L5: Spinner baris lalu Success Toast lalu status DISPATCHED plus counts Overdue terupdate
      * L3: Gateway IoT putus bersamaan [ASUMSI], widget merah OFFLINE plus nilai terakhir STALE dan dispatch ditahan warning (ck FI S2 P2 gateway; vocabulary STALE)
      * L4: Lanjut paksa dengan konfirmasi atau batal sampai online
        * L5: Spinner lalu Success Toast lalu status plus widget terupdate

### Inspeksi Hub: Add Step dan Save Draft builder

* L0: Klik + Add Checklist Step atau Save Draft di builder TMPL-HVAC-CHL-02 v2.4 (ck FI S3 TERDEFINISI; audit field-inspections S2 aksi builder inline)
  * L1: Step baru di builder kanan plus status tetap Draft (ck FI S3; audit field-inspections S2 PATCH draft)
    * L2: Tambah step Binary atau Numeric lalu simpan draf
      * L3: Tipe atau judul kosong, error inline per kriteria (ck FI S2 P2; vocabulary FormField)
      * L4: Lengkapi lalu simpan ulang
        * L5: Spinner lalu Success Toast lalu 5 step tampil plus versi draf terupdate
      * L3: Simpan gagal, ErrorToast plus urutan step bertahan (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu builder terupdate

### Inspeksi Hub: Publish Template v2.4 dengan guardrail

* L0: Klik Publish Template v2.4 Central Chiller Safety Diagnostic Protocol (ck FI S2 P2 publish gagal validasi; ck FI S3 TERDEFINISI; audit field-inspections S1 dan S2 publish)
  * L1: Template terbit plus status PUBLISHED, tetap di halaman (audit field-inspections S2 response PUBLISHED)
    * L2: Konfirmasi publish 4 kriteria reorderable
      * L3: Kriteria tanpa guardrail atau numeric tanpa min max, error inline per kriteria tanpa guardrail dan tetap Draft (ck FI S2 P2; vocabulary FormField)
      * L4: Tambahkan guardrail If FAIL Auto-Flag plus batas 110-130 PSI lalu publish ulang
        * L5: Spinner plus tombol disabled lalu Success Toast lalu badge PUBLISHED plus counts protokol terupdate
      * L3: Publish gagal API, ErrorToast plus tetap Draft (vocabulary ErrorToast)
      * L4: Klik Retry publish
        * L5: Spinner lalu Success Toast lalu status PUBLISHED terupdate

### Inspeksi Hub: Filter tab antrean plus search plus pagination

* L0: Pakai tab All 18 atau Today 6 atau Overdue 2 atau Completed 10 atau Templates Forms, search Ctrl slash, dropdown Zone Discipline, pagination (ck FI S3 TERDEFINISI query; ck FI S2 P3 filter tanpa hasil; ck FI S1 P2 tab Templates kosong; audit field-inspections S2)
  * L1: Antrean terfilter via query tab zone discipline page di halaman yang sama (ck FI S3; audit field-inspections S2)
    * L2: Ketik search atau pindah tab
      * L3: Tanpa hasil termasuk tab Templates kosong, pesan plus Reset Filter (ck FI S2 P3 dan S1 P2; vocabulary EmptyState)
      * L4: Klik Reset Filter
        * L5: TableSkeleton 5 baris lalu antrean tampil plus Page 1 of 4 terupdate
      * L3: Poll 15 detik basi, badge SCADA STREAMING jadi CONNECTING (audit field-inspections S1; vocabulary STALE)
      * L4: Tunggu reconnect otomatis
        * L5: TableSkeleton KPI lalu compliance 98.2 persen plus antrean terupdate

### Inspeksi Hub: Fast-link Mobile Execution dan Findings Desk

* L0: Klik kartu fast-link Mobile Tablet Execution View atau Findings Conversion Desk berupa div klik (ck FI S1 P1 dan P1 findings H2; ck FI S3 TAK TERDEFINISI; audit field-inspections S1 dan Temuan 1 div tanpa anchor)
  * L1: Run mobile per audit atau permukaan findings sebagai tab atau section dengan deep-link temuan terpilih (ck FI S1 P1; audit field-inspections S3 item 2; navigation-audit S2 putusan tab vs route)
    * L2: Aktifkan via klik atau keyboard Tab Enter sebagai link fokusabel (ck FI S2 P1 link accessible; audit navigation-audit S5)
      * L3: Keyboard tidak bisa fokus sebelum rebuild [ASUMSI kondisi], tidak ada affordance dan screen reader melewatkan (ck FI S2 P1; audit field-inspections Temuan 1)
      * L4: Ganti div dengan link Next.js fokusabel plus ring fokus 2px offset (ck FI S2 P1; vocabulary focus ring ui-state-patterns S3)
        * L5: Fokus terlihat lalu navigasi sukses plus konten tujuan tampil dan status link terupdate
      * L3: Tujuan findings belum diputus tab vs route, deep-link tertunda (ck FI S1 P1; audit field-inspections S3 item 2)
      * L4: Putuskan permukaan lalu tautkan Review Findings INS-2026-0398 eksplisit
        * L5: Success Toast ringan lalu section findings tampil plus temuan terpilih terupdate

### Inspeksi Hub: Reorder step builder aksesibel

* L0: Seret handle drag_indicator 4 kriteria builder yang kini visual saja (ck FI S2 P2 reorder aksesibel; audit field-inspections S1 tanpa dnd nyata)
  * L1: Urutan step tersimpan via dnd nyata yang bisa keyboard [ASUMSI mekanisme] (ck FI S2 P2)
    * L2: Pindah Step 02 Numeric ke posisi 1 via drag atau keyboard
      * L3: Drop gagal tersimpan, ErrorToast plus urutan kembali semula (vocabulary ErrorToast)
      * L4: Ulangi via keyboard lalu Save Draft
        * L5: Spinner lalu Success Toast lalu urutan step terupdate
      * L3: Keyboard tidak mencapai handle sebelum rebuild, hint inline cara keyboard (ck FI S2 P1 pola accessible; vocabulary FormField hint) [ASUMSI teks hint]
      * L4: Ikuti hint keyboard lalu simpan
        * L5: Spinner lalu Success Toast lalu urutan terupdate

### Inspeksi Hub: Export Audit Log dan Shift Handover

* L0: Klik Export Audit Log atau Shift Handover (ck FI S1 P2 P3 export dan handover L1; ck FI S3 TAK TERDEFINISI; audit field-inspections S2 dan S3)
  * L1: Job unduhan kait laporan atau audit log, atau alur handover seragam lintas hub [ASUMSI tujuan] (ck FI S1 P2 P3)
    * L2: Jalankan export CSV atau buka handover
      * L3: Export gagal, ErrorToast plus Retry (vocabulary ErrorToast)
      * L4: Klik Retry job
        * L5: Spinner lalu Success Toast plus tautan unduh siap
      * L3: Handover tanpa tujuan seragam [ASUMSI], draf handover tersimpan lokal plus warning sinkron lintas hub (ck FI S1 P2 L1; vocabulary FormField)
      * L4: Kirim handover setelah pola diputus
        * L5: Spinner lalu Success Toast lalu status handover terupdate

---

## 5. Inspection Findings Auto-WO Conversion Desk (10 pohon)

### Findings Desk: Convert Finding FND-2026-0188 ke WO-2026-8802

* L0: Klik Convert Finding to Work Order plus Auto-Dispatch Lead untuk FND-2026-0188 seal 18.4 ppm (ck FND S2 P1 guard LOTO dan P2 gagal; ck FND S3 TAK TERDEFINISI; audit findings-conversion S2 POST convert)
  * L1: WO hasil WO-2026-8802 di detail WO H1 [dependensi WO seal ganda 0894 vs 8802] (ck FND S1 P1 H1; audit findings-conversion S3 item 1)
    * L2: Konfirmasi profil EMERGENCY BREAKDOWN WO-EM-01 plus Marcus Kowalski plus LOTO 480V dicentang lalu kirim
      * L3: LOTO tak dicentang, tombol Convert disabled plus tooltip karena WO tak bisa tutup tanpa voucher lock dan sertifikat purge (ck FND S2 P1 guard LOTO fakta mockup; vocabulary FormField guard)
      * L4: Centang LOTO lalu kirim ulang
        * L5: Spinner Generating WO lalu Success Toast plus WO-2026-8802 Dispatched ke M. Kowalski dan finding pindah CONVERTED
      * L3: Konversi gagal, toast destruktif plus temuan tetap CRITICAL FAIL tidak pindah (ck FND S2 P2; audit findings-conversion S1; vocabulary ErrorToast plus Trace)
      * L4: Klik Retry convert
        * L5: Spinner lalu Success Toast lalu status CONVERTED plus tab counts terupdate

### Findings Desk: Batch Convert to Work Orders 3

* L0: Klik Batch Convert to Work Orders 3 di header (ck FND S1 P2 semantik batch; ck FND S3 target TAK TERDEFINISI; audit findings-conversion S2 batch-convert)
  * L1: Daftar WO hasil batch sebagai halaman hasil [ASUMSI mekanisme seleksi tak terlihat] (ck FND S1 P2; audit pass2 S7b)
    * L2: Pilih 3 temuan FND-2026-0188 0185 0182 lalu jalankan batch
      * L3: Seleksi kosong atau LOTO satu item belum siap, tombol disabled plus alasan inline (ck FND S1 P2; ck FND S2 P1 guard; vocabulary FormField)
      * L4: Lengkapi seleksi dan LOTO lalu jalankan ulang
        * L5: Spinner lalu Success Toast per WO hasil lalu tab CONVERTED plus counts 12 terupdate
      * L3: Batch gagal parsial, ErrorToast plus item gagal tetap CRITICAL FAIL (ck FND S2 P2; vocabulary ErrorToast)
      * L4: Retry item gagal saja
        * L5: Spinner lalu Success Toast lalu daftar WO hasil terupdate

### Findings Desk: Buka kartu defect Select inline

* L0: Klik kartu defect atau Select pada FND-2026-0185 battery 21.4 VDC atau FND-2026-0182 Delta-P 340 Pa (ck FND S3 seleksi TERDEFINISI; audit findings-conversion S2 seleksi inline)
  * L1: Konsol kanan berganti ke temuan terpilih, tetap di halaman (ck FND S3; audit findings-conversion S2 GET findings id)
    * L2: Tinjau Nominal vs Actual plus BOM plus SLA
      * L3: Gagal memuat preview konversi, ErrorToast plus kartu lama bertahan (vocabulary ErrorToast)
      * L4: Klik kartu ulang atau Retry
        * L5: TableSkeleton konsol lalu profil PRE-COMPILED plus SLA 18:15 terupdate
      * L3: Search FND-2026 tanpa hasil, kartu kosong plus reset filter (ck FND S2 P3; audit findings-conversion S1; vocabulary EmptyState)
      * L4: Klik reset filter
        * L5: TableSkeleton kartu lalu 3 kartu tampil plus tab All 12 terupdate

### Findings Desk: Dismiss Finding dengan justifikasi wajib

* L0: Klik Dismiss Finding Requires Justification aksi destruktif (ck FND S2 P1 konfirmasi dismiss; ck FND S3 TERDEFINISI modal; audit findings-conversion S2 dismiss)
  * L1: Modal justifikasi plus aksi inline, tetap di halaman (ck FND S2 P1; audit findings-conversion S2 POST dismiss)
    * L2: Tulis justifikasi lalu submit dismiss
      * L3: Justifikasi kosong, error inline pada modal dan tombol disabled (ck FND S2 P1; audit findings-conversion S1; vocabulary FormField)
      * L4: Isi justifikasi lalu re-submit
        * L5: Spinner lalu Success Toast lalu finding pindah DISMISSED plus metrik 12 persen dismissed terupdate
      * L3: Dismiss gagal API, ErrorToast plus finding tetap CRITICAL FAIL (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu status DISMISSED terupdate

### Findings Desk: Schedule Routine PM prefill dari temuan

* L0: Klik Schedule Routine PM di action bar (ck FND S1 P2 prefill PM M5; ck FND S3 TAK TERDEFINISI; audit findings-conversion S2 from-finding)
  * L1: Definisi plan PM prefill konteks FND-2026-0188 via konvensi aset atau finding [ASUMSI konvensi] (ck FND S1 P2)
    * L2: Tinjau prefill lalu simpan sebagai draf plan
      * L3: Aset atau checklist prefill kosong, pesan inline (ck PM S2 P2 pola validasi lintas modul; vocabulary FormField)
      * L4: Lengkapi lalu simpan ulang
        * L5: Spinner lalu Success Toast lalu plan draf PM-PLN baru plus konteks temuan terupdate
      * L3: Prefill gagal dibentuk [ASUMSI], ErrorToast plus tetap di desk (vocabulary ErrorToast)
      * L4: Klik Retry prefill
        * L5: Spinner lalu Success Toast lalu form plan terisi

### Findings Desk: Filter severity plus search FND-2026

* L0: Pakai tab All 12 atau CRITICAL FAIL 5 atau OUT-OF-SPEC 4 atau CONVERTED 3 plus search FND-2026 (ck FND S3 TERDEFINISI query; ck FND S2 P3 filter tanpa hasil; audit findings-conversion S2 query severity search)
  * L1: Aliran defect terfilter via query severity search di halaman yang sama (ck FND S3; audit findings-conversion S2)
    * L2: Ketik search atau pindah tab severity
      * L3: Tanpa hasil, kartu kosong plus reset filter (ck FND S2 P3; audit findings-conversion S1; vocabulary EmptyState)
      * L4: Klik reset filter
        * L5: TableSkeleton kartu lalu 3 kartu tampil plus counts 5 plus 4 plus 3 terupdate
      * L3: Definisi pill 5 Unresolved vs sisa 9 belum selaras [ASUMSI tampilan], note inline definisi hitungan kritis vs sisa (ck FND S1 P2 redefinisi pill)
      * L4: Terapkan definisi kanonis setelah diputus
        * L5: Success Toast ringan lalu pill plus tab counts konsisten terupdate

### Findings Desk: Full Specimen View dan Audit Integrity Report

* L0: Klik Full Specimen View foto PHOTO_CHILLER4_SEAL.RAW atau Audit Integrity Report rantai hash (ck FND S1 P2 viewer dan report; ck FND S3 TAK TERDEFINISI; audit findings-conversion S2 dan S3 item 3)
  * L1: Evidence viewer foto penuh atau viewer laporan integritas ledger hash (ck FND S1 P2; dependensi EXIF Eropa vs GPS Kalimantan; anti-artifact tanpa EXIF asing di prod)
    * L2: Buka spesimen SHA-256 Verified atau rantai hash ledger
      * L3: Foto atau report gagal dimuat, ErrorToast plus Retry dan konsol tetap (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu spesimen tampil plus hash verified [POLA-BARU: Evidence Lightbox]
      * L3: Rantai hash terputus [ASUMSI], banner integritas inline plus tombol salin log (vocabulary ErrorToast plus Copy Log)
      * L4: Klik Copy Log lalu eskalasi ke admin
        * L5: Integrity viewer tampil plus status UNVERIFIED bertahan [POLA-BARU: Integrity Report Viewer]

### Findings Desk: BOM shortage PART-SEAL-8821

* L0: Tinjau tabel BOM 2 baris PART-SEAL-8821 1 ea plus PART-LUB-09 1 pail saat parts tak tersedia (ck FND S2 P2 BOM shortage; audit findings-conversion S1 error BOM)
  * L1: Badge All Line Items berubah SHORTAGE plus tombol convert disabled beralasan di halaman yang sama (ck FND S2 P2; audit findings-conversion S1)
    * L2: Cek ketersediaan Central Crib sebelum convert
      * L3: Shortage aktif [ASUMSI ambang], badge SHORTAGE plus alasan inline dan convert disabled (ck FND S2 P2; vocabulary FormField guard)
      * L4: Ganti Bin C-04 yang tersedia atau requisition parts lalu coba lagi
        * L5: Spinner cek ulang lalu Success Toast stok lalu tombol convert aktif plus badge tersedia terupdate
      * L3: Cek stok gagal, ErrorToast plus badge terakhir bertahan (vocabulary ErrorToast)
      * L4: Klik Retry cek stok
        * L5: Spinner lalu badge plus tombol terupdate

### Findings Desk: SLA P1 OSHA 4 jam derivasi 14:15 ke 18:15

* L0: Tinjau SLA Today 18:15 UTC 4h Window OSHA Clean Air dari pencatatan 14:15 (ck FND S2 P2 derivasi SLA; audit pass2 S7b temuan derivasi)
  * L1: Aturan derivasi eksplisit di kontrak plus countdown di konsol [ASUMSI aturan umum] (ck FND S2 P2)
    * L2: Verifikasi SLA sebelum convert
      * L3: SLA hampir breach [ASUMSI], pill peringatan plus prioritas IMMEDIATE ditegaskan inline (audit findings-conversion S1 Priority Emergency P1)
      * L4: Lanjut convert prioritas atau eskalasi lead
        * L5: Spinner lalu Success Toast lalu SLA plus penugasan terupdate
      * L3: Countdown basi [ASUMSI], label STALE pada SLA (vocabulary STALE)
      * L4: Tunggu poll pulih
        * L5: Skeleton lalu countdown plus SLA terupdate

### Findings Desk: Export CSV ledger defect

* L0: Klik Export CSV ledger defect (ck FND S1 P2 export LOW; ck FND S3 TAK TERDEFINISI; audit findings-conversion S2 dan S3 item 4 pola export global)
  * L1: Unduhan CSV via job kait laporan, pola samakan global [ASUMSI pola] (ck FND S1 P2)
    * L2: Jalankan export ledger 12 temuan
      * L3: Job gagal, ErrorToast plus Retry (vocabulary ErrorToast)
      * L4: Klik Retry job
        * L5: Spinner lalu Success Toast plus tautan unduh CSV siap
      * L3: Filter aktif belum ikut [ASUMSI], konfirmasi inline cakupan export semua vs filter (vocabulary FormField)
      * L4: Pilih cakupan lalu jalankan ulang
        * L5: Spinner lalu Success Toast plus unduhan sesuai cakupan

---

## 6. Mobile Field Inspection Execution Desk, Sistem B (11 pohon)

> Seluruh pohon modul ini memakai sistem B rugged: border tebal 1.5-2px, hard shadow,
> target sentuh min 48px (tombol PASS FAIL h-14, tombol aksi h-12), headline Space Grotesk,
> tombol PASS hijau FAIL merah tersegmentasi. Tanpa bottom-nav selain 4 tab field valid.

### Mobile Run: Toggle PASS atau FAIL Step 02 plus reading 18.4 ppm

* L0: Toggle tersegmentasi PASS vs FAIL ACTIVE Step 02 Primary Shaft Seal plus input telemetri besar 18.4 ppm Max Allowed 0.0 (ck MOB S3 toggle TERDEFINISI; audit mobile-execution S1 tombol h-14 dan S2 PATCH steps)
  * L1: State inline FAIL DEFECT FLAGGED plus callout merah breach OSHA dan draf WO urgent tersusun otomatis (audit mobile-execution S1; ck MOB S2 P1 validasi FAIL)
    * L2: Pilih FAIL, isi reading, tulis catatan, pastikan 1 foto lalu autosave
      * L3: Bukti kurang (tanpa reading atau tanpa foto atau tanpa catatan), tombol submit disabled plus hint inline (ck MOB S2 P1 kontrol keselamatan; vocabulary FormField guard)
      * L4: Lengkapi reading 18.4 plus foto plus catatan PART-SEAL-8821 lalu lanjut
        * L5: Spinner autosave lalu Success Toast ringan lalu badge FAIL plus kapsul 1 Critical Defect terupdate
      * L3: Autosave gagal saat offline [ASUMSI], fallback draf lokal plus badge Sync bertambah (ck MOB S2 P1 fallback offline; vocabulary OfflineBanner)
      * L4: Lanjut offline, sync belakangan via tab Sync
        * L5: OfflineBanner plus antrean Sync plus 1 lalu status tersimpan lokal terupdate

### Mobile Run: Override PASS via modal PIN supervisor

* L0: Toggle PASS atas Step 02 yang sedang FAIL, demo kini alert ganti modal PIN (ck MOB S1 P1 modal PIN kontrol keselamatan; ck MOB S3 toggle plus PIN TAK TERDEFINISI; audit mobile-execution S2 togglePassFail dan S3 item 3)
  * L1: Modal PIN supervisor plus alasan plus audit trail peng-override (ck MOB S1 P1; audit pass1 dan pass2 temuan keamanan)
    * L2: Masukkan PIN supervisor plus alasan lalu konfirmasi override
      * L3: PIN salah atau alasan kosong, pesan inline dan step tetap FAIL (ck MOB S1 P1; vocabulary FormField)
      * L4: Perbaiki PIN dan alasan lalu konfirmasi ulang
        * L5: Spinner lalu Success Toast lalu badge PASS OVERRIDE plus audit trail peng-override terupdate
      * L3: Submit override gagal API, ErrorToast plus step tetap FAIL (vocabulary ErrorToast)
      * L4: Klik Retry
        * L5: Spinner lalu Success Toast lalu status override terupdate

### Mobile Run: Retake Photo bukti Step 02

* L0: Klik Retake Photo h-12 di modul Mandatory Visual Evidence 1 Photo Attached (ck MOB S3 TERDEFINISI capture; audit mobile-execution S1 frame 16:9 overlay GPS dan S2 POST evidence)
  * L1: Capture inline kamera plus overlay GPS 0.7893S 113.9213E plus timestamp 14:18:22 [dependensi vs EXIF Eropa] (audit mobile-execution S1 dan S2 multipart)
    * L2: Ambil foto lalu simpan ke step
      * L3: Foto gagal disimpan, error inline plus tombol Retake (audit mobile-execution S1; vocabulary FormField plus ErrorToast ringan)
      * L4: Klik Retake lalu simpan ulang
        * L5: Spinner lalu Success Toast lalu frame foto plus overlay GPS terupdate dan syarat 1 foto terpenuhi
      * L3: Izin kamera ditolak [ASUMSI], pesan inline cara aktifkan izin plus opsi unggah file (vocabulary FormField)
      * L4: Beri izin atau pilih file lalu simpan
        * L5: Spinner lalu Success Toast lalu evidence terupdate

### Mobile Run: Add Voice Note Step 02

* L0: Klik Add Voice Note, toggle rekam Recording 0:04 lalu Voice Note Saved (ck MOB S3 TERDEFINISI; ck MOB S2 P2 status rekaman; audit mobile-execution S1 toggle rekam dan S2 evidence mic)
  * L1: Voice note tersimpan di step sebagai bukti pendukung [ASUMSI durasi maksimum] (ck MOB S2 P2)
    * L2: Rekam lalu simpan voice note
      * L3: Gagal simpan, error inline plus ulangi (ck MOB S2 P2; audit mobile-execution S1; vocabulary FormField)
      * L4: Klik ulangi rekam lalu simpan
        * L5: Spinner lalu Success Toast lalu status Voice Note Saved plus durasi terupdate
      * L3: Izin mic ditolak atau offline [ASUMSI], pesan inline plus simpan antre lokal (vocabulary OfflineBanner)
      * L4: Beri izin atau antre lalu sync belakangan
        * L5: OfflineBanner plus antrean Sync terupdate lalu Success Toast setelah sync

### Mobile Run: Sync via IoT Modbus Step 03 118 PSI

* L0: Klik Sync via IoT Modbus Auto-Read 118 PSI bounds Min 110 Max 130 (ck MOB S3 TERDEFINISI; ck MOB S2 P2 Modbus gagal; audit mobile-execution S1 Step 03 dan S2 live-reading)
  * L1: Baca sensor inline plus pill Modbus Online, tetap di halaman (audit mobile-execution S1 dan S2 GET live-reading)
    * L2: Jalankan sync sensor suction pressure Delta-T
      * L3: Modbus gagal baca, tombol sync merah plus fallback input manual Step 03 (ck MOB S2 P2; audit mobile-execution S1; vocabulary ErrorToast)
      * L4: Isi manual dalam bounds 110-130 lalu simpan
        * L5: Spinner Reading lalu Success Toast lalu reading tersimpan plus badge manual fallback terupdate
      * L3: Nilai di luar bounds [ASUMSI], pesan inline plus auto-flag defect seperti Step 02 (audit field-inspections S1 aturan out-of-bounds)
      * L4: Verifikasi ulang bacaan atau tandai FAIL dengan bukti
        * L5: Spinner lalu Success Toast lalu status step plus kapsul defect terupdate

### Mobile Run: Submit Audit plus Auto-Dispatch WO

* L0: Klik Submit Audit plus Auto-Dispatch WO h-14 tombol hitam ikon bolt (ck MOB S1 P1 tujuan pasca-submit; ck MOB S3 TAK TERDEFINISI; audit mobile-execution S2 POST submit dan S3 item 2)
  * L1: Kembali ke daftar audits plus toast tautan WO terbuat ke detail WO [dependensi WO 0894 vs 8802] (ck MOB S1 P1 H2 plus H1)
    * L2: Konfirmasi submit 1 Critical Defect Priority 1
      * L3: Syarat FAIL belum lengkap (reading atau foto atau catatan kurang), tombol disabled plus hint bukti kurang (ck MOB S2 P1 validasi FAIL wajib; vocabulary FormField guard)
      * L4: Lengkapi bukti lalu submit ulang
        * L5: Spinner ganda disabled lalu Success Toast plus tautan WO lalu kembali ke daftar audits dan status SUBMITTED terupdate
      * L3: Submit gagal API, ErrorToast plus Retry dan run tetap tersimpan (vocabulary ErrorToast)
      * L4: Klik Retry atau Save Offline Local Draft
        * L5: Spinner lalu Success Toast lalu status SUBMITTED plus WO terupdate, atau OfflineBanner plus antrean Sync bila offline

### Mobile Run: Save Offline Local Draft plus antrean Sync

* L0: Klik Save Offline Local Draft h-12 atau submit otomatis fallback saat offline (ck MOB S1 P1 dan P2 sync offline; ck MOB S2 P1 fallback; ck MOB S3 TAK TERDEFINISI; audit mobile-execution S1 klaim cache dan S3 item 1 dan 4)
  * L1: Antrean sync Sync route H2 berisi draf lalu foto lalu voice sesuai urutan [ASUMSI kebijakan konflik] (ck MOB S1 P2 spesifikasi sync; audit pass2 S7b)
    * L2: Simpan draf INS-2026-0412 Step 2 of 4 50 persen [dependensi vs 65 hub]
      * L3: Penyimpanan lokal penuh atau tulis gagal [ASUMSI], error inline plus ulangi simpan (vocabulary FormField)
      * L4: Bebaskan ruang atau ulangi simpan
        * L5: Spinner lalu Success Toast lalu draf tersimpan plus badge Sync bertambah
      * L3: Offline berkepanjangan, OfflineBanner plus ikon cloud offline plus badge antrean bertambah (ck MOB S2 P1; vocabulary OfflineBanner)
      * L4: Buka tab Sync untuk tinjau antrean lalu unggah saat online
        * L5: OfflineBanner hilang lalu Success Toast per item lalu antrean kosong EmptyState plus progres terupdate

### Mobile Run: Tab Audits Finding Sync tiga route field

* L0: Klik tab Audits badge 3 atau Finding atau Sync di bottom-nav field valid (ck MOB S1 P1 tiga tab H2; ck MOB S3 TAK TERDEFINISI ketiganya; audit mobile-execution S2 dan S3 item 1)
  * L1: Route audits atau findings new atau sync, tanpa ketiganya alur run ke submit ke sync terputus (ck MOB S1 P1; audit mobile-execution S3 item 1; navigation-audit S4 item 2)
    * L2: Buka Sync untuk tinjau dan unggah draf draft-55
      * L3: Sync kosong, EmptyState plus ajakan kembali ke Audits (vocabulary EmptyState; adopsi ui-state-patterns S3 ke sync)
      * L4: Kembali ke Audits atau buat temuan baru
        * L5: TableSkeleton lalu daftar audits tampil plus badge 3 terupdate
      * L3: Unggah gagal parsial foto lalu voice [ASUMSI urutan], ErrorToast plus item gagal bertahan di antrean (ck MOB S1 P2 retry; vocabulary ErrorToast)
      * L4: Klik Retry unggah item gagal
        * L5: Spinner lalu Success Toast lalu antrean berkurang plus status synced terupdate

### Mobile Run: Review bukti LOTO Step 01 Padlock 4092

* L0: Klik Review bukti Step 01 Padlock 4092 Seal Intact 0.0V Measured PASS VERIFIED 14:02 (ck MOB S1 P2 review evidence; ck MOB S3 TAK TERDEFINISI; audit mobile-execution S2)
  * L1: Lightbox foto LOTO [ASUMSI bentuk lightbox] [dependensi LOTO 4092 vs M-44] (ck MOB S1 P2)
    * L2: Buka dan periksa segel plus bacaan voltase
      * L3: Foto gagal dimuat offline [ASUMSI], placeholder plus OfflineBanner ringan dan tombol muat ulang (vocabulary OfflineBanner)
      * L4: Muat ulang saat online
        * L5: Spinner lalu foto tampil plus badge PASS VERIFIED [POLA-BARU: Evidence Lightbox]
      * L3: Foto tidak cocok dengan Step [ASUMSI], warning inline plus opsi retake (vocabulary FormField)
      * L4: Retake foto LOTO lalu simpan
        * L5: Spinner lalu Success Toast lalu bukti Step 01 terupdate [POLA-BARU: Evidence Lightbox]

### Mobile Run: Guard FAIL wajib reading foto catatan sebelum submit

* L0: Coba submit saat Step 02 FAIL tanpa reading 18.4 atau tanpa foto atau tanpa catatan (ck MOB S2 P1 validasi FAIL wajib kontrol keselamatan; audit mobile-execution S2 zod FAIL wajib)
  * L1: Tombol submit disabled plus hint bukti kurang di action dock sticky (ck MOB S2 P1; audit mobile-execution S1 dock)
    * L2: Baca hint lalu lengkapi tiap syarat satu per satu
      * L3: Reading dihapus atau foto dilepas kembali [ASUMSI], hint muncul lagi dan tombol tetap disabled (vocabulary FormField guard)
      * L4: Isi ulang reading plus pasang foto plus tulis catatan
        * L5: Hint hilang lalu tombol aktif lalu Success Toast kesiapan submit dan kapsul defect terupdate
      * L3: Catatan terlalu singkat [ASUMSI batas], pesan inline minimal panjang (vocabulary FormField)
      * L4: Perpanjang catatan rekomendasi ganti PART-SEAL-8821 lalu lanjut
        * L5: Spinner autosave lalu tombol aktif plus status valid terupdate

### Mobile Run: Scope site header dan avatar profil teknisi

* L0: Ganti scope HQ Nusantara Chiller Plant B-204 via dropdown atau klik avatar profil (ck MOB S1 P3 profil L2 dan pemilih site; ck MOB S3 sheet TAK TERDEFINISI; audit mobile-execution S2 profil MISSING)
  * L1: Sheet pilihan site atau profil dan sesi teknisi ikut backlog organisasi (ck MOB S1 P3; audit mobile-execution S2)
    * L2: Pilih site lain atau buka profil
      * L3: Site tak punya audit aktif [ASUMSI], EmptyState plus ajakan kembali ke site semula (vocabulary EmptyState)
      * L4: Kembali ke HQ Nusantara B-204
        * L5: TableSkeleton lalu konteks aset AST-HVAC-004 plus run tampil
      * L3: Sesi berakhir saat ganti konteks [ASUMSI], pesan inline login ulang plus draf lokal aman (vocabulary FormField plus OfflineBanner)
      * L4: Login ulang lalu lanjutkan run
        * L5: Spinner lalu Success Toast lalu profil plus draf terupdate

---

## Rekap

> WO Hub 12 pohon, SR Triage 11 pohon, PM Hub 10 pohon, Inspeksi Hub 11 pohon,
> Findings Desk 10 pohon, Mobile Run 11 pohon. Total 65 pohon.
> [POLA-BARU] 7 kemunculan: Evidence Lightbox 5 (WO-9 dua cabang, FND-7, MOB-9 dua cabang),
> Print View 1 (WO-12), Integrity Report Viewer 1 (FND-7).
> [ASUMSI] menandai pilihan bentuk yang belum diputus (modal vs route vs drawer,
> konvensi query, ambang, teks hint, kebijakan konflik sync).
# Pohon Interaksi — Part Aset & Resource (Batch A)

Cakupan: 6 layar saja — asset_registry_lifecycle_management_ledger, asset_detail_spare_parts_inventory_ledger, facility_locations_spatial_hierarchy_management, inventory_spare_parts_management_ledger, purchasing_pos_management_hub, vendors_contractors_management_hub. Semua desktop = sistem A (Apex Operational Facility System). Dokumen ini Markdown murni tanpa kode.

Sumber: docs/exp-check/part-aset.md (check), docs/ui-audit/ui-state-patterns.md (pola), audit per layar + pass2 (audit), code.html tiap folder (fakta mockup).

Legenda vocabulary terminal L5 (hanya ini yang boleh tanpa tag): TableSkeleton + polling + STALE (§03), FormField guard + submit disabled + sukses hijau (§02), ErrorToast + Trace + Retry/Copy Log (2B), OfflineBanner + Force Ping + antrean (2A), EmptyState + CTA (§01), hover-reveal aksi baris + focus ring (§03), status tombol Posting/Transmitting + toast + status terupdate (template L5 + §03/2B).

Legenda tag: [POLA-BARU] = pola belum ada di ui-state-patterns. [ASUMSI] = tanpa sumber, diputuskan saat rebuild. CANON = konflik antar-layar (OEM Trane vs Daikin, skor 68 vs 88 vs 88,4, WO seal WO-2026-0894 vs WO-2025-0812/WO-2025-0044, harga PART-SEAL-8821 $1.450 vs $1.420, SKU PART-BRG-6205 vs PART-BRG-6204, sisa MSA 312d vs 288d, bin CRIB-B vs SUB-LCK-4B, CHILL-NUSA-04 vs AST-HVAC-004, label WO-0894 vs WO-2026-0894) diperlakukan sebagai dependensi, bukan keputusan.

Larangan artefak: bottom-nav field, header mobile field, font Space Grotesk, dan judul Run Checklist pada purchasing/vendors adalah ARTEFAK copy-paste Stitch — dilarang dijadikan pohon.

## 1. Asset Registry — Enterprise Asset Ledger

Konteks: 1.842 unit, drawer AST-HVAC-004 (DEFECT FLAGGED, 68 NEEDS OVERHAUL, Trane EarthWise CVHE — CANON vs Daikin di detail), aksi Create WO / Schedule PM / Transfer Loc / Decommission, search terisi statis AST-HVAC-004, footer Page 1 of 308 vs Rows 25.

### Asset Registry: registrasi aset baru
* L0: Klik + Register New Asset di title bar (check Registry §1 Register P2; audit §2 MISSING)
  * L1: Modal registrasi aset, target POST /api/v1/assets (check Registry §2 Modal Register P2; pass2 §3.4)
    * L2: Isi nama, kategori, OEM, serial, lokasi, kritikalitas lalu submit
      * L3: Field wajib kosong atau serial duplikat → pesan inline per field + submit disabled beralasan
      * L4: Lengkapi field dan perbaiki serial, submit ulang
        * L5: status tombol → toast → baris aset baru muncul di tabel
      * L3: Server menolak 500 → ErrorToast + Trace + Retry, modal tetap terbuka
      * L4: Klik Retry atau salin log via Copy Log
        * L5: ErrorToast + Trace + Retry

### Asset Registry: buka drawer profil aset
* L0: Klik baris tabel atau chevron (check Registry §3 drawer TERDEFINISI; audit §2)
  * L1: Drawer profil AST-HVAC-004 inline, produksi /assets/[id] (audit EXISTS; pass2 §3 drawer ADA)
    * L2: Pilih baris AST-HVAC-004
      * L3: Telemetri SCADA basi → strip merah Telemetry Degraded + penanda STALE pada baris
      * L4: Tunggu polling atau klik ulang baris
        * L5: polling + STALE → badge Online kembali
      * L3: Drawer gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: TableSkeleton → drawer terisi, atau ErrorToast menetap

### Asset Registry: cari, filter, tab kategori, pagination
* L0: Ketik search atau ganti filter lokasi, health, tab kategori, Rows, halaman (check Registry §2 Search P3 dan Sinkronisasi P3; audit §2 query params TERDEFINISI)
  * L1: Direktori terfilter via query params (?q=, ?locationId=, ?health=, ?category=, ?page=) (check Registry §2; pass2 temuan value statis)
    * L2: Ketik AST-HVAC-004, pilih tab HVAC & Chillers (284), pindah halaman
      * L3: Tanpa hasil → EmptyState + tombol Reset Filter
      * L4: Klik Reset Filter atau ubah kata kunci
        * L5: TableSkeleton → tabel terisi kembali
      * L3: Meta halaman tak konsisten (Page 1 of 308 vs Rows 25, 6 baris tampil) → kalibrasi dari meta API; bila meta gagal → ErrorToast + Retry
      * L4: Muat ulang filter
        * L5: ErrorToast + Trace + Retry

### Asset Registry: pindah lokasi aset
* L0: Klik Transfer Loc di drawer (check Registry §1 Transfer P2; audit §2 MISSING)
  * L1: Modal transfer + alasan + audit trail, target POST transfer (check Registry §2 Modal Transfer P2)
    * L2: Pilih lokasi tujuan dan isi alasan lalu submit
      * L3: Tujuan kosong, sama dengan asal, atau alasan kosong → pesan inline + submit disabled
      * L4: Pilih tujuan valid dan lengkapi alasan, submit ulang
        * L5: status tombol → toast → lokasi terupdate + entri audit trail
      * L3: Lokasi tujuan dikunci atau penuh [ASUMSI] → pesan inline + tawarkan pilih ulang
      * L4: Ganti tujuan lalu submit
        * L5: status tombol → toast → lokasi terupdate

### Asset Registry: nonaktifkan aset destruktif
* L0: Klik Decommission sekali klik destruktif (check Registry §1 Decommission P1; pass2 §3.3)
  * L1: Dialog konfirmasi ketik + alasan wajib + toast hasil + rollback (check Registry §2 Konfirmasi P1; pola §02 + 2B)
    * L2: Ketik teks konfirmasi dan isi alasan lalu submit
      * L3: Teks salah atau alasan kosong → submit disabled + pesan inline
      * L4: Ketik ulang dan lengkapi alasan, submit
        * L5: status tombol → toast → status DECOMMISSIONED + aksi Undo rollback
      * L3: Server gagal saat menonaktifkan → ErrorToast + Trace, status tidak berubah
      * L4: Klik Retry atau Batalkan
        * L5: ErrorToast + Trace + Retry

### Asset Registry: buat work order dari aset
* L0: Klik Create WO di drawer (check Registry §1 Prefill WO P2; readiness M5+H1)
  * L1: Form /work-orders/new?asset=AST-HVAC-004 terisi otomatis (dependensi CANON: WO seal tunggal belum diputus)
    * L2: Tinjau prefill lalu submit WO
      * L3: Aset DECOMMISSIONED atau prefill basi → pesan inline + submit diblokir
      * L4: Pilih aset aktif atau muat ulang prefill
        * L5: FormField sukses hijau + lock → status tombol → toast → WO terbuat
      * L3: Submit gagal 500 → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: jadwalkan preventive maintenance
* L0: Klik Schedule PM di drawer (check Registry §1 Prefill PM P2; readiness M5)
  * L1: Form /preventive-maintenance/new?asset=AST-HVAC-004 terisi otomatis
    * L2: Pilih tanggal dan template lalu submit
      * L3: Tanggal lampau atau template kosong → pesan inline + submit disabled
      * L4: Perbaiki tanggal dan template, submit ulang
        * L5: FormField → status tombol → toast → jadwal PM terbuat
      * L3: Submit gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: export direktori async
* L0: Klik Export CSV/XLS (check Registry §2 Export P2; pola §03 + 2B)
  * L1: Job export async lalu unduh berkas (jobId + downloadUrl)
    * L2: Pilih format lalu jalankan export 1.842 baris
      * L3: Job antre atau berjalan lama → status job via polling; tautan unduh kedaluwarsa → pesan + minta ulang [ASUMSI polling job]
      * L4: Tunggu selesai atau jalankan ulang job
        * L5: polling + STALE → toast → berkas terunduh
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: buka model BIM 3D
* L0: Klik Open BIM 3D Model (check Registry §1 BIM P2; readiness M6)
  * L1: BIM viewer, tab vs route belum diputus (audit §3.2)
    * L2: Buka model aset terpilih
      * L3: Model tak cocok atau gagal dimuat → pesan + Retry, plus tautan Recalibrate bila MODEL MISMATCH [ASUMSI ikut facilities]
      * L4: Klik Retry atau pilih revisi model
        * L5: TableSkeleton → model tampil, atau ErrorToast menetap
      * L3: Tanpa aset terpilih → EmptyState + CTA pilih aset
      * L4: Pilih baris aset
        * L5: EmptyState → drawer terisi

### Asset Registry: lihat dan unggah dokumen teknis
* L0: Klik Preview, Download, atau Upload dokumen (check Registry §1 Dokumen P3; audit §3.4)
  * L1: Viewer + uploader (manual OEM Trane CVHE 18,4 MB, P&ID RevC, SOP LOTO; dependensi CANON OEM Trane vs Daikin)
    * L2: Pratinjau, unduh, atau unggah berkas
      * L3: Berkas melebihi batas atau format ditolak → pesan inline per baris + retry
      * L4: Pilih berkas valid lalu unggah ulang
        * L5: status tombol → toast → daftar dokumen terupdate
      * L3: Unduhan gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: cetak label QR
* L0: Klik Batch QR Print atau print tag QR #004 (check Registry §1 Print P3; readiness L3)
  * L1: Pratinjau cetak massal atau satuan
    * L2: Pilih aset lalu cetak
      * L3: Tanpa seleksi → EmptyState + CTA pilih aset
      * L4: Centang baris lalu cetak
        * L5: pratinjau cetak tampil → status tercetak [POLA-BARU: pratinjau cetak]
      * L3: Pratinjau gagal dirender → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 2. Asset Detail & Spare Parts Ledger

Konteks: AST-HVAC-004 versi Daikin (CANON vs Trane registry), dial 88% OPTIMAL Grade A- (CANON vs 68 dan 88,4), BOM 18 SKU, PART-SEAL-8821 DEFICIT par 4 net 0, PART-LUB-09 BELOW PAR, ledger 421 transaksi hash SHA-256 9e08fc, sub-tab IoT/PM/Docs tanpa isi, 3 gauge sampling 1 detik.

### Asset Detail: buka work order dari ledger
* L0: Klik #WO-2025-0812 di ledger pada 2 titik (check Detail §1 WO P1; readiness H1)
  * L1: Detail /work-orders/[id] (audit §3.1; dependensi CANON WO-2025-0812/WO-2025-0044 vs WO-2026-0894)
    * L2: Buka tautan sumber TXN-2025-88419 atau 88390
      * L3: ID tak dikenal atau arsip → EmptyState + CTA kembali ke ledger
      * L4: Kembali atau cari WO pengganti sesuai canon
        * L5: EmptyState → ledger tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: buka PO dan verifikasi 3-Way Match
* L0: Klik #PO-2025-0081 (check Detail §1 PO P2; readiness H3)
  * L1: Detail /purchasing/[id] + tab receiving/match + riwayat signature (edge 3-Way Match: PO vs GRN vs invoice)
    * L2: Buka tab 3-Way Match
      * L3: Kaki dokumen belum lengkap → status PARTIAL + pesan inline; selisih angka → MISMATCH + wajib Flag Discrepancy
      * L4: Lengkapi dokumen atau tandai selisih lalu cocokkan ulang
        * L5: status tombol → toast → status MATCHED
      * L3: Perhitungan match gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: buka dokumen transfer dan adjustment
* L0: Klik #TO-8891 (Sat-B) atau #ADJ-2024-Q4 (check Detail §1 transfer/adjustment P2; audit §3.3)
  * L1: Detail /inventory/transfers/[id] atau /inventory/adjustments/[id]
    * L2: Buka tautan sumber TXN-2025-86102 atau 84902
      * L3: Dokumen tak ditemukan → EmptyState + CTA kembali ke ledger
      * L4: Kembali ke ledger
        * L5: EmptyState → ledger tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: guardrail issue saat SKU defisit
* L0: Klik Issue to WO pada PART-SEAL-8821 par 4 net 0 (check Detail §2 Guardrail P1; dependensi CANON saldo seal dan harga $1.450 vs $1.420)
  * L1: Modal issue ke WO, target POST issue (audit §5)
    * L2: Isi qty dan WO tujuan lalu submit
      * L3: Stok net 0 atau qty melebihi available → blokir + peringatan + tawarkan + PR Request
      * L4: Kurangi qty atau buat PR Request lalu submit ulang
        * L5: status tombol → toast → saldo terupdate
      * L3: WO tujuan kosong atau tak valid → pesan inline + submit disabled
      * L4: Pilih WO valid lalu submit
        * L5: status tombol → toast → mutasi tercatat

### Asset Detail: replenishment dari baris BOM
* L0: Klik + PR Request pada PART-SEAL-8821 atau + Quick PO pada PART-LUB-09 (check Detail §2 PR/PO P2)
  * L1: Flow PR prefill SKU, qty, aset + approval, target POST purchase-requests (audit §5)
    * L2: Tinjau prefill lalu kirim PR atau PO cepat
      * L3: Qty kosong atau vendor belum dipilih [ASUMSI] → pesan inline + submit disabled
      * L4: Lengkapi lalu kirim ulang
        * L5: status tombol → toast → PR atau PO terbuat
      * L3: Gagal kirim → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: tambah SKU ke BOM
* L0: Klik + Add SKU to BOM (check Detail §2 Modal Add SKU P2; audit §3.5)
  * L1: Modal tambah SKU, target POST /api/v1/assets/:id/bom
    * L2: Isi SKU, par, bin lalu submit
      * L3: SKU duplikat, par kosong, atau bin tak dikenal → pesan inline + submit disabled
      * L4: Perbaiki lalu submit
        * L5: status tombol → toast → BOM terupdate
      * L3: SKU tak ada di master → EmptyState hasil + CTA ajukan SKU baru [ASUMSI]
      * L4: Ubah kata kunci atau ajukan SKU
        * L5: EmptyState + CTA

### Asset Detail: quick dispatch WO
* L0: Klik Quick Dispatch WO di toolbar (check Detail §1 Prefill Dispatch M5)
  * L1: Modal atau prefill /work-orders/new?asset=AST-HVAC-004 (audit §3.6)
    * L2: Tinjau prefill lalu submit WO
      * L3: Prioritas kosong atau ringkasan kosong → pesan inline + submit disabled
      * L4: Lengkapi lalu submit ulang
        * L5: FormField → status tombol → toast → WO terbuat
      * L3: Submit gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: catat inspeksi aset
* L0: Klik Log Inspection di toolbar (check Detail §1 Prefill Inspection M5)
  * L1: Form /field-inspections/new?asset=AST-HVAC-004 terisi otomatis
    * L2: Pilih template dan hasil lalu submit
      * L3: Template kosong → pesan inline + submit disabled
      * L4: Pilih template lalu submit ulang
        * L5: FormField → status tombol → toast → inspeksi tercatat
      * L3: Luring saat submit → OfflineBanner + Force Ping + draf antre
      * L4: Online kembali lalu kirim antrean
        * L5: OfflineBanner → toast → inspeksi tercatat

### Asset Detail: jelajah sub-tab dan filter timeline
* L0: Ganti sub-tab IoT Diagnostics, PM Schedules (12), Compliance & Docs (check Detail §1 sub-tab P2; audit §3.4)
  * L1: Konten ?tab=iot, ?tab=pm, ?tab=docs (tab vs route diputus saat rebuild; pass2 usul query)
    * L2: Buka tab dan ganti pill filter timeline All 54, WO 14, Inspections 28, Parts 8, Calibration 4
      * L3: Tab atau filter tanpa data → EmptyState + CTA terkait
      * L4: Kembali ke tab 360° atau tambah data
        * L5: EmptyState → konten tampil
      * L3: Telemetri basi → gauge STALE + badge CONNECTING pada sampling 1 detik
      * L4: Tunggu reconnect
        * L5: polling + STALE → gauge segar

### Asset Detail: ganti scope gudang
* L0: Ganti scope Central Distribution Hub vs Satellite Bin (check Detail §2 scope P3; dependensi CANON selisih saldo antar-scope)
  * L1: BOM ter-refresh per gudang + banner fallback (audit §1 State UI)
    * L2: Ganti scope gudang
      * L3: Scope gagal dimuat → fallback hub primer + banner
      * L4: Coba ulang scope
        * L5: ErrorToast + Retry → BOM scope tampil
      * L3: Saldo beda antar-scope (canon PART-LUB-09, PART-FLTR-401) → tampil apa adanya per warehouseId tanpa dirata-rata
      * L4: Lanjut dengan scope terpilih
        * L5: TableSkeleton → BOM per-scope tampil

### Asset Detail: unduh dossier dan salin tag
* L0: Klik Dossier, Load Full Historical Ledger, atau tombol copy tag (check Detail §1 Dossier+Export P3; §2 copy P3)
  * L1: Unduhan dossier PDF + export CSV atau stream 421 transaksi + hash SHA-256 (audit §5; code.html clipboard)
    * L2: Unduh dossier, stream ledger, atau salin AST-HVAC-004
      * L3: Clipboard ditolak → fallback prompt manual + toast
      * L4: Salin manual lalu tutup
        * L5: ErrorToast → toast → tag tersalin
      * L3: Export besar gagal di tengah → ErrorToast + tawaran lanjutkan atau retry [ASUMSI kelanjutan stream]
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 3. Facility Locations & Spatial Hierarchy

Konteks: satu-satunya interaksi nyata hx-get ke LOC-B2-MECH-204, Quick Selector kaskade 4 tingkat, denah CAD + simbol CHILLER #04 glow merah, WO-2026-0894 SLA Breach 42m, hasil TMPL-HVAC-CHL-02 3/4 passed, konflik label 8 AST vs 4 Linked vs Showing 4 of 8. Sistem A.

### Facilities: navigasi tree spasial
* L0: Klik node tree kampus, gedung, lantai, ruangan (check Facilities §3 tree TERDEFINISI; hx-get nyata)
  * L1: Detail ruangan ?locationId=LOC-B2-MECH-204 via JSON, pengganti fragment HTMX (check Facilities §1 Kontrak JSON P2; readiness G6)
    * L2: Pilih node #B-204, #B-201, atau #B-208
      * L3: Fetch gagal → pesan + Retry di container detail lokasi
      * L4: Klik Retry
        * L5: denah shimmer + TableSkeleton → detail tampil, atau ErrorToast menetap
      * L3: Ruangan tanpa aset → tabel kosong + CTA transfer masuk
      * L4: Transfer aset masuk atau pilih node lain
        * L5: EmptyState + CTA

### Facilities: quick selector kaskade
* L0: Klik Quick Selector (check Facilities §2 Selector P2; code.html toggle hidden; pola §02)
  * L1: Modal kaskade Campus-Building-Floor-Room + preview + Apply Filter Across Dashboard
    * L2: Pilih 4 tingkat lalu Apply
      * L3: Opsi anak gagal dimuat → select disabled + pesan inline; preview kosong → pesan
      * L4: Pilih ulang tingkat atas lalu Apply
        * L5: FormField guard → status tombol → toast → scope global terpasang
      * L3: Apply tanpa room terpilih → pesan inline + Apply disabled
      * L4: Pilih room lalu Apply
        * L5: FormField guard → status tombol → toast → scope global terpasang

### Facilities: dispatch audit ruangan
* L0: Klik Dispatch Room Audit (check Facilities §1 Prefill Audit P2; readiness M5)
  * L1: Prefill /field-inspections/new?locationId=LOC-B2-MECH-204
    * L2: Tinjau prefill lokasi lalu submit audit
      * L3: Template audit kosong → pesan inline + submit disabled
      * L4: Pilih template TMPL-HVAC-CHL-02 lalu submit ulang
        * L5: FormField → status tombol → toast → audit terbuat
      * L3: Submit gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: catat defect ruangan
* L0: Klik + Log Defect (check Facilities §1 Prefill Defect P2; readiness M5)
  * L1: Modal atau prefill /field-inspections/new?locationId=LOC-B2-MECH-204
    * L2: Isi aset, ringkasan defect, foto lalu submit
      * L3: Ringkasan kosong atau aset tak dipilih → pesan inline + submit disabled
      * L4: Lengkapi lalu submit ulang
        * L5: FormField → status tombol → toast → defect tercatat
      * L3: Unggah foto gagal → pesan inline + retry per berkas
      * L4: Pilih ulang berkas lalu unggah
        * L5: status tombol → toast → defect tercatat

### Facilities: buka work order ruangan
* L0: Klik kartu WO-2026-0894 P1 atau WO-2026-0881 P3 (check Facilities §1 WO P1; readiness H1)
  * L1: Detail /work-orders/[id] (dependensi CANON label WO-0894 di denah vs WO-2026-0894)
    * L2: Buka kartu SLA Breach 42m atau due besok 18:00
      * L3: Countdown kedaluwarsa saat dibuka → badge SLA BREACH + eskalasi [POLA-BARU: countdown SLA]
      * L4: Lanjut ke detail untuk percepat penanganan
        * L5: badge SLA BREACH tampil + countdown berhenti [POLA-BARU: countdown SLA]
      * L3: Detail gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: lihat hasil audit ruangan
* L0: Klik hasil TMPL-HVAC-CHL-02 3/4 passed + 1 defect (check Facilities §1 Hasil Audit P2)
  * L1: Detail /field-inspections/[id] atau drawer hasil
    * L2: Buka hasil audit
      * L3: Hasil belum final atau defect belum ditindaklanjuti → pesan + CTA buat defect
      * L4: Buat defect dari temuan
        * L5: EmptyState → defect tercatat
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: pindah aset antar-ruangan
* L0: Klik Reassign atau Transfer (check Facilities §1 Reassign P2; audit §2 MISSING)
  * L1: Modal transfer antar-ruangan + konfirmasi + audit trail, cth tujuan LOC-B2-208
    * L2: Pilih ruangan tujuan lalu konfirmasi
      * L3: Tujuan kosong atau sama dengan asal → pesan inline + submit disabled
      * L4: Pilih tujuan valid lalu konfirmasi ulang
        * L5: status tombol → toast → aset pindah + entri audit trail
      * L3: Ruangan tujuan penuh atau terkunci [ASUMSI] → pesan + tawarkan pilih ulang
      * L4: Ganti tujuan lalu konfirmasi
        * L5: status tombol → toast → aset pindah

### Facilities: tambah sub-lokasi
* L0: Klik + Add Sub-Location / Room (check Facilities §1 Add Sub P3; audit §2)
  * L1: Modal tambah node, target POST /api/v1/locations
    * L2: Isi nama, tipe, induk lalu submit
      * L3: Nama kosong atau induk tak dipilih → pesan inline per field + submit disabled
      * L4: Lengkapi lalu submit ulang
        * L5: FormField → status tombol → toast → node tampil di tree
      * L3: Kode node duplikat → pesan inline + tawarkan kode pengganti [ASUMSI]
      * L4: Ganti kode lalu submit
        * L5: status tombol → toast → node tampil di tree

### Facilities: klik simbol aset di denah
* L0: Klik simbol CHILLER #04 glow merah atau ganti layer, zoom, Heatmap (check Facilities §2 denah P3; audit §1.6)
  * L1: Detail /assets/AST-HVAC-004; view denah lokal state bukan navigasi
    * L2: Klik simbol kritis, toggle layer HVAC-Electrical-Fire, zoom, Heatmap
      * L3: Label singkat WO-0894 (CANON) → dinormalisasi ke WO-2026-0894 saat render
      * L4: Lanjut buka aset
        * L5: hover-reveal aksi → detail aset tampil
      * L3: Layer gagal dimuat → pesan + Retry; legenda tak sinkron → muat ulang layer [ASUMSI]
      * L4: Klik Retry atau pilih layer ulang
        * L5: ErrorToast + Retry → denah sinkron

### Facilities: export geospasial
* L0: Klik Export GeoJSON / BIM (check Facilities §1 Export P3; audit §2)
  * L1: Job export geospasial async lalu unduh
    * L2: Pilih format lalu jalankan export
      * L3: Job berjalan lama → status via polling; tautan kedaluwarsa → pesan + minta ulang [ASUMSI polling job]
      * L4: Tunggu atau jalankan ulang
        * L5: polling + STALE → toast → berkas terunduh
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: cetak badge dan kalibrasi spasial
* L0: Klik Print Badge QR, Edit Polygon, atau Recalibrate GIS (check Facilities §1 Print P3 dan Editor P3)
  * L1: Pratinjau badge QR LOC-B2-MECH-204
    * L2: Pratinjau lalu cetak badge
      * L3: Pratinjau gagal dirender → ErrorToast + Retry
      * L4: Klik Retry
        * L5: pratinjau cetak tampil → status tercetak [POLA-BARU: pratinjau cetak]
      * L3: Data ruangan basi → penanda STALE pada pratinjau
      * L4: Muat ulang data lalu cetak
        * L5: polling + STALE → pratinjau segar [POLA-BARU: pratinjau cetak]
  * L1: Editor geometri dan job rekalibrasi, build-vs-buy diputus dulu [ASUMSI] (check Facilities §1 Editor P3)
    * L2: Simpan poligon atau jalankan Recalibrate
      * L3: Konflik edit atau GIS mismatch → pesan + MODEL MISMATCH + tautan Recalibrate
      * L4: Muat ulang lalu simpan ulang
        * L5: ErrorToast + Retry → stempel MODEL MATCHED kembali
      * L3: Job rekalibrasi gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 4. Inventory — Spare Parts & Consumables Ledger

Konteks: 4.218 SKU FIFO, PART-SEAL-8821 CRITICAL 2 on-hand 1 reserved 1 available (CANON vs 1/1 net 0 di detail), PART-BRG-6205 (CANON vs 6204), Mutation Desk tab Transfer/Reconciliation dengan form preventDefault demo, approver Marcus Vance PIN Verified statis, contoh transfer unit terakhir Balance 0, feed hash sha256 d8a2. Sistem A.

### Inventory: posting mutasi idempoten
* L0: Klik Confirm & Post Mutation (check Inventory §2 Posting P2; pass2 Idempotency-Key)
  * L1: POST /api/v1/inventory/mutations + Idempotency-Key + optimistic update + rollback (pola 2B + trace)
    * L2: Konfirmasi transfer 1 ea PART-SEAL-8821 ke Substation Locker 4B
      * L3: Double-click atau retry jaringan → kunci idempoten cegah jurnal ganda; konflik kunci → pesan + muat saldo
      * L4: Tunggu hasil kunci yang sama atau muat ulang
        * L5: status tombol Posting → toast → saldo dan feed terupdate
      * L3: Server gagal → rollback optimistic + ErrorToast + Trace + form tetap terisi
      * L4: Klik Retry dengan kunci yang sama
        * L5: ErrorToast + Trace + Retry

### Inventory: guardrail unit terakhir SKU kritis
* L0: Transfer 1 ea terakhir PART-SEAL-8821 (Balance Post-Transfer 0) sementara WO-2026-0894 butuh seal sama (check Inventory §2 Guardrail P2; pass2 §7b.1; dependensi CANON saldo seal)
  * L1: Mutation Desk + guardrail SKU CRITICAL, blokir atau approval khusus saat available ke 0
    * L2: Set qty 1 sebesar seluruh available lalu submit
      * L3: Guardrail aktif → blokir atau minta approval khusus + pesan + tawarkan Draft PO
      * L4: Kurangi qty, selesaikan approval, atau buat Draft PO
        * L5: FormField guard → status tombol → toast → saldo terupdate
      * L3: Approval khusus ditolak → toast + form tetap terisi
      * L4: Batalkan atau ubah qty
        * L5: ErrorToast + form tetap terisi

### Inventory: verifikasi PIN approver
* L0: Persetujuan Marcus Vance ber-PIN statis (check Inventory §2 PIN P1; keamanan; pass2 §3.5)
  * L1: Flow PIN atau OTP nyata + kedaluwarsa + batas nilai tanpa approval
    * L2: Masukkan PIN lalu posting mutasi
      * L3: PIN salah atau kedaluwarsa → badge PIN Expired + verifikasi ulang + posting diblokir [POLA-BARU: pad PIN + kedaluwarsa]
      * L4: Verifikasi ulang lalu posting
        * L5: badge PIN Verified → status tombol → toast → mutasi tercatat [POLA-BARU: pad PIN + kedaluwarsa]
      * L3: Nilai di bawah ambang tanpa approval [ASUMSI ambang] → lewati PIN + catat otomatis
      * L4: Lanjut posting
        * L5: status tombol → toast → mutasi tercatat

### Inventory: validasi form mutation desk
* L0: Isi Mutation Desk qty, destinasi, WO (check Inventory §2 Validasi P2; pola §02)
  * L1: Form desk (qty ≤ available, destinasi ≠ sumber, WO wajib untuk issue)
    * L2: Isi qty, destinasi, WO lalu submit
      * L3: Qty melebihi available, destinasi sama dengan sumber, atau WO kosong untuk issue → error inline + tombol nonaktif
      * L4: Perbaiki lalu submit
        * L5: FormField → status tombol → toast → saldo terupdate
      * L3: Server menolak mutasi → ErrorToast + form tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: rekonsiliasi cycle count
* L0: Ganti tab Cycle Reconciliation plus-minus (check Inventory §2 Cycle P2; audit mode EXISTS)
  * L1: Form countedQty + alasan Cycle Count Variance menjadi ADJ-2026-0020
    * L2: Isi hasil hitung dan alasan lalu submit
      * L3: Selisih tanpa alasan → pesan inline + submit disabled
      * L4: Isi alasan lalu submit ulang
        * L5: FormField → status tombol → toast → ADJ terbuat
      * L3: Submit gagal → ErrorToast + form tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: terima stok GRN
* L0: Klik + Receive Stock PO/GRN (check Inventory §1 Receive P2; audit §3.2)
  * L1: Flow penerimaan PO-2026-0298 +100 pcs PART-FLTR-401 ke ledger (dependensi CANON bin CRIB-B Bay 01 vs SUB-LCK-4B Bay 01)
    * L2: Pilih PO, lines, bin lalu posting GRN
      * L3: PO atau bin kosong, qty tak cocok → pesan inline + submit disabled; bin beda canon → tampilkan bin apa adanya per warehouseId
      * L4: Lengkapi dan selaraskan bin lalu posting ulang
        * L5: FormField → status tombol → toast → stok bertambah
      * L3: Posting GRN gagal → ErrorToast + stok tidak berubah
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: buat draft PO dari baris kritis
* L0: Klik Draft PO pada baris kritis (check Inventory §1 Draft PO P2; readiness M5+H3)
  * L1: Prefill /purchasing/new?sku=PART-SEAL-8821
    * L2: Tinjau prefill SKU dan qty lalu kirim draft
      * L3: Qty kosong atau vendor kosong → pesan inline + submit disabled
      * L4: Lengkapi lalu kirim ulang
        * L5: FormField → status tombol → toast → draft PO terbuat
      * L3: Gagal kirim → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: buka detail SKU
* L0: Klik Details pada baris optimal (check Inventory §1 Detail SKU P2; audit §3.1)
  * L1: Detail /inventory/[sku] (kartu stok, riwayat mutasi, BOM linkage, vendor)
    * L2: Buka detail SKU
      * L3: SKU tak dikenal → EmptyState + CTA kembali ke katalog
      * L4: Kembali ke katalog
        * L5: EmptyState → katalog tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: buka referensi dari feed ledger
* L0: Klik referensi WO-2026-0894, PO-2026-0298, PM-PLN-0104, TRF-2026-0044, ADJ-2026-0019 (check Inventory §1 dokumen sumber P1/P2/P3; readiness H1+H3)
  * L1: Detail /work-orders/[id], /purchasing/[id], /preventive-maintenance/[id], /inventory/transfers/[id], /inventory/adjustments/[id] (dependensi CANON format PM-PLN-0104 vs PM-2025-0812)
    * L2: Klik referensi di feed
      * L3: Format ID tak dikenal (canon PM) atau dokumen arsip → EmptyState + CTA kembali ke feed
      * L4: Kembali ke feed
        * L5: EmptyState → feed tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: filter katalog dan feed ledger
* L0: Ganti search, warehouse, kategori, threshold, pagination, atau pill filter ledger (check Inventory §3 TERDEFINISI; audit query params dan ?txnType=)
  * L1: Katalog terfilter (?warehouseId=, ?category=, ?threshold=, ?q=, ?page=) + feed All 1.840, Receipts, WO Out, Adjust, Transfers + polling + hash
    * L2: Ketik SKU, pilih hub dan threshold, ganti pill, pindah halaman
      * L3: Tanpa hasil → EmptyState + Clear; sync gagal → badge Live Audit Bus merah + Retry Sync
      * L4: Klik Clear atau Retry Sync
        * L5: EmptyState → hasil tampil; polling + STALE → hash sha256 Synced kembali
      * L3: Polling basi → penanda STALE atau Syncing pada badge hash
      * L4: Tunggu polling berikutnya
        * L5: polling + STALE → feed segar

### Inventory: fokus baris ke desk, cetak, export
* L0: Klik Transfer/Issue pada baris, Print QR/Barcode, atau Export CSV/XLS (check Inventory §3 fokus EXISTS; §1 Print+Export P3; readiness L3)
  * L1: Fokus SKU di Mutation Desk inline + stepper sinkron (audit §2; pola §01)
    * L2: Klik Transfer/Issue pada PART-SEAL-8821
      * L3: Desk tanpa fokus → EmptyState pilih baris katalog
      * L4: Klik baris katalog
        * L5: EmptyState → banner fokus + stepper sinkron tampil
      * L3: Stepper melebihi available → diblokir + pesan ketersediaan
      * L4: Turunkan qty
        * L5: FormField → stepper valid
  * L1: Print view label rak/bin
    * L2: Pilih SKU lalu cetak label
      * L3: Pratinjau gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: pratinjau cetak tampil → label tercetak [POLA-BARU: pratinjau cetak]
  * L1: Job export katalog 4.218 SKU lalu unduh
    * L2: Jalankan export
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 5. Purchasing & POs Management Hub

Konteks: PR-2026-0314 darurat chiller $2.900 + WO-2026-0894 + aset CHILL-NUSA-04 (CANON vs AST-HVAC-004), envelope CUP Maintenance Capex Q1 sisa $64.200 SUFFICIENT, rantai 3 tier (2 SIGNED + VP PENDING limit $50.000), Authorize sekali klik simulasi EDI 1,2 dtk menjadi PO-2026-0315, Dock PO-2026-0298 100 PART-FLTR-401 MATCH menjadi GRN-9941 simulasi 1,4 dtk, btnCreatePR tanpa handler, P1 SLA 48m left. Artefak (bottom-nav, header mobile, Space Grotesk, tanpa aside) dilarang. Sistem A.

### Purchasing: otorisasi dan auto-dispatch PO
* L0: Klik Authorize & Auto-Dispatch PO $2.900 btnAuthorizePO (check Purchasing §2 Authorize P1; pass2 §7b.1; dependensi CANON CHILL-NUSA-04)
  * L1: Dialog konfirmasi ringkasan PR, vendor, amount, envelope $64.200 SUFFICIENT + Idempotency-Key sebelum EDI (pola §02 guard + 2B)
    * L2: Tinjau ringkasan lalu konfirmasi otorisasi VP
      * L3: Envelope di bawah $2.900 atau signature belum lengkap → Authorize nonaktif + peringatan over-budget
      * L4: Pilih envelope lain atau lengkapi tanda tangan [ASUMSI opsi envelope]
        * L5: FormField guard → status Transmitting EDI → toast → PO-2026-0315 DISPATCHED
      * L3: EDI gagal → toast + status PO tetap, tidak setengah-dispatch
      * L4: Klik Retry dengan kunci yang sama
        * L5: ErrorToast + Trace + Retry

### Purchasing: posting GRN dan sync ledger
* L0: Klik Post Goods Receipt & Sync Ledger btnPostGRN (check Purchasing §2 Post GRN P2; audit OK aksi)
  * L1: POST goods-receipts idempoten menjadi GRN-9941 + auto-post ledger, tetap di halaman (pola 2B)
    * L2: Konfirmasi expected 100 vs received 100 PART-FLTR-401 bin CRIB-B Bay 01 lalu posting
      * L3: Double post atau retry → kunci idempoten cegah GRN ganda; konflik → pesan + muat status
      * L4: Tunggu hasil kunci yang sama
        * L5: status Posting to Immutable Stock Ledger → toast → GRN-9941 POSTED + saldo terupdate
      * L3: Posting gagal → toast + PO tetap DISPATCHED + ledger tak berubah
      * L4: Klik Retry dengan kunci yang sama
        * L5: ErrorToast + Trace + Retry

### Purchasing: tangani selisih GRN
* L0: Klik Flag Discrepancy saat expected vs received tak sama (check Purchasing §1 Flag P2; guard mismatch P2; pola §02)
  * L1: Modal selisih GRN (retur, klaim, partial-accept) menjadi DISPUTED
    * L2: Catat selisih PART-FLTR-401 lalu pilih tindak lanjut
      * L3: Qty tak sama → status MISMATCH + wajib Flag Discrepancy sebelum posting
      * L4: Flag lalu pilih retur, klaim, atau partial-accept
        * L5: FormField → status tombol → toast → GRN DISPUTED + tindak lanjut tercatat
      * L3: Alasan kosong → pesan inline + submit disabled
      * L4: Isi alasan lalu submit ulang
        * L5: FormField → status tombol → toast → flag tercatat

### Purchasing: buat PR dan PO
* L0: Klik + Create Purchase Request/PO btnCreatePR tanpa handler (check Purchasing §1 Create P2; audit MISSING)
  * L1: Modal create + POST purchase-requests (SKU, qty, vendor, WO link, budget envelope)
    * L2: Isi SKU, qty, vendor, WO-2026-0894, envelope lalu submit
      * L3: Field tak valid → error inline + submit disabled beralasan
      * L4: Perbaiki lalu submit ulang
        * L5: FormField → status tombol → toast → PR terbuat
      * L3: Vendor tak dikenal → EmptyState hasil + CTA onboard vendor [ASUMSI rujuk vendors]
      * L4: Ubah kata kunci atau onboard vendor
        * L5: EmptyState + CTA

### Purchasing: verifikasi 3-Way Match
* L0: Ganti tab GRN atau 3-Way Match, audit PO-2026-0285 partial receipt (check Purchasing §1 tab P2; edge 3-Way Match)
  * L1: Konten ?tab=grn dan ?tab=match dibedakan dari tabel PR (pass2 §3.5)
    * L2: Buka tab match dan audit partial 1 of 2 Bay 04 backorder 2d
      * L3: Kaki belum lengkap → PARTIAL + pesan; selisih → MISMATCH + wajib Flag Discrepancy
      * L4: Lengkapi dokumen atau flag selisih
        * L5: status tombol → toast → status MATCHED atau DISPUTED
      * L3: Tab kosong → EmptyState + CTA buat PR
      * L4: Buat PR atau ganti tab
        * L5: EmptyState → konten tampil

### Purchasing: buka detail PR, PO, GRN, WO
* L0: Klik Review PR-2026-0314, Receive PO-2026-0298, View PO, Audit, Details PR-2026-0295 rejected, atau link WO-2026-0894 (check Purchasing §1 detail P1; readiness H1+H3)
  * L1: Detail /purchasing/[id] + tab review, receiving, match + riwayat signature (audit §3.1)
    * L2: Buka baris triase atau riwayat rejection read-only
      * L3: Dokumen tak dikenal atau workflow closed → EmptyState atau read-only + pesan
      * L4: Kembali ke triase
        * L5: EmptyState → triase tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry
  * L1: Detail /work-orders/[id] dari baris PR dan Sign-off Desk
    * L2: Klik link WO-2026-0894
      * L3: WO tak dikenal → EmptyState + CTA kembali
      * L4: Kembali ke hub
        * L5: EmptyState → hub tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Purchasing: tolak PR dengan justifikasi
* L0: Klik Reject Justification (check Purchasing §1 Reject P2; audit aksi MISSING)
  * L1: Modal alasan penolakan menjadi REJECTED (cth PR-2026-0295 exceeds cap)
    * L2: Isi alasan lalu tolak
      * L3: Alasan kosong → pesan inline + submit disabled
      * L4: Isi alasan lalu tolak ulang
        * L5: FormField → status tombol → toast → PR REJECTED
      * L3: Gagal menolak → ErrorToast + PR tetap PENDING
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Purchasing: minta penawaran OEM
* L0: Klik Request OEM Quotes (check Purchasing §1 RFQ P2; audit MISSING)
  * L1: Flow RFQ menjadi RFQ_SENT
    * L2: Pilih vendor OEM lalu kirim RFQ
      * L3: Tanpa vendor terpilih → pesan inline + kirim disabled
      * L4: Pilih vendor lalu kirim ulang
        * L5: FormField → status tombol → toast → RFQ_SENT
      * L3: Kirim gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Purchasing: filter triase dan countdown SLA
* L0: Ganti tab, search Ctrl+/ , Priority, Status, pagination; pantau P1 SLA 48m left (check Purchasing §3 TERDEFINISI; §2 countdown P3; poll 30 dtk)
  * L1: Daftar terfilter via query params (?tab=, ?q=, ?priority=, ?status=, ?page=) + countdown polling
    * L2: Ketik PR, filter P1, pindah halaman
      * L3: Tanpa hasil → EmptyState + CTA Create
      * L4: Reset filter atau buat PR
        * L5: EmptyState → hasil tampil
      * L3: Countdown habis → badge SLA BREACH + eskalasi [POLA-BARU: countdown SLA]
      * L4: Percepat approval dari Sign-off Desk
        * L5: badge SLA BREACH tampil + countdown berhenti [POLA-BARU: countdown SLA]

### Purchasing: export audit dan cetak batch PO
* L0: Klik Export CSV/Audit atau Print PO Batches (check Purchasing §1 Export+Print P3; readiness L3)
  * L1: Job export lalu unduh berkas
    * L2: Jalankan export tab aktif
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry
      * L3: Tanpa baris pada filter → EmptyState + ubah filter
      * L4: Ubah filter lalu export ulang
        * L5: EmptyState → berkas terunduh
  * L1: Layout cetak batch PO
    * L2: Pratinjau lalu cetak batch
      * L3: Pratinjau gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: pratinjau cetak tampil → batch tercetak [POLA-BARU: pratinjau cetak]

## 6. Vendors & Contractors Management Hub

Konteks: 42 vendor, fokus Trane VND-HVAC-0012 MSA-2024-TRN-09 (CANON 312d di baris vs 288d di kartu), ABB MSA-2023-ABB-02 RENEWAL DUE 28d, JCI 60D WINDOW, DUNS 00-132-9481, hotline 1-800-555-TRANE (dependensi CANON nomor +62 dan kontak Robert Langdon), teknisi Badge #TEC-884 RFID Active, kartu WO-2026-0894 ETA 35 dan PO-2026-0298 $4.800 cocok lintas layar, semua tombol dead click tanpa script. Artefak dilarang. Sistem A.

### Vendors: kunci dispatch saat MSA kedaluwarsa
* L0: Klik Dispatch Work Order pada vendor tanpa MSA aktif atau MSA kedaluwarsa (check Vendors §2 Kunci P1; audit banner merah + kunci)
  * L1: Prefill /work-orders/new?vendorId=… terkunci + banner merah (readiness M5)
    * L2: Coba dispatch pada vendor terkunci, cth ABB RENEWAL DUE 28d
      * L3: MSA kedaluwarsa atau banner No Active MSA → tombol terkunci + banner + arahan Amendment atau Renewal
      * L4: Ajukan amendment atau renewal lalu dispatch ulang
        * L5: FormField guard → status tombol → toast → WO ter-dispatch
      * L3: Tanpa teknisi cleared → toolchain dispatch dinonaktifkan + penjelasan
      * L4: Tambah teknisi cleared atau pilih vendor lain
        * L5: EmptyState + CTA

### Vendors: dispatch work order vendor aktif
* L0: Klik Dispatch Work Order pada Trane aktif (check Vendors §1 Prefill Dispatch P2; readiness M5)
  * L1: Prefill /work-orders/new?vendorId=VND-HVAC-0012 + teknisi cleared Badge #TEC-884 RFID Active
    * L2: Pilih teknisi lalu dispatch
      * L3: Teknisi tak cleared atau RFID nonaktif → pesan inline + dispatch disabled
      * L4: Pilih teknisi cleared lalu dispatch ulang
        * L5: FormField → status tombol → toast → WO ter-dispatch
      * L3: Dispatch gagal → toast + status teknisi tetap
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: buka detail vendor dan scorecard
* L0: Klik baris vendor, chevron, atau badge Active (check Vendors §1 Detail P2; readiness M1; kalibrasi HIGH vs MEDIUM diputus saat rebuild)
  * L1: Detail /vendors/[id], cth VND-HVAC-0012 + scorecard 98,4 Grade A+
    * L2: Buka vendor Trane
      * L3: Vendor tak dikenal → EmptyState + CTA Onboard
      * L4: Kembali ke direktori
        * L5: EmptyState → direktori tampil
      * L3: Scorecard gagal dimuat → skeleton + ErrorToast + Retry
      * L4: Klik Retry
        * L5: TableSkeleton → scorecard tampil, atau ErrorToast menetap

### Vendors: lihat PDF MSA tereksekusi
* L0: Klik View Executed PDF MSA-2024-TRN-09 (check Vendors §1 Detail P2)
  * L1: Document viewer MSA + tombol Initiate Amendment
    * L2: Buka PDF tereksekusi
      * L3: PDF gagal dimuat → pesan viewer + unduh langsung
      * L4: Klik unduh langsung atau Retry
        * L5: ErrorToast + Retry → dokumen tampil atau berkas terunduh
      * L3: Dokumen kedaluwarsa vs lifecycle (canon 312d vs 288d) → tampilkan daysLeft dari satu API tanpa diputus di sini
      * L4: Muat ulang dari sumber tunggal
        * L5: polling → sisa hari tampil konsisten

### Vendors: amandemen kontrak MSA
* L0: Klik Initiate Amendment (check Vendors §1 Amendment P2; audit §3.4)
  * L1: Flow amandemen MSA-2024-TRN-09 menjadi AMD-2026-0012 IN_REVIEW
    * L2: Isi termin dan nilai lalu ajukan
      * L3: Termin kosong atau nilai tak valid → pesan inline + submit disabled
      * L4: Perbaiki lalu ajukan ulang
        * L5: FormField → status tombol → toast → amendment IN_REVIEW
      * L3: Pengajuan gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: onboard vendor dan MSA baru
* L0: Klik + Onboard New Vendor/MSA (check Vendors §1 Onboarding P2; audit §3.4)
  * L1: Formulir multi-langkah data perusahaan, DUNS, sertifikasi, termin MSA + approval
    * L2: Isi tiap langkah lalu submit final
      * L3: DUNS 00-132-9481 tak valid, kontak kosong, atau domain salah → pesan inline per langkah + lanjut disabled
      * L4: Perbaiki langkah lalu lanjutkan
        * L5: FormField → status tombol → toast → vendor ONBOARDING
      * L3: Approval ditolak → toast + draf tetap tersimpan [ASUMSI draf tersimpan]
      * L4: Revisi lalu ajukan ulang
        * L5: ErrorToast + draf tetap terisi

### Vendors: pantau expiry ledger dan renewal
* L0: Klik Expiry Ledger 6 Expiring (check Vendors §1 Expiry P3; filter inline vs halaman diputus saat rebuild)
  * L1: Filter inline ?msaStatus=expiring + countdown renewal dari satu API (dependensi CANON 312d vs 288d berakhir via satu API)
    * L2: Filter expiring dan pantau RENEWAL DUE 28d, 60D WINDOW
      * L3: Countdown melewati ambang → badge RENEWAL DUE + Immediate Audit [POLA-BARU: countdown renewal]
      * L4: Ajukan renewal atau amendment
        * L5: badge renewal tampil + countdown berhenti [POLA-BARU: countdown renewal]
      * L3: Tanpa hasil pada filter → EmptyState + CTA Onboard
      * L4: Ubah filter
        * L5: EmptyState → hasil tampil

### Vendors: buka WO dan PO dari kartu dispatch
* L0: Klik kartu WO-2026-0894 ETA 35 mins atau PO-2026-0298 GRN RECEIVED $4.800 (check Vendors §1 dispatch P2; readiness H1+H3; konsisten lintas layar)
  * L1: Detail /work-orders/[id]
    * L2: Buka kartu WO dispatch
      * L3: WO tak dikenal → EmptyState + CTA kembali
      * L4: Kembali ke hub
        * L5: EmptyState → hub tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry
  * L1: Detail /purchasing/[id]
    * L2: Buka kartu PO dispatch
      * L3: PO tak dikenal → EmptyState + CTA kembali
      * L4: Kembali ke hub
        * L5: EmptyState → hub tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: aksi cepat vendor
* L0: Klik Direct Ring, Commendation, Export Compliance, print atau history (check Vendors §1 aksi P3; audit §2)
  * L1: Aksi tel:1-800-555-TRANE (dependensi CANON nomor +62) (audit TERDEFINISI aksi)
    * L2: Klik Direct Ring
      * L3: Hotline tak terjangkau → tombol disabled + pesan
      * L4: Coba lagi atau hubungi kontak cadangan [ASUMSI kontak cadangan]
        * L5: panggilan keluar atau status tak-terjangkau menetap [POLA-BARU: aksi tel]
  * L1: Aksi Commendation tanpa handler (audit MISSING)
    * L2: Beri apresiasi vendor
      * L3: Catatan kosong → pesan inline + kirim disabled [ASUMSI catatan]
      * L4: Isi catatan lalu kirim ulang
        * L5: status tombol → toast → apresiasi tercatat
  * L1: Dossier vendor, riwayat audit, job Export Compliance CSV/PDF (readiness L3)
    * L2: Unduh dossier atau jalankan export
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: filter direktori dan sync ERP
* L0: Ganti search, MSA Status, Risk, chip domain, pagination (check Vendors §3 TERDEFINISI; audit query params)
  * L1: Direktori terfilter (?q=Trane, ?msaStatus=, ?risk=, ?domain=, ?page=) + footer Auto-synced with Oracle ERP
    * L2: Ketik Trane, filter Active, pilih chip HVAC 12, pindah halaman
      * L3: Tanpa hasil → EmptyState + CTA Onboard
      * L4: Klik Onboard atau ubah filter
        * L5: EmptyState + CTA
      * L3: Sync Oracle ERP gagal → footer Sync Failed + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Retry → footer Synced kembali
# Pohon Interaksi — Batch Governance & Sistem (8 layar, sistem A)

> Cakupan HANYA 8 layar batch GOVERNANCE. 6 modul rute berpohon (maks 12 pohon/modul, unhappy maks 2/aksi) + 2 seksi catatan tanpa pohon (logo, pola state). Bahasa: Indonesia. NO CODE.
> Legenda rujukan tiap L0/L1: [EC]=`docs/exp-check/part-governance.md` (§modul+P prioritas); [A1]=`docs/ui-audit/<layar>.md` (§); [A2]=`docs/ui-audit/pass2/<layar>.md` (§); [CH]=fakta `code.html` (id/label/fungsi); [RD]=readiness §2(H/M/L)/§3.
> CANON (dependensi, bukan perbaikan diam-diam): [CANON-tenant] `APX-NUSA-01` (ops/audit/org/notif) vs `APX-GL-9021` (settings); [CANON-role] `6 Roles` (org) vs `8 Roles` (seed settings); [CANON-shift] Shift A `07:00–15:30 WIB` (kanonis notif) vs `06:00–22:00` (kartu ABAC org) vs work week `Mon–Sat 07:00–22:00` (settings); [CANON-zona] tampil lokal WIB, simpan UTC; [CANON-id] format `WO-2026-XXXX`/`PR-` vs `PO-` pisah requisition/order; [CANON-api] kontrak `v1` vs label proof bar `v2`.
> ANTI-ARTIFAK: sorot biru `screen.png` reports+notif pada `Audit Trail & Logs` = artefak screenshot (berlaku breadcrumb/H1); contoh pola `WO-9042`/`TECH-094`/`Rostova`/`AST-CHILLER-03` jangan direplikasi (pakai kanonis); avatar `googleusercontent` diganti Avatar internal; secret settings hanya termasker `apx_live_sec_••••b401` (nilai penuh tidak direplikasi, anggap bocor).
> L5 normatif = vocabulary `docs/ui-audit/ui-state-patterns.md` (EmptyState, FormField, OfflineBanner, ErrorToast, TableSkeleton, hover-reveal, focus-ring, kanban-elevated); di luar itu tandai [POLA-BARU].

### Operations Dashboard: Quick Create + dispatch inline + SLA/telemetri

* L0: Quick Create WO sukses [EC-P2 §Operations-2; A1-ops §2 modal POST /api/v1/work-orders; RD-M4] → * L1: modal Quick Create, tetap di halaman → * L2: isi facility+asset+priority+summary+assignee valid lalu submit → * L3: validasi lolos → * L4: WO dibuat, modal tutup, antrean bertambah → * L5: toast sukses + baris baru [POLA-BARU]
* L0: Quick Create WO invalid [EC-P2 §Operations-2; A1-ops §1 FormField+ErrorToast] → * L1: modal Quick Create → * L2: submit dengan field required kosong / assignee konflik alokasi → * L3: error merah + ikon per field, submit disabled + alasan → * L4: lengkapi field, pilih assignee bebas konflik → * L5: FormField (error/sukses-hijau + counter, submit aktif)
* L0: Dispatch Specialist baris breach [EC-P2 §Operations-2; A1-ops §2 POST dispatch; CH: WO-2024-0892; CANON-id] → * L1: baris P1-CRITICAL tabel dispatch queue → * L2: klik Dispatch Specialist → * L3: API sukses → * L4: status optimistis → DISPATCHED → * L5: badge status baru + toast sukses [POLA-BARU]
* L0: Dispatch/Reassign/Auto-Assign/Expedite gagal [EC-P2 §Operations-2; A1-ops §1 toast destruktif] → * L1: baris tabel dispatch queue → * L2: klik aksi inline saat API mati → * L3: API gagal → * L4: rollback baris ke status semula → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request + Copy Log)
* L0: Countdown SLA Clock basi [EC-P2 BARU §Operations-2; A1-ops §1 STALE; CH: -01:42:15 BREACH] → * L1: kolom SLA Clock tabel antrean → * L2: poll >60s tanpa refresh → * L3: waktu basi → * L4: tampilkan penanda STALE + poll ulang → * L5: TableSkeleton (meta polling + penanda STALE)
* L0: Banner telemetry degraded [EC-P2 §Operations-2; A1-ops §1 badge ingestion; CH: 99.98% Healthy 18ms] → * L1: badge telemetry header → * L2: ingestion gagal (badge hijau→merah, latency -) → * L3: status Telemetry Degraded → * L4: klik Retry/reconnect → * L5: OfflineBanner (status + Force Ping + counter antrean)
* L0: Filter rail tanpa hasil [EC-P3 §Operations-2; A1-ops §1 empty+Reset Filter; CH: Showing 4 of 42] → * L1: rail pill rentang + Facility + Shift + search + pagination → * L2: pilih kombinasi filter kosong → * L3: 0 work order cocok → * L4: klik Reset Filter → * L5: EmptyState (pesan + tombol Reset Filter)
* L0: Filter rail loading [EC-P3 §Operations-2; A1-ops §1 skeleton] → * L1: rail filter + tabel queue → * L2: ganti pill/dropdown/search/halaman (?timeRange=&facilityId=&shift=&page=) → * L3: fetch via query params → * L4: render skeleton 4–6 baris → * L5: TableSkeleton (baris animate-pulse + target container)
* L0: Ganti tab chart gagal [EC-P3 BARU §Operations-2; A1-ops §1 chart+Retry] → * L1: kartu Facility Downtime & Operational Cost Trend (Cost vs Budget/Downtime/Energy) → * L2: klik tab saat fetch gagal → * L3: chart error (tanpa data → sumbu + pesan bila kosong) → * L4: klik Retry tab → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: Export Executive Report async [A1-ops §2 job dossier; RD terkait /reports] → * L1: cluster aksi header → * L2: klik Export Executive Report (PDF/XLSX) → * L3: job RPT-* QUEUED→READY → * L4: unduh dossier gabungan → * L5: file terunduh + toast sukses [POLA-BARU]
* L0: Klik baris/WO Code ke detail [EC-P1 §Operations-1/H1; A1-ops §3 HIGH; RD-H1; CANON-id] → * L1: baris tabel dispatch queue → * L2: klik WO Code antrean → * L3: target TAK TERDEFINISI (dead-end) → * L4: bangun /work-orders/[id] [ASUMSI] → * L5: halaman detail WO terbuka [POLA-BARU]
* L0: Command palette global ⌘K [EC-P2/M4 §Operations-1; RD-M4; TAK TERDEFINISI di 15 halaman] → * L1: tombol + New Dispatch / Request header global → * L2: tekan ⌘K / klik tombol → * L3: palette lintas entitas WO/AST/SKU/PO [ASUMSI desain palette] → * L4: pilih aksi/entitas → modal kontekstual atau navigasi → * L5: palette + tujuan aksi [POLA-BARU]

### Reports & Analytics Hub: ekspor async + simulasi OLAP + jadwal dossier

* L0: Export PDF/XLSX per baris sukses [EC-P3 §Reports-2; A1-reports §2 aksi per baris; A2-reports §1 RPT-OPEX-2026-M05] → * L1: tabel Standard Operational Reports & Dossiers → * L2: klik PDF/XLSX pada baris dossier → * L3: job EXP-* QUEUED→READY → * L4: unduh file → * L5: file terunduh + toast sukses [POLA-BARU]
* L0: Export per baris gagal [EC-P3 §Reports-2; A1-reports §1 FAILED+Retry] → * L1: baris tabel dossier → * L2: klik export saat worker gagal → * L3: job FAILED → * L4: klik Retry job → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: Export Full PDF Dossier + timing simulasi [EC §Reports-3 TERDEFINISI; A1-reports §1; A2-reports §1 timing 1200ms→Ready→restore 2500ms; CH: Compiling OLAP Dossier...] → * L1: cluster aksi global hub → * L2: klik Export Full PDF Dossier → * L3: spinner Compiling OLAP Dossier... → * L4: status Dossier Ready (PDF) → unduh → * L5: dossier gabungan terunduh [POLA-BARU]
* L0: Run Simulation / Live Preview sukses [A1-reports §2 #query-preview-result; A2-reports §1 46ms·412 Records; CH: 46ms + 412 Records] → * L1: panel Custom Query & Report Builder (OLAP CUBE, Est ~84ms) → * L2: klik Run Simulation dengan builder valid → * L3: SQL telemetry_mart dieksekusi → * L4: tampilkan preview inline + elapsed + records → * L5: panel hasil preview + statement SQL [POLA-BARU]
* L0: Preview 0 records [EC-P2 §Reports-2; A1-reports §1 longgarkan filter] → * L1: area #query-preview-result → * L2: simulasi dengan filter terlalu sempit → * L3: 0 records → * L4: longgarkan filter sesuai saran → * L5: EmptyState (SQL + 0 records + saran)
* L0: Validasi query builder [EC-P2 §Reports-2; A1-reports §4 zod+react-hook-form] → * L1: form builder 4 langkah (temporal/facility/dimensi/metrik) → * L2: submit rentang invalid / 0 metrik dipilih → * L3: error per field + estimasi ditahan → * L4: perbaiki rentang + pilih ≥1 metrik + format output → * L5: FormField (valid, status Ready Est ~84ms)
* L0: Generate & Download Dossier [A1-reports §2 POST query/generate async] → * L1: footer panel builder → * L2: klik Generate & Download Dossier → * L3: job RPT-* QUEUED→READY → * L4: unduh dossier kustom → * L5: file dossier terunduh [POLA-BARU]
* L0: Badge replika basi [EC-P2 §Reports-2; A1-reports §1 REPLICA LAG; CH: READ REPLICA: SYNCED] → * L1: badge REPLICA header hub → * L2: sync analitik basi → * L3: badge REPLICA LAG/STALE → * L4: tunggu re-sync / poll status replika → * L5: OfflineBanner (status basi + penanda sinkronisasi)
* L0: Filter klasifikasi dossier kosong [EC-P3 §Reports-2; A1-reports §1 Build Custom Query] → * L1: filter klasifikasi tabel dossier → * L2: pilih klasifikasi tanpa dossier → * L3: 0 dossier → * L4: klik Reset / Build Custom Query → * L5: EmptyState (pesan + CTA)
* L0: Preview dossier ke detail [EC-P2 §Reports-1 TAK TERDEFINISI; A1-reports §3; RD-§3 report-dossier.html] → * L1: tombol Preview visibility per baris → * L2: klik Preview RPT-* → * L3: target diputuskan: drawer preview PDF [ASUMSI; alternatif /reports/[id]] → * L4: tampilkan parameter + riwayat generasi + daftar ekspor → * L5: pratinjau dossier terbuka [POLA-BARU]
* L0: Schedule Automated Dispatch [EC-P2 §Reports-1; A1-reports §3 drawer ReportScheduleEditor; RD-§3] → * L1: tombol Schedule Automated Dispatch → * L2: klik tombol → * L3: drawer cron+penerima+format+zona waktu [ASUMSI; CANON-zona] → * L4: simpan jadwal kirim dossier → * L5: jadwal tersimpan + toast [POLA-BARU]
* L0: Drawer filter dimensi alokasi [EC-P3 BARU §Reports-1; A1-reports §2 tombol tune] → * L1: panel Category Cost Allocation → * L2: klik tune → * L3: drawer dimensi alokasi [ASUMSI] → * L4: terapkan dimensi → meter tersegmentasi dihitung ulang → * L5: panel alokasi terfilter [POLA-BARU]

### Audit Trail & System Logs Hub: filter 7396 halaman + verifikasi Merkle + retensi

* L0: Filter audit tanpa hasil [EC §Audit-3; A1-audit §1 Reset; CH: APX-NUSA-01; CANON-tenant] → * L1: toolbar search ⌘/ + Entity/Action/Principal + Quick Scope pills → * L2: ketik hash/entity/user/IP tanpa hasil → * L3: 0 event cocok → * L4: klik Reset filter → * L5: EmptyState (pesan longgarkan filter + Reset)
* L0: Pagination 7396 halaman [A1-audit §1 Showing 1-6 of 184,920 rows 25/50/100; A2-audit §1 7396; CH: 7396] → * L1: footer Live Activity Stream (?scope=&entity=&page=) → * L2: pindah halaman / ganti rows-per-page → * L3: fetch halaman (keepPreviousData) → * L4: render 6 baris skeleton saat fetch → * L5: TableSkeleton (skeleton feed + meta polling 5s)
* L0: Seleksi baris ke inspector [EC-P2 BARU §Audit-2; A2-audit §1 highlightRow/switchView per eventId] → * L1: feed 6 event kronologis → * L2: klik baris APPROVE PR-2026-0314 [CANON pr-po; CANON-api label v2] → * L3: fetch detail per eventId → * L4: tampilkan diff 4 field + envelope sesi RFID-4180 + proof Merkle → * L5: inspector terisi penuh [POLA-BARU]
* L0: Verify Cryptographic Root sukses [A1-audit §2 POST verify-root; CH: Verify Cryptographic Root; Block #892,104] → * L1: cluster aksi + widget Merkle Forest Root Status → * L2: klik Verify Cryptographic Root → * L3: verifikasi valid → * L4: tampilkan root hash + block height + waktu di widget → * L5: hasil verifikasi inline SYNCED [POLA-BARU]
* L0: Verify gagal HASH MISMATCH [EC-P1 §Audit-2; A1-audit §1 banner merah] → * L1: widget Merkle + tombol verify → * L2: klik verify saat rantai rusak → * L3: HASH MISMATCH + blok terdampak → * L4: blokir aksi dependen + tandai blok → * L5: ErrorToast (banner HASH MISMATCH + blok terdampak + Copy Log)
* L0: Copy Full Hash gagal [EC-P2 BARU §Audit-2; A2-audit §1 clipboard.writeText] → * L1: proof bar inspector (hash + HTMX POST endorse) → * L2: klik Copy Full Hash saat clipboard ditolak → * L3: clipboard gagal → * L4: tampilkan fallback textarea selektabel → * L5: focus-ring (textarea terpilih siap salin manual)
* L0: Rollback Simulation dry-run [EC-P2 BARU §Audit-1; A1-audit §3 modal; TAK TERDEFINISI] → * L1: footer inspector (Download Signed Proof / Rollback Simulation / Flag Review) → * L2: klik Rollback Simulation → * L3: modal dampak + dry-run diff + konfirmasi read-only [ASUMSI isi modal] → * L4: tutup tanpa mutasi ledger → * L5: hasil simulasi read-only [POLA-BARU]
* L0: Flag Review gagal [EC-P3 §Audit-2; A1-audit §2 POST flag + toast] → * L1: aksi Flag Review destruktif inspector → * L2: klik Flag saat API gagal → * L3: flag/export gagal → * L4: ulangi flag / retry export → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: Export CSV/JSON + Compliance PDF [A1-audit §2 export async sesuai filter] → * L1: cluster Export CSV / JSON Log + Compliance PDF Report → * L2: klik export dengan filter aktif → * L3: job AUD-EXP-* QUEUED→READY → * L4: unduh file sesuai filter → * L5: file log terunduh [POLA-BARU]
* L0: Polling 5s STALE + Force Refetch [EC-P2 §Audit-2; A1-audit §1 STALE + Force Refetch] → * L1: header feed (Live HTMX Polling 5s + Force Refetch) → * L2: stream terputus / checkbox polling off → * L3: badge STALE → * L4: klik Force Refetch → * L5: OfflineBanner (status putus + aksi refetch)
* L0: Klik entity WO/PR tanpa tujuan [EC-P1 §Audit-1/H1/H3; A1-audit §3; RD-H1/H3; CANON pr-po] → * L1: entity mono baris feed WO-2026-0894 / PR-2026-0314 → * L2: klik entity (AST-*/PART-*/RBAC:* EXISTS, WO/PR MISSING) → * L3: target TAK TERDEFINISI → * L4: bangun /work-orders/[id] + /purchasing/[id] tab 3-Way Match [ASUMSI] → * L5: halaman detail entity terbuka [POLA-BARU]
* L0: Ekspor log terjadwal + retensi [EC-P3 BARU §Audit-1; bandingkan scheduler reports; TAK TERDEFINISI] → * L1: aksi export ad-hoc existing → * L2: atur jadwal ekspor berkala + periode retensi [ASUMSI cron + retensi] → * L3: jadwal valid → * L4: simpan job ekspor terjadwal → * L5: jadwal arsip log aktif [POLA-BARU]

### Notifications & SLA Alerts Hub: ack + otorisasi PO + revoke sesi + eskalasi

* L0: Mark All Read sukses [EC-P2 BARU §Notifications-2; A2-notif §1 markAllRead KPI→0 + opacity-75; CH: markAllRead] → * L1: header hub (Mark All Read + Quiet Hours + Export) → * L2: klik Mark All Read → * L3: PATCH massal sukses → * L4: KPI unread → 0, kartu opacity-75 → * L5: feed terbaca semua [POLA-BARU]
* L0: Mark All Read gagal [EC-P2 BARU §Notifications-2; A2-notif §7b rollback] → * L1: header hub → * L2: klik Mark All Read saat API gagal → * L3: PATCH gagal → * L4: kembalikan count 38 + status kartu → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: One-Click Authorize PO + konfirmasi [EC-P1 §Notifications-1; RD-L2 dialog+idempotency; A2-notif §3 item5; CH: One-Click Authorize PO $2,900 PR-2026-0314; CANON pr-po] → * L1: kartu PO APPROVAL REQUIRED (3-Way Match Verified) → * L2: klik One-Click Authorize PO → * L3: AlertDialog konfirmasi + idempotency key (wajib; sekali-klik dilarang) → * L4: setuju → POST otorisasi → label Authorized + jejak audit → * L5: PO terotorisasi + kartu terupdate [POLA-BARU]
* L0: Authorize/revoke gagal [EC-P1 §Notifications-2; A1-notif §1 kartu tetap unread] → * L1: kartu approval / security → * L2: konfirmasi disetujui saat POST gagal → * L3: otorisasi/revoke gagal → * L4: kartu tetap unread + tawarkan retry idempoten → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: Revoke Active Session + konfirmasi [EC-P1 §Notifications-1; RD-L2; A1-notif §3 risiko sekali-klik; CH: Revoke Active Session AUDIT-EVT-9042] → * L1: kartu SECURITY POLICY OVERRIDE (David Chen, HVC-ENG-02, 90 mnt) → * L2: klik Revoke Active Session → * L3: dialog konfirmasi destruktif (wajib) → * L4: setuju → DELETE sesi + jejak audit → * L5: sesi dicabut + kartu terupdate [POLA-BARU]
* L0: Eskalasi SLA sukses [A1-notif §2 Escalate/Dispatch Backup inline] → * L1: kartu CRITICAL SLA AT RISK WO-2026-0894 (42m remaining, 18.4 ppm AST-HVAC-004) → * L2: klik Escalate to Eng Mgr / Dispatch Backup Tech → * L3: API sukses → * L4: tandai tereskalasi + catat jejak → * L5: status eskalasi terkirim [POLA-BARU]
* L0: Countdown auto-escalation basi [EC-P2 BARU §Notifications-2; A1-notif §1 Auto-escalation in 08:34] → * L1: timer kartu kritis → * L2: timer basi tanpa update → * L3: tampilkan STALE di samping countdown → * L4: refetch status eskalasi → * L5: TableSkeleton (meta polling + penanda STALE)
* L0: View Work Order tanpa tujuan [EC-P1 §Notifications-1; A1-notif §3 HIGH; RD-H1] → * L1: CTA primer kartu kritis View Work Order → * L2: klik View Work Order WO-2026-0894 → * L3: target TAK TERDEFINISI (triase→eksekusi terputus) → * L4: bangun /work-orders/[id] [ASUMSI] → * L5: detail WO terbuka [POLA-BARU]
* L0: Review 3-Way Match tanpa tujuan [EC-P1 §Notifications-1; RD-H3; CANON pr-po] → * L1: aksi Review 3-Way Match kartu approval → * L2: klik Review → * L3: target TAK TERDEFINISI → * L4: bangun /purchasing/[id] tab match [ASUMSI] → * L5: tab 3-Way Match terbuka [POLA-BARU]
* L0: Toggle kanal gagal [EC-P2 §Notifications-2; A1-notif §1 optimistis+rollback; P1 terkunci] → * L1: matriks routing Matrix v4 + rule engine eskalasi [CANON-zona Quiet Hours vs Shift Auto-Mute; CANON-shift] → * L2: ubah toggle saat PUT gagal → * L3: preferensi gagal tersimpan → * L4: kembalikan toggle + tampilkan error → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: WebSocket bus putus [EC-P2 §Notifications-2; A1-notif §1 WS-PUSH 12ms → Disconnected] → * L1: debugger Active Bus rail kanan → * L2: bus mati → * L3: status Disconnected + jeda inject sintetis → * L4: klik Reconnect → * L5: OfflineBanner (Disconnected + Reconnect)
* L0: Tab/search/severity tanpa hasil [EC-P3 §Notifications-2; A2-notif §1 display:none tanpa pesan; CH: alert-search-input Ctrl+/] → * L1: pills 38/8/12/6/5/7 + live search + severity → * L2: ketik kata kunci tanpa hasil (?category=&q=&severity=) → * L3: semua kartu tersembunyi tanpa pesan → * L4: tampilkan pesan + Reset → * L5: EmptyState (pesan + Reset Filter)

### Organization RBAC Hub: deactivate dialog + revoke sesi + login/MFA

* L0: Deactivate User via dialog [EC-P1 §Organization-1; RD-L2; A2-org §1 confirmDeactivation→confirm() native wajib diganti] → * L1: panel Account Diagnostics (Focused User Marcus Kowalski RFID-9021, 2 WO aktif) → * L2: klik Deactivate → isi alasan + tanggal efektif + alihkan WO-2026-0894 + terminasi sesi (ketik nama bila direktur ke atas) → * L3: konfirmasi valid → * L4: suspend + terminasi sesi telemetry + jejak audit → * L5: status SUSPENDED + toast [POLA-BARU]
* L0: Deactivate gagal [EC-P1 §Organization-2; A2-org §1 user tetap aktif + toast] → * L1: dialog deaktivasi → * L2: konfirmasi saat API gagal → * L3: suspend gagal → * L4: user tetap aktif + tawarkan retry → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: Revoke sesi via profil [EC-P2 §Organization-1 profil /organization/users/[id] + revoke; dirujuk notif hub] → * L1: profil user (riwayat login, sesi, WO aktif, sertifikasi) [ASUMSI halaman profil] → * L2: klik Revoke pada sesi aktif → dialog konfirmasi → * L3: konfirmasi valid → * L4: DELETE sesi + jejak audit → * L5: sesi dicabut + daftar sesi terupdate [POLA-BARU]
* L0: Provision via SCIM sukses [EC-P2 §Organization-2; A1-org §2 modal inviteModal POST SCIM] → * L1: modal Provision Enterprise User (nama/email/role/crew/RFID) → * L2: isi valid → submit Provision via SCIM → * L3: SCIM QUEUED → * L4: tambah user ke roster + sync Okta → * L5: user terprovision + toast [POLA-BARU]
* L0: Provision SCIM gagal [EC-P2 §Organization-2; A1-org §1 modal tetap terbuka + error per field] → * L1: modal invite tetap terbuka → * L2: submit nama kosong / email non-domain / badge duplikat → * L3: error per field → * L4: perbaiki field → * L5: FormField (error merah + ikon, sukses hijau)
* L0: Deploy matriks sukses [EC-P2 §Organization-2; A1-org §2 15 modul × 6 kapabilitas + dirty flag] → * L1: tab role Senior Field Tech + tabel matriks (?role=) → * L2: ubah checkbox → Deploy Rule(s) → * L3: PUT sukses → * L4: baseline baru + toast + simulator terhitung ulang (cap $500) → * L5: rules terdeploy [POLA-BARU]
* L0: Deploy matriks gagal [EC-P2 §Organization-2; A1-org §1 rollback optimistis] → * L1: matriks draft (dirty flag) → * L2: klik Deploy saat PUT gagal → * L3: deploy gagal → * L4: kembali ke baseline + Discard → * L5: ErrorToast (Trace #ERR-xxxx + Retry Request)
* L0: Audit Impersonate read-only [EC-P2 §Organization-1; RD-L2; A1-org §3 banner sesi + admin AS user] → * L1: tombol Audit Impersonate panel diagnostik → * L2: klik impersonate → * L3: sesi read-only + banner persisten + jejak audit + tombol keluar [ASUMSI komposisi banner] → * L4: akhiri via tombol keluar → * L5: banner sesi impersonasi aktif [POLA-BARU]
* L0: Filter roster tanpa hasil [EC-P2 §Organization-2; A2-org §1 filterUsers 4 dimensi + badge 6 Displayed; CH: Ctrl+/] → * L1: search + select Team/Role/Status → * L2: ketik kombinasi tanpa personel cocok → * L3: 0 Displayed → * L4: klik reset filter → * L5: EmptyState (pesan + saran reset)
* L0: Login + SSO callback + enroll MFA [EC-P2 §Organization-1; RD-M3; A1-org §3 prasyarat prod; CANON: IdP Okta SAML, MFA FIDO2 enforced 100%, timeout 30/120 mnt, SCIM <50ms] → * L1: route (auth)/login + callback SSO + enroll FIDO2 (belum ada di mockup) → * L2: login valid + enroll kunci lolos → * L3: sesi terbit per tenant [CANON-tenant] → * L4: redirect ke /operations → * L5: sesi terautentikasi + MFA terdaftar [POLA-BARU]
* L0: Login/MFA gagal [EC-P2 §Organization-1; RD-M3] → * L1: form login / enroll MFA → * L2: kredensial salah / verifikasi FIDO2 gagal → * L3: error + percobaan dibatasi → * L4: ulangi dengan kredensial valid → * L5: FormField (error merah + guard submit)
* L0: Clone Policy as New Role [EC-P3 §Organization-2; A1-org §2 footer simulator] → * L1: footer Effective Access Simulator (cap $500, geofence, shift [CANON-shift]) → * L2: klik Clone Policy as New Role → * L3: draft role baru valid → * L4: tambah ke list role → * L5: draft role di list [POLA-BARU]

### Settings System Configuration: maint mode + rotate key + aksi destruktif + retensi

* L0: Maintenance Mode ON [EC-P1 BARU §Settings-2; A2-settings §1 maintToggle OFFLINE(ARMED)→ONLINE(ACTIVE LOCK); CH: maintToggle] → * L1: switch Maint Mode meta bar (ENV PROD) → * L2: toggle ON → dialog dampak env PROD [ASUMSI isi dialog] → * L3: konfirmasi + audit otomatis ke /audit-logs → * L4: kunci env + tampilkan banner maint → * L5: banner maint aktif + jejak audit [POLA-BARU]
* L0: Save System Parameters sukses [EC-P2 §Settings-2; A2-settings §1 simulasi 600ms → banner 4000ms; CH: TX-904128·14ms] → * L1: tombol Save System Parameters + banner saveFeedback → * L2: klik Save dengan form valid → * L3: PUT sukses → * L4: tampilkan banner TX-904128 · 14ms → * L5: banner sukses persist KV-store + 3 node [POLA-BARU]
* L0: Save gagal + Retry [EC-P2 §Settings-2; A1-settings §1 banner merah, nilai form tidak hilang] → * L1: banner saveFeedback → * L2: klik Save saat PUT gagal → * L3: banner merah + tombol Retry → * L4: klik Retry (nilai form utuh) → * L5: ErrorToast (banner gagal + Retry)
* L0: Rotate API credential + last4 [EC-P1/P2 §Settings-1; A2-settings §3 KRITIS secret; CH: last4 b401; CANON b401 vs bb401; masker apx_live_sec_••••b401] → * L1: kartu Internal Field Scanner Key (ACTIVE, 182d, scopes write/read/ingest) → * L2: klik Rotate → dialog konfirmasi → * L3: rotasi valid, secret lama dianggap bocor → * L4: tampilkan secret baru sekali saja, klien simpan last4 → * L5: kredensial baru sekali-tampil + last4 [POLA-BARU]
* L0: Issue/Reveal sekali-tampil [EC-P2 §Settings-1; A1-settings §5 secret sekali-tampil] → * L1: tombol Issue New API Credential / Reveal → * L2: klik Issue → dialog → * L3: penerbitan valid → * L4: salin secret sekali-tampil (tak pernah render penuh lagi) → * L5: secret sekali-tampil + metadata last4 [POLA-BARU]
* L0: Aksi destruktif + audit [EC-P1 §Settings-1; RD-§3; A2-settings §3 HIGH ketik konfirmasi] → * L1: Reset Counters / Purge Test Transactions (>30d) / Flush Ingest Buffer → * L2: klik aksi → dialog ketik konfirmasi → * L3: konfirmasi + jejak audit otomatis → * L4: eksekusi purge/reset/flush → * L5: hasil aksi + entri /audit-logs [POLA-BARU]
* L0: Test Connection/Ping gagal [EC-P2 §Settings-2; A1-settings §1 badge DEGRADED + detail] → * L1: kartu SCADA/Email/ERP + baris webhook (68/114/92ms) → * L2: klik Test Connection / Ping / Send Test Email saat endpoint mati → * L3: badge DEGRADED + detail error → * L4: perbaiki endpoint via drawer → uji ulang → * L5: ErrorToast (status DEGRADED + detail error + Retry)
* L0: Snapshot ad-hoc [A1-settings §2 POST snapshot → baris baru] → * L1: kartu backup SOC2 + tabel 3 snapshot → * L2: klik Create Ad-hoc Snapshot Now → * L3: job snapshot QUEUED→selesai → * L4: tambah baris snapshot Verified → * L5: baris snapshot baru [POLA-BARU]
* L0: Restore simulation + retensi arsip [EC-P2 §Settings-1 viewer RPO/RTO/checksum/dry-run; CH: Restore Simulation; retensi 30-day Lock Glacier Deep] → * L1: aksi Trigger Restore Simulation + strip jadwal backup → * L2: klik Trigger → * L3: dry-run selesai → * L4: tampilkan viewer RPO/RTO + checksum + diff (arsip ikut retensi lock) → * L5: hasil simulasi restore [POLA-BARU]
* L0: Tab lazy-fetch loading [EC-P3 §Settings-2; A1-settings §1 skeleton per tab; ?tab=] → * L1: nav 5 tab (general/data/integrations/localization/security) → * L2: pindah tab (deep-link ?tab=data) → * L3: fetch tab aktif saja → * L4: render skeleton kartu/tabel → * L5: TableSkeleton (skeleton per tab aktif)
* L0: List kosong webhook/snapshot/kunci [EC-P3 §Settings-2; A1-settings §1 CTA register/create/issue] → * L1: tabel webhook / snapshot / kunci API → * L2: buka tab dengan list kosong → * L3: 0 baris → * L4: klik Register New Webhook / Create Snapshot / Issue Credential → * L5: EmptyState (pesan + CTA)
* L0: Drawer editor konfigurasi [EC-P2 §Settings-1; RD-§3 Sheet+zod; Configure ×5 + endpoints + webhook] → * L1: tombol Configure/Edit/Register → * L2: buka drawer → isi pola sekuens/endpoint/URL https → * L3: validasi zod (regex prefix/mask, https) → * L4: simpan → preview WO-2026-0894 dkk [CANON-id] → * L5: FormField (validasi pola + preview kanonis)

### Catatan — Apex Ops Logo (BUKAN route, tanpa pohon)

* Logo = master aset SVG netral A/B (`viewBox 160×40`: tile `#1E40AF` + apex `#60A5FA` + node putih + baseline `#93C5FD` + `APEX #0F172A`/`OPS #2563EB` + tagline `#64748B`); klik logo di shell → `/`; butuh komponen tunggal `Logo` + varian `logo-white.svg`/`mark.svg`/`favicon` (duplikasi markup per hub diganti komponen; `alt`/aria + fallback `AO`).

### Lampiran — Daftar pola terminal L5 (normatif dari ui-state-patterns, dipakai validasi batch lain)

* `EmptyState` (§01: clean queue SLA RISK 0.0% + stok nominal 1.420 SKU; pesan + Reset/CTA) → dipakai L5: filter/daftar kosong (ops T7, reports R5/R9, audit A1, notif N12, org O9, settings S11).
* `FormField` (§02: error merah+ikon, sukses hijau+lock SCADA, submit disabled+alasan, counter 38/250, LOTO/OSHA 480V wajib) → dipakai L5: validasi form/builder/drawer/login (ops T2, reports R6, org O5/O11, settings S12).
* `OfflineBanner` (2A: OFFLINE + Reconnecting 4s + indexedDB + Force Ping Now + Buffer N WO) → dipakai L5: telemetry/replika/stream putus (ops T6, reports R8, audit A12, notif N11).
* `ErrorToast` (2B: 500 + Rollback Active + Trace #ERR-xxxx + Retry Request + Copy Log) → dipakai L5: semua mutation gagal + verifikasi gagal (ops T4/T9, reports R2, audit A6/A8, notif N2/N4/N6/N10, org O2/O7, settings S3/S7).
* `TableSkeleton` (§03: 4 baris animate-pulse + endpoint + elapsed + target container + trigger 15s; polling SWR + STALE) → dipakai L5: loading tabel/feed/tab + countdown STALE (ops T5/T8, audit A2, notif N7, settings S10).
* `hover-reveal` (aksi baris view/edit) + `focus-ring` (ring-2 offset-2, klaim WCAG AA) + `kanban-elevated` (drag -translate-y-1 shadow-xl) → dipakai L5: fallback salin manual auditor (audit A8 focus-ring); hover/kanban tidak terminal di batch ini (kanonis WO-2026-#### bila dipakai).
* [POLA-BARU] (di luar vocabulary, perlu kontrak baru): toast sukses, AlertDialog konfirmasi destruktif (otorisasi PO, revoke sesi, deactivate, maint ON, purge/rotate), banner sukses TX-904128, banner sesi impersonasi, navigasi /work-orders/[id] + /purchasing/[id] + /(field)/audits + (auth)/login-MFA, command palette ⌘K, drawer/preview dossier & jadwal & restore viewer, hasil preview OLAP 46ms·412, jadwal arsip/retensi log.
