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
