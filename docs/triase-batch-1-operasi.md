# Triase Batch 1 — Tema Operasi (Step 2)

> Sumber: `docs/exp-check/part-operasi.md` (73 checkbox, 6 layar) vs kondisi kodebase HEAD `4121970`.
> Metode: grep keberadaan per item (rute/komponen/service). DONE = implementasi ditemukan di kode;
> PROMOTE = tak ditemukan / kedalaman belum terverifikasi → backlog; USANG = tak ada yang memenuhi syarat
> (tidak ada item yang dikontradiksi temuan Wave 3–4; konflik kanon 0894/8802, LOTO, INS-412, PART-SEAL
> tetap dicatat sebagai dependensi, tidak diputus di sini).
> Legenda kolom B: B=bukti file; U=belum terverifikasi kedalamannya.

## 1. Work Order hub (12) — DONE 6, PROMOTE 6

| # | Item | V | Bukti / catatan |
|---|---|---|---|
| WO-1 | Halaman detail WO mandiri | DONE | `app/(ops)/work-orders/[id]/page.tsx` (446 baris, real) |
| WO-2 | Evidence viewer/galeri LOTO + hash | PROMOTE | Capture+hash SHA-256 real di FindingCapture (photoInfo.hash); lightbox/galeri konteks-WO belum ditemukan |
| WO-3 | Drawer requisition parts prefill | PROMOTE | Ada hit 'equisition' di `WoDialogs.tsx`; prefill inventaris belum diverifikasi (U) |
| WO-4 | Alur shift handover | DONE | `components/workorders/ShiftPlan.tsx` + `shifts/plan` + terlihat runtime di TASK-25 |
| WO-5 | Flow request tech assist | PROMOTE | Hanya sebutan generik; alur khusus tak ditemukan |
| WO-6 | Print view work permit | DONE | `PrintButton` + PTW-2026-0814 + `components/print/` |
| WO-7 | Tujuan unduhan Export WO Log | DONE | `ExportDialog` (WoDialogs) + Export CSV di list (pola unduhan real terbukti di audit) |
| WO-8 | Konfirmasi transisi berisiko | DONE | Hold/Escalate/Resume/Cancel/Signoff dialogs di detail WO |
| WO-9 | Autosave + STALE catatan | PROMOTE | Nihil |
| WO-10 | Drag kartu pipeline | PROMOTE | Nihil (dnd/kanban) |
| WO-11 | Validasi quick-log labor | PROMOTE | Nihil (labor) |
| WO-12 | Filter keyboard/palette | DONE | `components/ops/CommandPalette.tsx` + ⌘K di dashboard |

## 2. Service Requests triage (12) — DONE 2, PROMOTE 10

| # | Item | V | Bukti / catatan |
|---|---|---|---|
| SR-1 | Halaman hasil konversi SR→WO | DONE | `convertedWoNumber` → link detail WO (`service-requests/[id]`) + convert server terbukti di test |
| SR-2 | Detail SR per tiket + riwayat | DONE | Rute `[id]` + `listSrHistory` |
| SR-3 | Asset lookup drawer | PROMOTE | Nihil |
| SR-4 | Batch bar | PROMOTE | Tak terkonfirmasi (output grep terpotong) (U) |
| SR-5 | Taksonomi dispatch level | PROMOTE | Nihil |
| SR-6 | Export Ticket Log | PROMOTE | Nihil di detail; list belum terverifikasi (U) |
| SR-7 | Konfirmasi konversi P1 + LOTO | PROMOTE | Nihil di detail (129 baris, tanpa Convert/Dispatch/Export/Chat) |
| SR-8 | Penanganan BREACHED | PROMOTE | Nihil |
| SR-9 | Validasi form konversi | PROMOTE | Nihil |
| SR-10 | Optimistic + STALE | PROMOTE | Nihil |
| SR-11 | Modal reject/duplikat | PROMOTE | Nihil |
| SR-12 | Chat gagal + Retry | PROMOTE | Nihil (keberadaan chat sendiri belum pasti) (U) |

## 3. Preventive Maintenance (11) — DONE 4, PROMOTE 7

| # | Item | V | Bukti / catatan |
|---|---|---|---|
| PM-1 | Link histori Last Executed | PROMOTE | Data `lastWo` + kolom ada; target link belum diverifikasi (U) |
| PM-2 | Form plan baru + edit | DONE | Dialog New PM Plan Definition ada |
| PM-3 | Checklist detail plan | PROMOTE | Nihil |
| PM-4 | Drawer detail per baris | PROMOTE | Nihil |
| PM-5 | Shift plan view | DONE | `shifts/plan` |
| PM-6 | Export CSV plan | PROMOTE | Nihil |
| PM-7 | Hasil batch dispatch | DONE | Execute Dispatch Batch + toast; penanganan gagal-parsial belum diverifikasi (U) |
| PM-8 | Validasi form plan | DONE | Required + pesan error |
| PM-9 | Status STALE engine/Modbus | PROMOTE | Status ACTIVE ada; perilaku merah+STALE belum terkonfirmasi |
| PM-10 | Penanda simulasi vs nyata | PROMOTE | Tombol Simulate ada; penanda visual belum terkonfirmasi |
| PM-11 | Urutan ready-first | PROMOTE | Kartu Ready ada; aturan sortir belum terkonfirmasi |

## 4. Field inspections (13) — DONE 5, PROMOTE 8

| # | Item | V | Bukti / catatan |
|---|---|---|---|
| FI-1 | Route eksekusi mobile per audit | DONE | `field-inspections/[id]` + `RunChecklist` |
| FI-2 | Permukaan findings + deep-link | DONE | `field/findings` + `[id]` |
| FI-3 | Drawer detail terpadu | PROMOTE | Nihil |
| FI-4 | Konten tab Templates | PROMOTE | Nihil |
| FI-5 | Mode create template | PROMOTE | Nihil |
| FI-6 | Export Audit Log | DONE | Tombol ada |
| FI-7 | Shift handover | DONE | Sama WO-4 |
| FI-8 | Fast-link accessible | PROMOTE | Belum terverifikasi (+ pola temuan a11y TASK-26) |
| FI-9 | Force Dispatch gagal | DONE | Toast ada; baris-tetap-OVERDUE belum diverifikasi (U) |
| FI-10 | Validasi publish template | PROMOTE | Belum terkonfirmasi (FAIL auto-flag ada) |
| FI-11 | Reorder keyboard | PROMOTE | Nihil |
| FI-12 | Gateway IoT putus | PROMOTE | Baca Modbus ada; widget OFFLINE+STALE belum terkonfirmasi |
| FI-13 | Filter tanpa hasil | DONE | Pola `EmptyState` ada di kodebase |

## 5. Findings conversion desk (13) — DONE 5, PROMOTE 8

| # | Item | V | Bukti / catatan |
|---|---|---|---|
| FC-1 | Halaman hasil konversi | PROMOTE | Convert + LOTO guard ada; halaman hasil belum terkonfirmasi |
| FC-2 | Permukaan findings (nav) | DONE | Rute ada; sisa pertanyaan struktur nav |
| FC-3a | Evidence viewer foto | PROMOTE | Foto + Full Specimen View ada; lightbox belum terkonfirmasi |
| FC-3b | Integrity report ledger | DONE | Verify-chain UI (TASK-20) |
| FC-4 | Prefill PM dari temuan | DONE | Schedule Routine PM → PM-PLN-0104 |
| FC-5 | Recount pill Unresolved | PROMOTE | Copy fix kecil |
| FC-6 | Semantik Batch Convert | PROMOTE | Nihil |
| FC-7 | Export CSV defect | PROMOTE | Nihil |
| FC-8 | Dismiss + justifikasi | DONE | 'dismissed with justification · audit-chained' |
| FC-9 | Guard LOTO | DONE | `disabled={!loto}` |
| FC-10 | BOM shortage | PROMOTE | Nihil |
| FC-11 | Konversi gagal toast | PROMOTE | `doConvert` ada; path gagal belum terkonfirmasi |
| FC-12 | Derivasi SLA OSHA 4 jam | PROMOTE | Badge OSHA ada; aturan derivasi belum terkonfirmasi |
| FC-13 | Filter tanpa hasil | DONE | Pola EmptyState |

## 6. Mobile execution desk (12) — DONE 7, PROMOTE 5

| # | Item | V | Bukti / catatan |
|---|---|---|---|
| ME-1 | Tiga tab field ber-route | DONE | `field/page` + `findings` + `/field/sync` (terbukti runtime) |
| ME-2 | Tujuan pasca-submit | DONE | `router.push('/field/audits')` + `/field/sync` |
| ME-3 | Modal PIN supervisor | DONE | `SUPERVISOR_PIN` + flow override (tulis audit belum diverifikasi) (U) |
| ME-4 | Spesifikasi sync offline | DONE | Outbox terbukti runtime (TASK-25) |
| ME-5 | Review evidence LOTO | PROMOTE | Sama WO-2 |
| ME-6 | Profil + sesi teknisi | DONE | Rute profile + API sessions ada (kedalaman U) |
| ME-7 | Pemilih site drawer | PROMOTE | Nihil |
| ME-8 | Validasi FAIL submit | PROMOTE | Validasi judul + capture foto ada; aturan reading+foto wajib belum terkonfirmasi |
| ME-9 | Fallback offline + badge | DONE | Terbukti runtime TASK-25 (QUEUED + badge) |
| ME-10 | Modbus gagal → manual | PROMOTE | Baca ada; fallback belum terkonfirmasi |
| ME-11 | Status voice note | DONE | State + push 'Voice Note Saved' ada |
| ME-12 | Keputusan pinch-zoom | PROMOTE | Tak ada maximumScale; butuh keputusan + dokumen |

## Ringkasan: DONE 29, PROMOTE 44, USANG 0 (dari 73)

PROMOTE terbesar: SR triage (10), diikuti findings (8), inspections (8), PM (7), WO (6), mobile (5).
Dependensi kanon yang belum diputus (bukan verdict): WO seal ganda 0894/8802, LOTO #4092/#M-44,
INS-2026-0412 65/50, PART-SEAL-8821, jam Shift A, GPS Kalimantan.
