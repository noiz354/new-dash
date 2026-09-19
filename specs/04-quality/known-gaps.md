# Known Gaps (Daftar Kesenjangan Jujur)

> Ini adalah inti anti-fabrikasi specs ini. Setiap item: apa yang diklaim vs apa yang benar. Status: campur 🔶/❌/PLANNED.

## Fungsional

| # | Klaim yang beredar | Kebenaran | Status |
|---|---|---|---|
| 1 | "Tier 4 selesai" | 4/14 tasks; T4-17..T4-26 belum | 🔶 PARTIAL |
| 2 | Approval flow SR | Schema siap, UI belum (§3 SR) | ❌ PLANNED |
| 3 | GRN approval terpisah | Hanya status PO (§6 purchasing) | ❌ PLANNED |
| 4 | Bulk GRN | Belum ada | ❌ PLANNED |
| 5 | Vendor performance dashboard | Disebut INVENTORY §07, belum ada | ❌ PLANNED |
| 6 | PM auto-generate WO | Endpoint `[id]/generate` ADA (`app/api/preventive-maintenance/`), perilaku auto-create WO belum dibuktikan | 🔶 SOURCE-FOUND (naik dari PLANNED; butuh uji) |
| 7 | Reports builder + export | Hanya summary cards | 🔶 PARTIAL |
| 8 | Audit log real | Hanya tabel statis | 🔶 PARTIAL |
| 9 | Facilities hierarchy | Hanya list + health | 🔶 PARTIAL |
| 10 | User roles enforce | Hanya tampilan matrix | 🔶 PARTIAL |
| 11 | Inspection photo upload | Klaim tanpa bukti biner di repo | ❓ UNVERIFIED |
| 12 | Offline mode field | ADA — `app/offline/page.tsx` (fallback + outbox nyata, diverifikasi 2026-09-19) | 🔶 IMPLEMENTED UNVERIFIED (naik dari PLANNED; belum diuji E2E) |
| 13 | Push/SSE notifikasi | `app/api/push/subscribe` ADA, wired end-to-end (diverifikasi 2026-09-19, belum diuji kirim aktual) | 🔶 PARTIAL (naik dari polling-only) |
| 14 | PO list mock badge | Badge "mock" di UI purchasing | 🔶 diakui di UI |

## Pengujian

| # | Gap | Status |
|---|---|---|
| 15 | E2E Playwright (chromium) | TERBUKA 2026-09-19: smoke 5/5 PASS di Chrome nyata (CDP 9222); journey FAIL = drift test↔API (`sr-service.ts:301`, fix = commit app terpisah) | 🔶 PARTIAL (lihat `test-evidence.md`) |
| 16 | Tidak ada e2e untuk PO→GRN, approval SR, PM generate | ❌ belum ditulis |
| 17 | Skill eksternal (Spec Kit/OpenSpec/Agent Skills) belum diinstal | BLOCKED (butuh otorisasi) |

## Dokumentasi

| # | Gap | Status |
|---|---|---|
| 18 | specs/ ini pass-1 observasi; verification.md per domain belum dibuktikan baris-per-baris | 🔶 ongoing |
| 19 | Migration map CANONICAL/HISTORICAL/SUPERSEDED untuk 174 .md belum dikerjakan | ❌ PLANNED |
| 20 | Session history (`.agentmemory/`) belum diringkas ke 06-history | 🔶 parsial (file ini+1) |

## Tautan traceability (G1–G20 ↔ `specs/TRACEABILITY.md`, 2026-09-19)

| Gap | Baris matriks TRACEABILITY |
|---|---|
| G1 (Tier 4 partial) | implisit semua baris IMPLEMENTED UNVERIFIED + `roadmap.md` Tier 4 |
| G2 (SR approval), G3 (GRN approval), G4 (bulk GRN) | SR intake→convert WO; Purchasing+GRN |
| G5 (vendor perf), G9 (facilities), G10 (roles) | Vendor & kontraktor; Fasilitas; Organisasi/RBAC |
| G6 (PM auto-WO) | PM scheduling |
| G7 (reports), G8 (audit) | Laporan & analitik; Audit trail |
| G11 (photo upload) | Eksekusi inspeksi mobile (B) |
| G12 (offline — ADA) | baris baru "Offline fallback + outbox" di matriks |
| G13 (push — wired) | Notifikasi & SLA |
| G14 (PO mock badge) | Purchasing + GRN |
| G15 (E2E), G16 (e2e belum ditulis) | kolom Uji semua baris |
| G17 (skills), G19 (migration map), G20 (session history) | proses — bukan baris fitur; lihat `06-history/decisions.md` |
| G18 (verification ongoing) | aturan naik status di TRACEABILITY |
