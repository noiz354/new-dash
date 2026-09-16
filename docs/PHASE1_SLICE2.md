# Phase 1 — Slice 2: Service Request Flow (SR → WO) + Riwayat Transisi Nyata

> Status: ✅ selesai di branch `arena/01a09dd4-new-dash` · 2026-09-14
> Melanjutkan `docs/PHASE1_SLICE1.md`. Flow PASS kedua: intake SR → triage → konversi ke WO (transaksional, satu-kali) → close.

## 1. Apa yang berubah

| Aspek | Sebelum | Sesudah (slice 2) |
|---|---|---|
| `/service-requests` | 5 tiket hardcode di komponen; tombol tanpa efek | Queue dari Postgres (urut non-terminal → prioritas → due); create/triage/convert/close = API nyata |
| SR → WO | Klaim statis "CONVERTED → WO-2026-0894" | Konversi transaksional: WO dibuat (numbering server + SLA window dari prioritas) **dalam transaksi yang sama** dengan update SR; satu-kali per tiket |
| Detail SR | Hanya tiket kanon; riwayat karangan | Semua tiket (seed/baru) live: status, SLA label nyata, link WO hasil konversi (status WO nyata), riwayat = `audit_events` append-only |
| Detail WO | Tanpa riwayat | Kartu **Transition History** dari `work_order_events` (aksi, from→to, aktor, reason, waktu WIB) |
| Penomoran | Logika nomor urut di dalam `wo-service` | Helper bersama `lib/services/sequence.ts` (WO/SR/PO/INS/FND) — dipakai create WO, create SR, dan convert SR→WO |
| RBAC | Tanpa `sr.transition` | Permission baru `sr.transition`: Enterprise Admin, Facility Director, Engineering Lead. Senior Field Tech tetap `sr.read`+`sr.create` (bukan triager) [ASUMSI-OTOMATIS] |
| `middleware.ts` | Konvensi deprecated (warning Next 16) | `proxy.ts` (penerus resmi) — gate cookie tetap, warning hilang |
| Build log | Spam `"level":"error"` saat prerender probe | `getSessionContext()` re-throw `DYNAMIC_SERVER_USAGE` (expected) alih-alih mencatatnya sebagai error aplikasi |

## 2. State machine SR (`lib/domain/service-requests.ts`)

Status (cek constraint DB `sr_status_ck`): `OPEN / TRIAGED / CONVERTED / CLOSED / BREACHED`. Terminal: `CONVERTED`, `CLOSED`.

| Aksi | Dari | Ke | Syarat |
|---|---|---|---|
| `triage` | OPEN, BREACHED | TRIAGED | — |
| `convert` | OPEN, TRIAGED, BREACHED | CONVERTED | membuat WO dalam transaksi yang sama |
| `close` | OPEN, TRIAGED, BREACHED | CLOSED | **wajib reason** (tersimpan di audit trail) |

- Konversi kedua (key idempotency baru) → `409 SR_INVALID_TRANSITION` ("converts exactly once") — guardrail kanon H3.
- Replay key+body sama → respons tersimpan (tidak ada WO kedua — dibuktikan test).
- `BREACHED` sengaja non-terminal: tiket telat tetap bisa dipulihkan (triage/convert/close).
- Jendela SLA triage dari bukti kanon M2: **P1=15m** ("MET · 11m of 15m"), **P2=45m** ("24m of 45m · BREACHED"); P3 tidak ada bukti kanon → **2h** [ASUMSI-OTOMATIS].

## 3. API baru

| Method & path | Permission | Catatan |
|---|---|---|
| `GET /api/service-requests` | `sr.read` | queue tenant-scoped + caps `{create, transition}` |
| `POST /api/service-requests` | `sr.create` | intake; nomor dari sequence (`SR-2026-0895` pertama); Idempotency-Key |
| `POST /api/service-requests/[id]/transitions` | `sr.transition` | triage/convert/close; Idempotency-Key; optimistic guard + audit rows |

Kode error baru: `SR_INVALID_TRANSITION` (409), `SR_REASON_REQUIRED` (400), `SR_STALE_STATE` (409), `SERVICE_REQUEST_NOT_FOUND` (404), `SR_UNKNOWN_ACTION`.

## 4. Definisi PASS — bukti flow SR→WO

| Kriteria | Bukti |
|---|---|
| Aksi → state backend benar | E2E curl: create `SR-2026-0895` (P2, "44m left") → triage `TRIAGED` → convert `CONVERTED` + `WO-2026-0910` (P1, "04:00:00 LEFT") tercipta |
| Persisten | Restart dev server: 7 SR rows + cookie sesi lama tetap valid (sesi di DB, bukan memori) |
| UI merefleksikan | List & detail SR `router.refresh()` → re-read DB; badge status, link `→ WO-2026-0910`, riwayat Filed/Triaged/Converted dari audit trail; detail WO konversi menampilkan Transition History `CREATE — Converted from SR-2026-0895` |
| Gagal terdiagnosis | double-convert → 409 satu-kali; close tanpa reason → 400; log server terstruktur (`op`, `errorCode`, `requestId`, `userId/orgId`) |
| Outcome bisnis | Satu tiket tidak bisa menjadi dua WO (duplikasi dispatch dicegah); jejak audit lengkap intake→konversi; SLA triage terhitung dari due time nyata |

Test: `npm test` → **36/36 pass** (8 test SR baru: unit state machine + jendela SLA + RBAC `sr.transition`; integrasi seed queue + isolasi tenant, create→triage→convert dengan WO nyata + event + history, close wajib reason + terminal, replay convert idempoten tidak membuat WO kedua).

## 5. Catatan perilaku & batasan jujur

- **HTTP 404 vs EmptyState**: halaman SR/WO detail memakai `EmptyState` (HTTP 200) untuk tiket tak dikenal — dengan `loading.tsx`, shell di-stream sebelum halaman resolve sehingga `notFound()` tidak bisa lagi menyetel status 404. API tetap 404 semantik; UI konsisten antar halaman.
- Halaman SR non-kanon kini fully live (tidak ada lagi "Outside the triage seed"); dossier WO non-kanon tetap EmptyState jujur (dossier generik = slice berikutnya).
- "Export Ticket Log" di detail SR dilabeli *(not implemented)* — toast jujur, tanpa unduhan palsu.
- `dialogs.tsx` requests (AssetDialog/ZoneDialog/ConvertDialog palsu) dihapus — zona/asset picker simulasi tidak dipertahankan.
- Audit trail **page** (`/audit-trail`) masih komponen statis 456 baris → slice 3 (data `audit_events` + service query sudah tersedia).
- Notifikasi (email/webhook) saat convert/close masih belum ada — slice berikutnya.

## 6. Slice 3 (berikutnya)

1. `/audit-trail` live dari `audit_events` (filter aktor/entitas/aksi, pagination server-side).
2. Dossier WO generik (checklist/parts DB-driven) untuk semua nomor WO.
3. Dashboard field/inspections (INS + FND sudah di-seed) atau assets/inventory dari DB.
4. Playwright E2E (login → SR convert → WO hold → refresh) di CI.
