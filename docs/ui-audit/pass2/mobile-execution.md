# UI Audit Pass-2 — Mobile Execution (`mobile_field_inspection_execution_desk`)

> Sumber: `stitch_facility_maintenance_platform_ui/mobile_field_inspection_execution_desk/code.html` (254 baris)
> + `screen.png` sefolder. Design system: **B — Apex Ops CMMS (field/rugged)**.
> Dibuat: 2026-09-13 (pass-2 independen, belum membandingkan pass-1).
> Konteks global: `docs/ui-audit/navigation-audit.md` (satu-satunya mockup penuh
> layout `(field)`; bottom-nav 4 tab; `<title>Run Checklist</title>`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Run Checklist** adalah eksekusi inspeksi di tablet rugged bersarung
tangan di bawah silau matahari: teknisi menuntaskan 4 step
`INS-2026-0412` (`TMPL-HVAC-CHL-02`, `AST-HVAC-004` Chiller #04 Basement B-204)
dengan tombol PASS/FAIL raksasa, input telemetri jumbo, foto wajib ber-GPS,
dan tombol submit setinggi jempol. Header menegaskan
`Apex Ops LIVE • HQ Nusantara > Chiller Plant B-204`, ikon `cloud_done`,
avatar teknisi. Satu defect kritis (seal 18.4 ppm) sudah di-flag untuk
auto-dispatch WO.

Alur kerja: verifikasi Step 01 PASS → vonis Step 02 FAIL + foto + voice note →
sinkron Step 03 via Modbus → kunci Step 04 → Submit & Auto-Dispatch atau
Save Offline Draft.

### Daftar elemen UI utama

1. **App header mobile** — logo, `Apex Ops` + `LIVE`, pemilih lokasi
   (HQ Nusantara > Chiller Plant B-204), `cloud_done`, avatar; `pt-16`
   untuk offset header, `pb-20` untuk bottom-nav.
2. **Strip konteks + telemetri** — `Protocol TMPL-HVAC-CHL-02` + `Audit
   INS-2026-0412`; kartu aset (`AST-HVAC-004`, Chiller #04 Centrifugal Base,
   HQ Industrial Yard Basement B-204, ikon verified); pill
   `Modbus 10.14.0.8: Online` + `PWA Offline Cache Active`; meter
   `EXECUTION PROGRESS Step 2 of 4 (50%)` bar 50%.
3. **Step 01 PASS [VERIFIED]** — 14:02 UTC, LOTO guard, `Padlock #4092 Seal
   Intact • 0.0V Measured`, `Review`, ikon `done_all`.
4. **Step 02 FAIL [DEFECT FLAGGED] (aktif, strip merah)** — `Step 02 of 04`,
   judul seal leak, segmented raksasa `PASS` vs `FAIL ACTIVE` (`h-14`,
   `onclick="togglePassFail(...)"`), input `18.4 ppm` jumbo (`h-14`,
   `Max Allowed: 0.0 ppm`), callout `Out of Specification: +18.4 ppm ...
   Automatically drafting urgent Work Order dispatch`, modul foto wajib
   (`1 Photo Attached`, preview + `GPS: 0.7893° S, 113.9213° E` +
   `14:18:22 UTC`, `Retake Photo` / `Add Voice Note` `#btn-voice` dengan
   simulasi recording), textarea `Inspector Field Findings`
   (`... PART-SEAL-8821 before shift end`).
5. **Step 03 QUEUED** — suction & Delta-T, bound Min 110 / Max 130 PSI,
   tombol `Sync via IoT Modbus (Auto-Read: 118 PSI)`; Step 04 terkunci
   (`lock_clock`, `opacity-60`, Vibration & Oil Sump).
6. **Sticky action dock** — kapsul `1 Critical Defect Flagged for Dispatch`
   + `PRIORITY 1`; tombol `Submit Audit & Auto-Dispatch WO` (`h-14` primary)
   + `Save Offline Local Draft` (`h-12`).
7. **Bottom-nav field** — 4 tab `my-audits (badge 3)` / `run-checklist`
   aktif / `report-finding` / `sync-status`, semua `href="#"`, target sentuh
   ≥48px.
8. **Script demo** — `togglePassFail('pass')` memunculkan `alert('Override to
   PASS requires Supervisor Sign-off pin.')`; voice toggle mengganti innerHTML
   Recording → Saved (tanpa MediaRecorder nyata).

### State UI

- **Empty state:** belum mulai → semua QUEUED + progress 0% + tombol
  `Start Audit`; draft tersimpan → list my-audits badge bertambah.
- **Loading state:** skeleton kartu step; tombol Sync spinner saat baca Modbus;
  Submit spinner `Dispatching...`; voice `Recording (0:04)...` (sudah dimock).
- **Error state:** FAIL tanpa foto → tombol Submit disabled + hint
  `Photo required`; offline → header `cloud_done` jadi `cloud_off` +
  antrean `sync-status` bertambah; override PASS tanpa PIN → `alert()` demo
  (produksi wajib modal PIN, bukan alert); Modbus gagal → `Sync` merah +
  input manual.

## 2. Navigation Flow & Routing (Alur Navigasi)

Satu-satunya layar layout `(field)`. Semua `href="#"` — target usulan
`/(field)/*`.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Bottom-nav: Checklist (aktif) | `/(field)/run/INS-2026-0412` (halaman ini) |
| Bottom-nav: Audits (badge 3) | `/(field)/audits` — MISSING |
| Bottom-nav: Finding | `/(field)/findings/new` — MISSING |
| Bottom-nav: Sync | `/(field)/sync` (antrean offline) — MISSING |
| Pemilih lokasi header (`HQ Nusantara > Chiller Plant B-204`) | Pemilih siteDrawer (tetap di halaman) |
| Avatar profil | Profil/teknisi — MISSING |
| `Review` (Step 01) | Detail evidence LOTO (modal) — MISSING |
| Segmented PASS / FAIL | State inline `#card-step-2` (tetap di halaman; PASS butuh PIN) |
| `Retake Photo` / `Add Voice Note` | Aksi device (camera/mic) inline |
| `Sync via IoT Modbus` | Aksi baca sensor inline (118 PSI) |
| `Submit Audit & Auto-Dispatch WO` | Aksi `POST`; hasil idealnya kembali `/(field)/audits` + WO terbuat — tab tujuan MISSING |
| `Save Offline Local Draft` | Simpan ke `/(field)/sync` — MISSING |
| Kapsul `1 Critical Defect` | `/(field)/findings/new?from=INS-2026-0412` — MISSING |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Tiga tab field (HIGH)** — `my-audits`, `report-finding`, `sync-status`
   tanpa mockup; alur `run → submit → sync` terputus di perangkat field.
   `// TODO: Create field routes /(field)/audits, /(field)/findings/new, /(field)/sync`
2. **Hasil submit (HIGH)** — tombol Submit tanpa tujuan pasca-sukses; butuh
   kembali ke audits + toast WO terbuat.
   `// TODO: Route post-submit to /(field)/audits with created WO link`
3. **Modal PIN override (MEDIUM)** — override PASS masih `alert()` demo;
   butuh modal PIN supervisor yang aman.
   `// TODO: Replace alert() with supervisor PIN modal for PASS override`
4. **Viewer evidence + profil (LOW)** — `Review`, avatar tanpa tujuan.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis mobile (`maximum-scale=1.0, user-scalable=no,
  viewport-fit=cover`), Tailwind Play CDN, font Inter + JetBrains Mono +
  **Space Grotesk** (headline, khas sistem B), Material Symbols.
  Border tegas + hard shadow khas rugged terlihat di screen. Dua fungsi demo:
  `togglePassFail` (alert) dan voice toggle (ganti label).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript + PWA** | Route `/(field)/run/[auditId]`; `manifest` + service worker untuk offline; typing `AuditRun`, `ChecklistStep`, `Evidence`. |
| **Tailwind CSS (build)** | Touch target ≥48px (`h-12`/`h-14`), kartu kontras tinggi, sticky dock; token sistem B (jangan campur dengan A). |
| **shadcn/ui (mobile)** — `Button`, `Badge`, `Progress`, `Textarea`, `Input`, `Skeleton`, `Toast`, `Dialog`, `Sheet` | Segmented PASS/FAIL, input jumbo, sheet foto/voice, dialog PIN, toast submit. |
| **lucide-react** | Pengganti Material Symbols (check, error, mic, camera, sync). |
| **Workbox / Serwist** | `PWA Offline Cache Active` nyata: queue mutation + background sync ke `/(field)/sync`. |
| **SWR / TanStack Query + IndexedDB (idb)** | State run lokal + sinkron Modbus; draft offline persisten. |
| **axios** | Client `/api/v1` dengan retry antrean. |
| **MediaDevices / MediaRecorder API** | `Retake Photo` + `Add Voice Note` nyata (ganti simulasi label). |
| **Geolocation API** | Stempel `0.7893° S, 113.9213° E` + `14:18:22 UTC` di foto. |
| **Web Bluetooth / Modbus-TCP bridge** | `Sync via IoT Modbus (118 PSI)` nyata. |
| **zod + react-hook-form** | Validasi FAIL wajib (ppm + foto + notes) sebelum submit. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/field/runs/INS-2026-0412` | Run + aset + progress Step 2/4 50% | On page load |
| GET | `/api/v1/field/runs/INS-2026-0412/steps` | 4 steps (PASS/FAIL-active/QUEUED/locked) | On page load |
| PUT | `/api/v1/field/runs/INS-2026-0412/steps/STEP-02` | Vonis FAIL + ppm 18.4 + notes (optimistis) | On toggle PASS/FAIL + input |
| POST | `/api/v1/field/runs/INS-2026-0412/steps/STEP-02/evidence` | Upload foto GPS + timestamp (multipart) | On Retake Photo (auto-upload + antre offline) |
| POST | `/api/v1/field/runs/INS-2026-0412/steps/STEP-02/voice-notes` | Upload voice note (ganti simulasi) | On Add Voice Note stop |
| POST | `/api/v1/field/runs/INS-2026-0412/steps/STEP-02/pass-override` | Override ke PASS dengan PIN supervisor | On PASS saat FAIL aktif (ganti `alert()`) |
| POST | `/api/v1/field/runs/INS-2026-0412/steps/STEP-03/iot-read` | Baca Modbus 118 PSI | On click Sync via IoT |
| POST | `/api/v1/field/runs/INS-2026-0412/submit` | Submit + auto-dispatch WO (P1) | On click Submit Audit |
| PUT | `/api/v1/field/runs/INS-2026-0412/draft` | Save offline draft (juga ke IndexedDB) | On click Save Offline Draft / autosave |
| GET | `/api/v1/field/audits?assignee=me` | Badge Audits (3) | On page load (header/nav) |
| GET | `/api/v1/field/sync-queue` | Antrean offline untuk tab Sync | On save offline / online kembali |

Contoh:

```ts
// TODO: Replace run mock with GET /api/v1/field/runs/INS-2026-0412
const res = await fetch("/api/v1/field/runs/INS-2026-0412");
const { data } = await res.json(); // { auditId, protocol: "TMPL-HVAC-CHL-02", progress: 0.5 }
```

```ts
// TODO: Replace togglePassFail alert() with POST /api/v1/field/runs/INS-2026-0412/steps/STEP-02/pass-override
await axios.post("/api/v1/field/runs/INS-2026-0412/steps/STEP-02/pass-override", { supervisorPin: "****" });
```

```ts
// TODO: Replace voice-label demo with POST .../voice-notes via MediaRecorder
const blob = await recordVoiceNote(); // MediaRecorder
const fd = new FormData(); fd.append("audio", blob);
await axios.post("/api/v1/field/runs/INS-2026-0412/steps/STEP-02/voice-notes", fd);
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace run mock with GET /api/v1/field/runs/INS-2026-0412
export const mobileRun = {
  auditId: "INS-2026-0412", protocol: "TMPL-HVAC-CHL-02",
  asset: { id: "AST-HVAC-004", name: "Chiller #04 – Centrifugal Base", location: "HQ Industrial Yard • Basement Room B-204" },
  progress: 0.5, stepLabel: "Step 2 of 4 (50%)",
  modbus: "10.14.0.8: Online", pwa: "Offline Cache Active",
};

// TODO: Replace steps mock with GET /api/v1/field/runs/INS-2026-0412/steps
export const runSteps = [
  { code: "STEP 01", title: "Emergency Stop & LOTO Lock Guard Integrity", state: "PASS", at: "14:02 UTC", detail: "Padlock #4092 Seal Intact • 0.0V Measured" },
  { code: "STEP 02", title: "Primary Shaft Seal Refrigerant Leak Check", state: "FAIL ACTIVE", ppm: 18.4, maxPpm: 0.0, photo: 1, gps: "0.7893° S, 113.9213° E", at: "14:18:22 UTC", notes: "Severe weeping observed around shaft seal housing. Recommend immediate replacement of PART-SEAL-8821 before shift end." },
  { code: "STEP 03", title: "Compressor Suction Pressure & Delta-T Reading", state: "QUEUED", minPsi: 110, maxPsi: 130, autoPsi: 118 },
  { code: "STEP 04", title: "Vibration Spectrum & Oil Sump Temp", state: "LOCKED" },
];

// TODO: Replace nav mock with GET /api/v1/field/audits?assignee=me + GET /api/v1/field/sync-queue
export const fieldNav = { auditsBadge: 3, active: "run-checklist", defectCapsule: 1, priority: 1 };
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with SWR + IndexedDB for GET /api/v1/field/runs/INS-2026-0412/steps
import { runSteps } from "@/mocks/mobile-execution.mock";

export function RunChecklist() {
  return (
    <ul>
      {runSteps.map((s) => (
        <li key={s.code}>
          {s.code} — {s.title} [{s.state}]
        </li>
      ))}
    </ul>
  );
}
```

Aturan ganti mock → API: simpan draft ke IndexedDB dulu lalu `PUT draft`;
upload foto/voice masuk antrean `sync-queue` saat offline; hapus blok mock per
endpoint live; ganti `alert()` dengan modal PIN sebelum produksi.

## 7. PERBANDINGAN PASS-1 vs PASS-2

Dibaca setelah seksi 1–6 selesai: `docs/ui-audit/mobile-execution.md` (pass-1).

### (a) Temuan pass-1 yang TERKONFIRMASI

- Sistem B rugged, konteks `TMPL-HVAC-CHL-02`/`INS-2026-0412`/`AST-HVAC-004`,
  4 step (PASS 14:02 → FAIL 18.4 ppm → QUEUED 118 PSI → locked), tombol
  `h-14`/`h-12` ≥48px, foto GPS Kalimantan + voice toggle, notes
  `PART-SEAL-8821`, dock `1 Critical Defect / PRIORITY 1` + Submit + Save
  Draft, bottom-nav 4 tab, `alert()` PIN demo — cocok dengan `code.html`
  (254 baris) + `screen.png` vertikal.
- Missing pass-1 (3 tab `audits`/`findings/new`/`sync` HIGH, tujuan submit,
  modal PIN, pola sync offline) terkonfirmasi; semua tab `href="#"`.
- Empat Temuan pass-1 terkonfirmasi via grep: GPS Kalimantan vs EXIF Eropa,
  LOTO `#4092` vs `#M-44` + `Tag #99201`, progres `Step 2 of 4 (50%)` vs
  `65%` hub, granularitas 4-step protokol vs 5-step prosedur WO (artefak
  berbeda yang wajar dipisahkan).

### (b) Temuan BARU yang luput di pass-1

- **Konsistensi positif 118 PSI lintas layar.** `Suction 118 PSI` (tile WO
  hub) = `Auto-Read: 118 PSI` (Step 03 mobile) — rantai telemetri yang
  konsisten, sementara builder desktop memakai sampel `122.0 PSI` (masih
  dalam bound 110–130 tetapi beda nilai). Pass-1 mencatat mismatch progres
  tetapi tidak mencatat match 118 = 118 ini; keduanya perlu dicatat
  (satu match, satu tension).
  `// TODO: Canonicalize suction reading (118 live vs 122.0 template sample)`
- **Spesifikasi offline inkremen.** Pass-1 sudah menuntut pola sync; pass-2
  menambahkan butir konkret yang luput: urutan unggah (draft → foto → voice),
  resolusi konflik (server-menang untuk vonis, klien-menang untuk notes),
  dan retry backoff service worker — tanpa ini klaim `PWA Offline Cache
  Active` tidak bisa diimplementasikan.
- **Offset layout mobile.** `pt-16`/`pb-20`, `viewport-fit=cover`,
  `user-scalable=no` adalah keputusan a11y/UX yang tidak dibahas pass-1
  (pinch-zoom dimatikan = risiko aksesibilitas; dokumentasikan pengecualian
  field-glove).

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Satu catatan presisi: pass-1 menulis judul
  `<title>Run Checklist</title>` dipakai ulang di `vendors_*`/`purchasing_*`
  sebagai bukti artefak — klaim lintas-layar itu berada di luar 6 file batch
  ini dan tidak saya verifikasi ulang di pass-2; saya mempertahankannya
  sebagai rujukan `navigation-audit.md` §5, bukan temuan pass-2.
