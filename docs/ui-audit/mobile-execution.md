# UI Audit — Mobile Field Inspection Execution Desk (`mobile_field_inspection_execution_desk`)

> Sumber: `stitch_facility_maintenance_platform_ui/mobile_field_inspection_execution_desk/code.html` (254 baris)
> + `screen.png` sefolder. Design system: **B — Apex Ops CMMS (field/rugged)**.
> Route usulan: `/(field)/run/[auditId]`. Dibuat: 2026-09-13.
> Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Run Checklist** adalah antarmuka eksekusi inspeksi di tablet
tangan teknisi — satu-satunya layar batch ini yang memakai **design system B
(rugged)**: tombol jempol besar, kontras tinggi, dan alur offline-first.
Konteks yang dijalankan: protokol `TMPL-HVAC-CHL-02`, audit `INS-2026-0412`,
aset `AST-HVAC-004` (Chiller #04 Centrifugal Base, Basement Room B-204).
Teknisi mengeksekusi 4 step berurutan; Step 02 sedang FAIL (kebocoran seal
18.4 ppm) sehingga halaman otomatis menyusun draf WO urgent.

Alur kerja yang didukung: buka run dari antrean → verifikasi LOTO → catat
temuan FAIL + bukti foto/wicara wajib → baca telemetri via Modbus →
submit audit (auto-dispatch WO) atau simpan draf offline untuk sync nanti.

### Daftar elemen UI utama

1. **App header mobile** — logo + `Apex Ops` + badge `LIVE`; scope lokasi
   `HQ Nusantara > Chiller Plant B-204` (dropdown); ikon `cloud_done`
   (offline cache) + avatar profil.
2. **Strip konteks & telemetri** — chip `Protocol TMPL-HVAC-CHL-02` +
   chip `Audit INS-2026-0412`; kartu aset (`ac_unit`, `AST-HVAC-004`,
   `Chiller #04 – Centrifugal Base`, `HQ Industrial Yard • Basement Room
   B-204`, ikon `verified`); pill `Modbus 10.14.0.8: Online` +
   `PWA Offline Cache Active`; meter `EXECUTION PROGRESS Step 2 of 4 (50%)`
   + progress bar hijau.
3. **Kartu Step 01 (PASS verified)** — badge `PASS [VERIFIED]` + `14:02 UTC`;
   `Step 01 • Lockout / Tagout`, `Emergency Stop & LOTO Lock Guard Integrity`;
   bar bukti (`Padlock #4092 Seal Intact • 0.0V Measured`, tombol `Review`).
4. **Kartu Step 02 aktif (FAIL flagged)** — strip merah kiri + badge
   `✕ FAIL [DEFECT FLAGGED]` + `Step 02 of 04`; judul
   `Primary Shaft Seal Refrigerant Leak Check` + deskripsi; **tombol
   keputusan tersegmentasi jempol** (`h-14` ≈ 56px ≥ 48px syarat sistem B):
   `PASS` vs `FAIL ACTIVE`; input telemetri besar (`18.4`, satuan `ppm`,
   label `Max Allowed: 0.0 ppm`); callout merah
   (`Out of Specification: +18.4 ppm breach exceeds OSHA Threshold Level 1.
   Automatically drafting urgent Work Order dispatch.`); modul evidence
   (`Mandatory Visual Evidence`, `1 Photo Attached`, frame foto 16:9 +
   overlay `GPS: 0.7893° S, 113.9213° E` + `14:18:22 UTC`); tombol
   `Retake Photo` (`h-12`) + `Add Voice Note` (JS: toggle rekam
   `Recording (0:04)...` → `Voice Note Saved`); textarea
   `Inspector Field Findings` (terisi rekomendasi ganti `PART-SEAL-8821`).
5. **Kartu Step 03 (queued)** — badge `QUEUED • STEP 03` +
   `Telemetry Auto-Sync Ready`; `Compressor Suction Pressure & Delta-T
   Reading`; bound `Min: 110 PSI • Max: 130 PSI`; tombol
   `Sync via IoT Modbus (Auto-Read: 118 PSI)` (`h-12`).
6. **Kartu Step 04 (locked)** — `Step 04 • Final Phase`,
   `Vibration Spectrum & Oil Sump T...`, ikon `lock_clock`, opacity 60%.
7. **Action dock sticky** — kapsul `1 Critical Defect Flagged for Dispatch`
   + `Priority 1`; tombol primer `h-14` `Submit Audit & Auto-Dispatch WO`
   (hitam, ikon bolt); tombol `h-12` `Save Offline Local Draft`.
8. **Bottom-nav field (4 tab)** — `Audits` (badge 3), `Checklist` (aktif),
   `Finding`, `Sync` — satu-satunya bottom-nav valid (bukan artefak).

### State UI

- **Empty state:** run tanpa step (template kosong) → pesan + tombol kembali
  ke `Audits`; foto belum ada → frame placeholder + `Capture Photo` sebagai
  CTA primer (bukan sekunder), karena evidence bersifat mandatory.
- **Loading state:** kartu step memakai skeleton block; tombol Modbus sync
  spinner `Reading...`; tombol submit spinner + disabled ganda; progress
  meter animasi transisi lebar (sudah ada `transition-all duration-500`).
- **Error state:** submit offline → otomatis fallback ke
  `Save Offline Local Draft` + badge antrean Sync bertambah; foto gagal
  disimpan → error inline + tombol `Retake`; override PASS atas step FAIL
  → sesuai mockup membutuhkan `Supervisor Sign-off pin`
  (`alert()` saat ini — ganti dengan modal PIN); Modbus gagal baca →
  tombol sync merah + input manual fallback.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell mobile (bukan sidebar desktop): header app + bottom-nav
4 `data-path` (`my-audits`, `run-checklist` aktif, `report-finding`,
`sync-status`). Judul dokumen `<title>Run Checklist</title>` — sama persis
dengan yang dipakai ulang mentah di `vendors_*` dan `purchasing_*`
(bukti artefak copy-paste, lihat `navigation-audit.md` §5).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Bottom-nav `Audits` (badge 3) | `/(field)/audits` — MISSING (tab tanpa mockup) |
| Bottom-nav `Checklist` (aktif) | `/(field)/run/INS-2026-0412` (halaman ini) |
| Bottom-nav `Finding` | `/(field)/findings/new` — MISSING (tab tanpa mockup) |
| Bottom-nav `Sync` | `/(field)/sync` (antrean offline) — MISSING (tab tanpa mockup) |
| Scope lokasi (dropdown header) | Ganti konteks site (sheet pilihan), bukan navigasi |
| `Review` (bukti Step 01) | Pratinjau foto LOTO (lightbox) — MISSING |
| Toggle PASS (`togglePassFail('pass')`) | Override membutuhkan PIN supervisor (modal) — MISSING |
| `Retake Photo` / `Add Voice Note` | Aksi capture inline (kamera/mic), tetap di halaman |
| `Sync via IoT Modbus` | Aksi baca sensor (`GET` telemetri), tetap di halaman |
| `Submit Audit & Auto-Dispatch WO` | Aksi `POST` submit + buat WO → kembali ke `/(field)/audits` + WO terbuat di `/work-orders/[id]` — KEDUA target MISSING |
| `Save Offline Local Draft` | Simpan ke antrean lokal → `/(field)/sync` — MISSING |
| Avatar profil | Profil/sesi teknisi — MISSING (ikut backlog Org hub) |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Tiga tab field tanpa mockup (HIGH)** — `Audits`, `Finding`, `Sync` adalah
   dead-end; tanpa `/(field)/sync`, draf offline tidak punya tempat
   ditinjau/diunggah dan alur `run → submit → sync` terputus
   (konsisten dengan `navigation-audit.md` §4 item 2).
   `// TODO: Create field routes /(field)/audits, /(field)/findings/new, /(field)/sync`
2. **Tujuan submit (HIGH)** — `Submit Audit & Auto-Dispatch WO` tidak
   mendefinisikan layar kembali (usulan: `/(field)/audits` + toast
   `WO-... created`) maupun tautan ke WO yang terbuat.
   `// TODO: Define post-submit destination (/(field)/audits + toast with WO link)`
3. **Modal PIN supervisor (MEDIUM)** — override PASS atas step FAIL saat ini
   `alert()` demo; produksi butuh modal PIN + audit trail siapa meng-override.
4. **Pola sinkronisasi offline (MEDIUM)** — badge `PWA Offline Cache Active`
   dan tombol draf butuh spesifikasi sync (urutan unggah, resolusi konflik,
   retry) sebelum implementasi service worker.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file (mobile viewport, `maximum-scale=1.0,
  user-scalable=no, viewport-fit=cover`), styling via **Tailwind Play CDN**.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/GPS),
  **Space Grotesk** (headline, khas sistem B), ikon **Material Symbols**.
- JS vanilla demo: `togglePassFail()` (`alert` untuk PASS, `console.log`
  untuk FAIL) + toggle rekam voice note (ganti `innerHTML` saja).
- Tanpa framework, routing, PWA nyata, atau akses kamera/mic.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route group `/(field)/run/[auditId]` dengan layout shell mobile (header + bottom-nav); typing `AuditRun`, `RunStep`, `Evidence`. |
| **Tailwind CSS (build, bukan CDN)** | Styling rugged sistem B: border tebal, hard shadow, touch target ≥48px. Token dari `DESIGN.md` sistem B. |
| **shadcn/ui (Radix)** — `Button`, `Badge`, `Progress`, `Textarea`, `Input`, `Dialog`, `Toast`, `Avatar` | Tombol PASS/FAIL tersegmentasi, badge status, progress meter, modal PIN supervisor, toast submit/sync. |
| **lucide-react** | Pengganti Material Symbols agar tree-shakeable. |
| **next-pwa (@ducanh2912/next-pwa) + Workbox** | Mewujudkan klaim `PWA Offline Cache Active`: precache shell run, background sync antrean draf. |
| **IndexedDB (idb / Dexie.js)** | Penyimpanan draf offline + foto (blob) + voice note sebelum sync ke `/(field)/sync`. |
| **MediaDevices API (`getUserMedia`) + ExifReader** | `Retake Photo` (capture + overlay GPS/timestamp) dan baca EXIF; `MediaRecorder` untuk voice note. |
| **SWR atau TanStack Query** | Fetch run + submit; optimistic update step; penanda `OFFLINE`/`STALE` saatedithering. |
| **axios** (atau `fetch` + `ky`) | HTTP client + upload `multipart/form-data` evidence. |
| **date-fns + date-fns-tz** | Format `14:02 UTC`, `14:18:22 UTC`, durasi rekaman voice note. |
| **zod + react-hook-form** | Validasi step (FAIL wajib: reading + minimal 1 foto + catatan) sebelum submit. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Semua response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`; upload memakai
`multipart/form-data`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/field/runs/:auditId` | On page load (konteks + 4 step) | Response: `{ "data": { "auditId": "INS-2026-0412", "protocolId": "TMPL-HVAC-CHL-02", "assetId": "AST-HVAC-004", "assetName": "Chiller #04 – Centrifugal Base", "location": "HQ Industrial Yard • Basement Room B-204", "progress": { "done": 2, "total": 4 }, "steps": [{ "seq": 1, "state": "PASS", "at": "14:02 UTC" }, { "seq": 2, "state": "FAIL", "reading": 18.4, "unit": "ppm" }] } }` |
| PATCH | `/api/v1/field/runs/:auditId/steps/:seq` | On toggle PASS/FAIL + input reading/notes (autosave) | Body: `{ "verdict": "FAIL", "reading": 18.4, "notes": "Severe weeping observed..." }`. Response: `{ "data": { "seq": 2, "state": "FAIL", "synced": true } }` |
| POST | `/api/v1/field/runs/:auditId/steps/:seq/override` | On override PASS atas step FAIL (PIN supervisor) | Body: `{ "supervisorPin": "••••", "reason": "..." }`. Response: `{ "data": { "seq": 2, "state": "PASS", "overriddenBy": "spv-03" } }` |
| POST | `/api/v1/field/runs/:auditId/evidence` | On `Retake Photo` / `Add Voice Note` | Body: `multipart (file, stepSeq, gps, capturedAt)`. Response: `{ "data": { "id": "ev-201", "gps": "0.7893° S, 113.9213° E", "at": "14:18:22 UTC" } }` |
| GET | `/api/v1/assets/:id/live-reading` | On click `Sync via IoT Modbus` (Step 03) | Response: `{ "data": { "assetId": "AST-HVAC-004", "suctionPsi": 118, "bounds": { "min": 110, "max": 130 }, "channel": "Modbus 10.14.0.8" } }` |
| POST | `/api/v1/field/runs/:auditId/submit` | On click `Submit Audit & Auto-Dispatch WO` | Body: `{ "steps": [...], "defects": 1 }`. Response: `{ "data": { "auditId": "INS-2026-0412", "status": "SUBMITTED", "workOrderId": "WO-2026-8802" } }` |
| POST | `/api/v1/field/runs/:auditId/draft` | On click `Save Offline Local Draft` (atau auto saat offline) | Body: `{ "steps": [...], "evidenceIds": ["ev-201"] }`. Response: `{ "data": { "draftId": "draft-55", "queuedAt": "..." } }` |
| GET | `/api/v1/field/sync-queue` | On buka tab `Sync` (badge antrean) | Response: `{ "data": { "pending": [{ "draftId": "draft-55", "auditId": "INS-2026-0412" }] } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Seluruh mock tinggal di `mocks/mobile-execution.mock.ts` + antrean IndexedDB
lokal (Dexie) selama backend belum siap. Setiap blok wajib berkomentar
`// TODO` dengan endpoint penggantinya.

```ts
// TODO: Replace run mock with GET /api/v1/field/runs/INS-2026-0412
export const auditRun = {
  auditId: "INS-2026-0412", protocolId: "TMPL-HVAC-CHL-02",
  assetId: "AST-HVAC-004", assetName: "Chiller #04 – Centrifugal Base",
  location: "HQ Industrial Yard • Basement Room B-204",
  progress: { done: 2, total: 4 },
  steps: [
    { seq: 1, title: "Emergency Stop & LOTO Lock Guard Integrity", state: "PASS", at: "14:02 UTC", evidence: "Padlock #4092 Seal Intact • 0.0V Measured" },
    { seq: 2, title: "Primary Shaft Seal Refrigerant Leak Check", state: "FAIL", reading: 18.4, unit: "ppm", maxAllowed: 0.0 },
    { seq: 3, title: "Compressor Suction Pressure & Delta-T Reading", state: "QUEUED", min: 110, max: 130, autoRead: 118 },
    { seq: 4, title: "Vibration Spectrum & Oil Sump Temp", state: "LOCKED" },
  ],
};

// TODO: Replace evidence mock with POST /api/v1/field/runs/INS-2026-0412/evidence (multipart)
export const stepEvidence = [
  { id: "ev-201", stepSeq: 2, gps: "0.7893° S, 113.9213° E", at: "14:18:22 UTC", kind: "PHOTO" },
];

// TODO: Persist drafts locally (Dexie/IndexedDB) until POST /api/v1/field/runs/INS-2026-0412/draft is live
export const offlineDraft = { draftId: "draft-55", auditId: "INS-2026-0412", steps: [], queuedAt: null };

// TODO: Replace togglePassFail alert() with supervisor PIN modal + POST /api/v1/field/runs/:auditId/steps/:seq/override
// TODO: Create field routes /(field)/audits, /(field)/findings/new, /(field)/sync
// TODO: Define post-submit destination (/(field)/audits + toast with WO link)
```

Contoh binding ke komponen (Next.js + shadcn, ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/field/runs/INS-2026-0412', fetcher)
import { auditRun } from "@/mocks/mobile-execution.mock";

export function RunChecklist() {
  return (
    <div>
      <span className="font-mono">{auditRun.auditId}</span>
      {auditRun.steps.map((step) => (
        <article key={step.seq}>
          <h2>{step.title}</h2>
          <Badge>{step.state}</Badge>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-14">PASS</Button>
            <Button className="h-14" variant="destructive">FAIL</Button>
          </div>
        </article>
      ))}
    </div>
  );
}
```

Aturan penggantian mock → API: hapus satu blok mock per endpoint yang sudah live,
ganti dengan `useSWR` + `Skeleton` saat `isLoading` + `Toast` saat `error`
(+ fallback IndexedDB saat `offline`), dan pertahankan struktur field agar
komponen tidak berubah.

### Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **Koordinat GPS berbeda untuk bukti yang sama.** Overlay foto di sini
   `0.7893° S, 113.9213° E` (Kalimantan), sedangkan foto
   `PHOTO_CHILLER4_SEAL.RAW` di meja konversi ber-EXIF `48.12°N 11.58°E`
   (Eropa). Samakan lokasi kanonis (kawasan HQ Nusantara).
2. **Nomor gembok LOTO berbeda.** Step 01 di sini `Padlock #4092`,
   sedangkan WO hub Step 01 memakai `Padlock #M-44` + `Tag #99201`.
   Normalisasi identitas LOTO saat seeding bila merujuk pekerjaan yang sama.
3. **Basis progres berbeda dengan hub.** Layar ini `Step 2 of 4 (50%)`,
   sedangkan antrean hub menampilkan `INS-2026-0412 IN PROGRESS 65%`.
   Selaraskan rumus progres (lihat `field-inspections.md` Temuan 2).
4. **Granularitas checklist berbeda dengan WO hub.** Run inspeksi memakai
   4 step protokol (`TMPL-HVAC-CHL-02`), sedangkan eksekusi WO memakai
   5 step prosedur — ini wajar bila keduanya artefak berbeda (protokol
   inspeksi vs prosedur perbaikan), tetapi dokumentasikan pemisahannya agar
   tidak tertukar saat rebuild.
