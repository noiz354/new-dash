# GAP-4 Spec — Finding convert/dismiss + desk PM (CLOSE ALL GAPS)

Status: SPEC — implementasi mengikuti dokumen ini satu-per-satu.
Scope: `components/field/FindingDesk.tsx` (handler fiktif) + backend pendukung.
Di luar scope: rubah halaman lain, BOM staging nyata, PM hub (GAP-8).

## G4.1 Masalah (bukti)

- `FindingDesk.doConvert` → `setTimeout 1200ms` → badge CONVERTED + toast
  "`WO-2026-0894` created … M. Kowalski paged" tanpa request apa pun.
- `FindingDesk.doDismiss` → setState + toast "dismissed … audit-chained"
  tanpa request; NOL audit event tertulis.
- Tombol "Schedule Routine PM" → toast sukses "PM-PLN-0104 queue" fiktif.
- Backend: `POST /api/findings/[id]/convert` ADA (`finding.convert`,
  transaksional, idempoten) tapi TAK dipanggil siapa pun. Endpoint dismiss
  TAK ADA. `pm.create` ADA tak dipanggil desk ini.

## G4.2 Keputusan desain

1. Convert di-wire ke endpoint nyata (perm `wo.create`, honori Idempotency-Key).
2. Dismiss = endpoint BARU `POST /api/findings/[id]/dismiss`
   (justification min 10 chars, perm BARU `finding.dismiss`), karena lifecycle
   finding ≠ pembuatan WO. Service `dismissFinding()` di inspection-service,
   pola sama dengan `convertFindingToWo` (transaksi + audit FINDING_DISMISS).
   Terminal guard: CONVERTED/DISMISSED → 409 (dismiss-after-convert = 409).
3. Desk memuat status LIVE finding kanon via `GET /api/findings` (perm
   `finding.read`); badge + tombol mengikuti server, bukan `useState` lokal.
   Canon finding di seed = CONVERTED → desk menampilkan state converted
   dari server (bukan hasil klik). Itu expected, bukan bug.
4. "Schedule Routine PM" di-wire ke `pm.create` (title + assetCode kanon +
   intervalDays 90) — satu POST sederhana, masih dalam file yang sama.
5. Copy jujur: toast error destruktif memakai `error.code + message` server;
   409 ALREADY_CONVERTED → tampilkan state converted dari server.

## G4.3 Kontrak backend

- `POST /api/findings/[id]/dismiss`
  body: `{ "justification": string(min 10, max 1000) }`
  → 200 `{ finding: { number, status: 'DISMISSED', ... } }`
  → 400 VALIDATION_ERROR (justification pendek/hilang)
  → 404 FINDING_NOT_FOUND · 409 ALREADY_CONVERTED / ALREADY_DISMISSED
  → 403 FORBIDDEN (tanpa `finding.dismiss`)
- RBAC: `finding.dismiss` diberikan ke Facility Director, Engineering Lead,
  Senior Field Tech (peran yang memegang `finding.create`).
- Audit: `FINDING_DISMISS` (entity finding, after.status + justification).

## G4.4 Kontrak frontend (FindingDesk)

- `GET /api/findings` saat mount → cari `CANON.finding`:
  - ketemu → `live = { status, convertedWoNumber }`; badge: CONVERTED→link WO
    server / DISMISSED→badge dismissed / OPEN→ACTIVE TRIAGE.
  - gagal → banner jujur "Live status unavailable — actions disabled",
    tombol disabled (jangan tebak state).
- Convert: `POST …/convert` + header `Idempotency-Key: crypto.randomUUID()`,
  body `{ woTitle, woPriority: 'P1', reason }`. Sukses → badge WO server.
  409 → sinkronkan state converted dari server bila ada WO, atau toast jujur.
- Dismiss: `POST …/dismiss` body `{ justification: reason }`. Sukses → badge
  DISMISSED + tombol disabled. Validasi klien min-10 tetap (guard cepat),
  server yang memutuskan.
- PM: `POST /api/preventive-maintenance` body
  `{ title: 'Routine PM drafted from FND-…', assetCode, intervalDays: 90 }`.
  Sukses → toast dengan rule id server. Gagal → toast destruktif jujur.
- NOL `setTimeout` simulasi; NOL klaim "audit-chained"/"paged" kecuali dari server.

## G4.5 Tests (tests/integration.test.ts)

1. convert happy: finding OPEN baru → 201, WO tercipta, finding CONVERTED,
   audit FINDING_CONVERT_WO, tenant-isolasi.
2. convert kedua tanpa key → 409 ALREADY_CONVERTED (satu-kali).
3. convert replay key sama → idempoten (NOL WO kedua).
4. dismiss happy: finding OPEN baru → DISMISSED + audit FINDING_DISMISS.
5. dismiss justification <10 → 400/422 (service menolak).
6. dismiss setelah convert → 409.

## G4.6 Runtime (MCP dev :3145, m.vance)

- API: convert fresh (curl) → 201; double → 409; dismiss fresh → DISMISSED;
  dismiss-pendek → 400; dismiss-after-convert → 409.
- UI desk kanon: badge CONVERTED + link WO server (live, bukan klik);
  klik Convert → 409 ditangani jujur; console 0 error.
- UI happy-path penuh (klik → 201) verified-by-construction (endpoint sama
  yang dibuktikan via API + wiring satu fungsi fetch); dicatat jujur bila
  tak dieksekusi via klik karena seed kanon terminal.
