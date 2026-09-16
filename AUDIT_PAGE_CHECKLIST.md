# Panduan Pengecekan Lengkap Halaman Audit, Inspeksi, Operasi, Dokumen & API
Apex Ops CMMS (`new-dash`)

Dokumen ini memetakan seluruh file dan perintah (*commands*) yang siap diperiksa dan diverifikasi oleh coding agent Anda tanpa ada satu pun halaman atau alur yang tertinggal (**100% covered, zero missing page, zero dead link, zero empty-state roadblocks**).

---

## 1. Matriks Seluruh Route, Komponen & REST API

### A. Governance, Security, Search & Audit Trail
| Route URL / Endpoint | Jenis Tampilan | File Page / Handler | Komponen Utama | Keterangan & Fitur |
|---|---|---|---|---|
| `/audit-trail` | Desktop Hub | `app/(ops)/audit-trail/page.tsx` | `components/audit/AuditTrail.tsx` | Hub Audit Trail Desktop: 4 KPI, Split 7/5, Formatted Diff vs Raw JSON, Proof bar, Session envelope, Merkle widget. |
| `/audit-trail/[id]` | Event Permalink | `app/(ops)/audit-trail/[id]/page.tsx` | Server Permalink View | Dedicated proof certificate dossier untuk single audit event ID + visual diff + session envelope. |
| `/audit-logs` | Redirect / Alias | `app/(ops)/audit-logs/page.tsx` | Redirects to `/audit-trail` | Mencegah 404 dari URL alternatif rancangan awal. |
| `/organization` | Organization Hub | `app/(ops)/organization/page.tsx` | `components/org/OrgHub.tsx` | Roster personil, matriks izin ROLES6 dari `rbac.ts`, sinkronisasi SCIM, dan provisioning user live ke database. |
| `/organization/users/[id]` | User Security Dossier | `app/(ops)/organization/users/[id]/page.tsx` | Server/Client View | Profil mendalam personil, verifikasi MFA/FIDO2 hardware, riwayat sesi aktif, dan append-only activity ledger. |
| `/settings/jobs` | System Job History | `app/(ops)/settings/jobs/page.tsx` | Server/Client View | Histori eksekusi job administratif: snapshot backup S3, simulasi restore point-in-time, seed reset, dan rotasi kredensial. |
| `/ui-patterns` | Design System Matrix | `app/(ops)/ui-patterns/page.tsx` | Interactive QA Gallery | Matriks varian state: empty state, validasi form, SLA countdown, stopwatch teknisi, dan critical action dialog. |
| `GET /api/search` | Fast Multi-Entity Search | `app/api/search/route.ts` | Server Route Handler | Pencarian instan Command Palette ⌘K lintas Work Orders, Service Requests, Assets, dan Inventory Parts (tenant-scoped). |
| `GET/POST /api/organization/users` | User CRUD API | `app/api/organization/users/route.ts` | Server Route Handler | Daftar personil tenant, undangan/pembuatan user baru dengan penetapan role 6 kanon dan audit logging. |
| `PATCH /api/organization/users/[id]` | User Role & Active API | `app/api/organization/users/[id]/route.ts` | Server Route Handler | Perubahan peran (role assignment) atau deaktivasi akun pengguna dengan pencatatan audit forensik. |
| `GET /api/audit-trail` | Backend REST API | `app/api/audit-trail/route.ts` | Server Route Handler | Mengembalikan event log append-only dengan server-side pagination (`limit`, `offset`), filter `entityType`, serta rentang tanggal (`from`, `to`). |
| `POST /api/audit-trail/verify-root` | Backend REST API | `app/api/audit-trail/verify-root/route.ts` | Server Route Handler | Verifikasi konsensus kriptografis root Merkle (#892,104, 0 mismatches). |

### B. Core Operations: Field Inspections, Findings & Auto-WO Conversion
| Route URL / Endpoint | Jenis Tampilan | File Page / Handler | Komponen Utama | Keterangan & Fitur |
|---|---|---|---|---|
| `/field-inspections` | Desktop Hub | `app/(ops)/field-inspections/page.tsx` | `components/field/FieldInspectionsHub.tsx` | Desktop Hub Screen 5 Stitch: 4 Bento KPI, Scheduled Queue Table, Template Builder & Criteria Designer, SCADA Gateway. |
| `/field-inspections/[id]` | Inspection Detail | `app/(ops)/field-inspections/[id]/page.tsx` | Detail View | Detail protokol inspeksi, rincian checkpoint, status due, dan tautan eksekusi. |
| `/field-inspections/new` | Dispatch New Audit | `app/(ops)/field-inspections/new/page.tsx` | Form Dispatch | Form dispatch audit baru dengan prefill lokasi dan aset dari facility/registry. |
| `/field` | Ops Shell Redirect | `app/(ops)/field/page.tsx` | Redirect Alias | Mengarahkan akses `/field` pada shell desktop ke `/field-inspections`. |
| `/field/audits` | Mobile Companion | `app/(field)/field/audits/page.tsx` | `components/field/AuditQueue.tsx` | Antrean mobile My Audits teknisi lapangan (System B). |
| `/field/audits/[id]/run` | Mobile Checklist Run | `app/(field)/field/audits/[id]/run/page.tsx` | `components/field/RunChecklist.tsx` | Eksekusi checklist mobile: step verification, PIN guard, photo capture, IoT reading. |
| `/field/findings` | Desktop Desk List | `app/(ops)/field/findings/page.tsx` | Findings List View | Daftar temuan gagal/defek inspeksi yang menunggu triase konversi ke Work Order. |
| `/field/findings/[id]` | Conversion Desk | `app/(ops)/field/findings/[id]/page.tsx` | `components/field/FindingDesk.tsx` | Meja kerja konversi temuan (FND-2026-0188) menjadi Work Order terdisposisi. |
| `/field/findings/new` | Mobile Defect Capture | `app/(field)/field/findings/new/page.tsx` | `components/field/FindingCapture.tsx` | Route first-class mobile untuk pencatatan temuan bahaya/defek langsung di lapangan. |
| `/field/sync` | Mobile Sync Queue | `app/(field)/field/sync/page.tsx` | `components/field/SyncStatus.tsx` | Status antrean sinkronisasi offline PWA, retry Idempotency-Key, dan partial failure recovery. |
| `GET /api/inspections` | Backend REST API | `app/api/inspections/route.ts` | Server Route Handler | Mengambil daftar jadwal inspeksi lapangan dari database PostgreSQL. |
| `POST /api/inspections/[id]/force-dispatch` | Backend REST API | `app/api/inspections/[id]/force-dispatch/route.ts` | Server Route Handler | Melakukan force dispatch pada audit yang berstatus overdue. |
| `GET/POST /api/findings` | Backend REST API | `app/api/findings/route.ts` | Server Route Handler | Mengambil dan mencatat temuan defek inspeksi baru secara persisten. |
| `POST /api/findings/[id]/convert` | Auto-WO Conversion API | `app/api/findings/[id]/convert/route.ts` | Server Route Handler | Konversi **satu-kali** temuan defek inspeksi menjadi Work Order resmi (guard idempotensi + 409 bila already converted). |

### C. Alur Operasi, Work Orders, Preventive Maintenance & Procurement
| Route URL / Endpoint | Jenis Tampilan | File Page / Handler | Komponen Utama | Keterangan & Fitur |
|---|---|---|---|---|
| `/work-orders/[id]` | Universal WO Dossier | `app/(ops)/work-orders/[id]/page.tsx` | Live Dossier View | Mendukung **seluruh** Work Order (`WO-2026-0894`, `0881`, `0895`, `0898`, `0902`, `0905`, `0906`..`0909`, dll.) tanpa fallback *empty-state*. |
| `/work-orders/new` | Global Dispatch Flow | `app/(ops)/work-orders/new/page.tsx` | Form Dispatch | Alur create Work Order baru dari TopBar/Command Palette dengan prioritas P1/P2/P3, target SLA, dan LOTO safety toggle. |
| `GET /api/work-orders` | WO List & Filter API | `app/api/work-orders/route.ts` | Server Route Handler | Daftar WO dengan server-side paging (`limit`, `offset`) dan filter (`status`, `priority`, `assetCode`). |
| `GET/POST /api/work-orders/[id]/tasks` | Tasks & Steps API | `app/api/work-orders/[id]/tasks/route.ts` | Server Route Handler | Manajemen checklist berurutan per WO, kunci sekuensial langkah kerja (*sequence lock*), dan pengesahan *photo-gate*. |
| `GET/POST /api/work-orders/[id]/evidence` | Evidence Upload API | `app/api/work-orders/[id]/evidence/route.ts` | Server Route Handler | Pengunggahan dan pengikatan bukti foto/dokumen pada langkah checklist Work Order tertentu dengan hash SHA-256. |
| `/service-requests/[id]` | Universal SR Dossier | `app/(ops)/service-requests/[id]/page.tsx` | `components/requests/ServiceRequestDetail.tsx` | Mendukung **seluruh** Service Request (`SR-2026-0894`, `0142`, `0893`, `0145`, dll.) secara dinamis dan live. |
| `GET /api/service-requests` | SR List & Filter API | `app/api/service-requests/route.ts` | Server Route Handler | Antrean SR dengan server-side paging (`limit`, `offset`) dan filter status. |
| `/notifications` | Live SLA Alerts Hub | `app/(ops)/notifications/page.tsx` | `components/notifications/NotificationsHub.tsx` | Hub alert SLA aktif, peringatan pembobolan batas waktu 60 menit, mark-read, dan engine eskalasi SMS/Email. |
| `GET /api/notifications` | Live SLA Alerts API | `app/api/notifications/route.ts` | Server Route Handler | Menghitung alert SLA-at-risk secara dinamis langsung dari kolom `sla_due_at` Work Orders aktif. |
| `/reports` | Reports & BI Hub | `app/(ops)/reports/page.tsx` | `components/reports/ReportsHub.tsx` | Hub laporan operasional & finansial MRO, ringkasan MTTR, rasio kepatuhan SLA, dan tautan dossier. |
| `GET /api/reports/aggregates` | Real MRO Metrics API | `app/api/reports/aggregates/route.ts` | Server Route Handler | Agregat metrik nyata dari database: jumlah WO per status, rasio kepatuhan SLA, total valuasi suku cadang, dan konversi SR. |
| `/reports/[id]` | Analytical Report Dossier | `app/(ops)/reports/[id]/page.tsx` | Report Dossier View | Dossier analitik lengkap: breakdown biaya OPEX, failure modes Pareto ISO 14224, audit log, dan ekspor CSV/PDF. |
| `/facilities/[id]` | Facility Room Detail | `app/(ops)/facilities/[id]/page.tsx` | Room Detail View | Detail ruangan/zona (`B-204`, `ZONE-DC-04`), telemetri lingkungan, aset terpasang, dan tombol `Dispatch Room Audit`. |
| `/inventory/[sku]` | Inventory Movement Ledger | `app/(ops)/inventory/[sku]/page.tsx` | SKU Ledger View | Detail SKU suku cadang (`PART-SEAL-8821`, dll.), saldo stok crib bay, dan histori pergerakan ledger. |
| `GET /api/parts` | Inventory Query API | `app/api/parts/route.ts` | Server Route Handler | Daftar suku cadang dengan saldo on-hand, reserved, bin lokasi, filter `lowStockOnly`, dan server-side paging. |
| `POST /api/parts/movements` | Backend REST API | `app/api/parts/movements/route.ts` | Server Route Handler | Mutasi stok transaksional (ISSUE ke WO, RECEIVE dari PO, ADJUST, RESERVE) dengan Idempotency-Key. |
| `/preventive-maintenance` | PM Automation Hub | `app/(ops)/preventive-maintenance/page.tsx` | `components/pm/PmHub.tsx` | Hub otomatisasi PM, pemantauan countdown due, simulasi beban kerja teknisi, dan batch auto-dispatch. |
| `/preventive-maintenance/[id]` | PM Rule Detail | `app/(ops)/preventive-maintenance/[id]/page.tsx` | PM Rule View | Konfigurasi aturan PM (`PM-CHL-001`), jadwal countdown, staging spare parts, dan WO auto-generation. |
| `GET/POST /api/preventive-maintenance` | PM Rules API | `app/api/preventive-maintenance/route.ts` | Server Route Handler | Mengambil daftar aturan pemeliharaan berkala serta pendefinisian aturan interval baru. |
| `POST /api/preventive-maintenance/[id]/generate` | PM Generator API | `app/api/preventive-maintenance/[id]/generate/route.ts` | Server Route Handler | Pemicu pembuatan otomatis Work Order terjadwal dari aturan PM aktif dengan Idempotency-Key. |
| `/purchasing` | Purchasing & POs Hub | `app/(ops)/purchasing/page.tsx` | `components/purchasing/PurchaseList.tsx` | Hub procurement, dokumen PR dan PO, filter, status penerimaan parsial, dan formulir pengajuan PR. |
| `GET/POST /api/purchasing` | Procurement API | `app/api/purchasing/route.ts` | Server Route Handler | Mengambil daftar dokumen pembelian (dengan server-side paging & filter `kind`/`status`), serta pembuatan PR baru. |
| `POST /api/purchasing/grn` | Goods Receipt Note API | `app/api/purchasing/grn/route.ts` | Server Route Handler | Penerimaan fisik barang di dermaga (Dock Bay 02), verifikasi barcode waybill, dan penambahan otomatis stok inventaris. |
| `/purchasing/[id]` | Universal PO/PR Dossier | `app/(ops)/purchasing/[id]/page.tsx` | `components/purchasing/PurchaseDetail.tsx` | Mendukung **seluruh** PO & PR (`PO-2026-0302`, `PO-2026-0285`, `PO-2026-0315`, `PR-2026-0314`, `PR-2026-0309`, `PR-2026-0295`), 3-way match, dan receiving. |
| `/purchasing/invoices/[id]` | 3-Way Match Reconcile | `app/(ops)/purchasing/invoices/[id]/page.tsx` | Invoice Match View | Rekonsiliasi tiga pilar: PO commitment vs Dock GRN receipt vs Vendor invoice dengan deteksi diskrepansi otomatis. |
| `/vendors/[id]` | Universal Vendor Profile | `app/(ops)/vendors/[id]/page.tsx` | `components/vendors/VendorDetail.tsx` | Mendukung **seluruh** vendor seeded (`abb-grid-power-automation`, `siemens-building-technologies`, `johnson-controls-tyco-fire`, `grainger-industrial-supply`), deteksi MSA kedaluwarsa & lock dispatch. |
| `/vendors/contracts/[id]` | MSA Contract Lifecycle | `app/(ops)/vendors/contracts/[id]/page.tsx` | Contract Dossier View | Siklus hidup kontrak MSA vendor, kuorum tanda tangan resmi, addendum/amandemen, dan tautan pembuktian forensik. |
| `/assets/[id]/bim` | Universal BIM Schematic | `app/(ops)/assets/[id]/bim/page.tsx` | `components/assets/AssetBim.tsx` | Skematik BIM & telemetri sensor untuk seluruh aset registri (`AST-HVAC-001`, `AST-ELEC-002`, `AST-FIRE-003`, dll.). |
| `/assets/[id]/documents/[docId]` | Technical Doc Lifecycle | `app/(ops)/assets/[id]/documents/[docId]/page.tsx` | Asset Document View | Buku manual O&M teknis, sertifikat garansi OEM, dan skematik elektrikal as-built dengan hash SHA-256. |
| `/shifts/plan` | Shift Handover Protocol | `app/(ops)/shifts/plan/page.tsx` | `components/shifts/ShiftPlan.tsx` | Protokol serah-terima shift A→B, dialog penolakan (alasan diskrepansi LOTO), peringatan stale handover, dan buku besar histori shift. |
| Komponen Bersama | Critical Action Pattern | — | `components/ui/critical-action-dialog.tsx` | Pola dialog aksi kritis: Confirm + Loading + Success/Failure + Audit permalink, varian alasan wajib, PIN sekuriti, dan spend approval. |

### D. Dokumen Cetak Standar Industri (Print Templates)
| Route URL | Jenis Tampilan | File Page | Keterangan & Fitur |
|---|---|---|---|
| `/work-orders/[id]/print` | WO Travel Pack | `app/work-orders/[id]/print/page.tsx` | Cetak lembar kerja eksekusi lapangan: barcode 1D, langkah checklist fisik, suku cadang BOM ter-staging, dan kotak ttd fisik teknisi/supervisor. |
| `/permits/[id]/print` | Work Permit (PTW) | `app/permits/[id]/print/page.tsx` | Cetak izin kerja keselamatan: verifikasi LOTO, isolasi zero-energy 0.00V, kepatuhan K3/OSHA, dan ttd fisik tiga pihak (teknisi, safety, manajer). |
| `/badges/[id]/print` | ID Badge & QR (CR80) | `app/badges/[id]/print/page.tsx` | Cetak kartu identitas personil standar CR80 (depan-belakang) dengan RFID, level clearance SCADA, QR kode bukti SHA-256, dan kontak darurat. |
| `/purchasing/[id]/print` | PO Batch Dossier | `app/purchasing/[id]/print/page.tsx` | Cetak PO resmi pengadaan suku cadang dengan nomor waybill, line items, dan status kuorum persetujuan. |

### E. Security, Sessions, Onboarding, Billing, Queue, Telemetry & Health Probes
| Modul / Endpoint | Path File | Keterangan & Fitur |
|---|---|---|
| Postgres Cutover & Migrasi (Phase 1 A.15) | `docs/POSTGRES_MIGRATION_CUTOVER.md` | Panduan cutover dari driver PGlite ke Hosted PostgreSQL (Neon / Supabase / AWS RDS), konfigurasi environment variables, migrasi skema, dan verifikasi pasca-cutover. |
| Multi-Region & Read Replica (Phase 4 D.1/D.5) | `lib/db/replicas.ts` | Router koneksi database untuk pemisahan beban baca analitik berat (*read-write splitting*) ke read-replicas cluster terdekat. |
| Multi-Instance Rate Limiting (Phase 1 A.12) | `lib/auth/limits.ts` | Tabel `rate_limits` di database dengan eksekusi atomik `UPSERT` (`rateLimitShared`), aman untuk multi-instance cluster, fallback otomatis ke in-memory sliding window. |
| Background Queue & DLQ (Phase 4 D.2) | `app/api/queue/jobs/route.ts` | Antrean proses asinkron latar belakang (`lib/queue/worker.ts`): retry otomatis dengan *exponential backoff*, pengarsipan *Dead Letter Queue* (DLQ), eksekusi manual via trigger `run_cycle`, dan retry tugas gagal. |
| HTTP ETag Caching Engine (Phase 4 D.3) | `lib/api/etag.ts` | Komputasi deterministik SHA-1 ETag untuk caching response JSON dan evaluasi header `If-None-Match` (mengembalikan status `304 Not Modified` untuk hemat bandwidth). |
| OTel W3C Tracing & Pino Logs (Phase 2 B.1) | `lib/log.ts` & `lib/api/http.ts` | Propagasi header W3C `traceparent` (`00-{traceId}-{spanId}-01`), korelasi requestId dengan trace_id, dan structured JSON logging tersinkronisasi. |
| SCADA Telemetry Ingestion (Phase 4 D.6) | `app/api/telemetry/ingest/route.ts` | Pemasukan data pembacaan sensor fisik SCADA/Modbus real-time (`lib/services/telemetry-service.ts`): getaran (vibration), suhu (temp), kebocoran refrigeran (ppm), tegangan tinggi (kV), dan picu alarm bahaya otomatis jika melebihi batas toleransi. |
| Retention Loop & Ops Digest (Phase 3 C.5) | `app/api/retention/digest/route.ts` | Ringkasan digest operasional terjadwal (`lib/services/retention-service.ts`): daftar ancaman breach SLA $< 240$m, jadwal pemeliharaan preventif mendatang, dan skor kesehatan fasilitas. |
| Product Analytics & Funnel (Phase 3 C.3) | `lib/telemetry/analytics.ts` | Pelacakan kejadian funnel pengguna dan milestone aktivasi SaaS (`signup_completed`, `work_order_created`, `work_order_closed`). |
| RED Metrics & APM Telemetry (Phase 2 B.3) | `app/api/telemetry/metrics/route.ts` | Pengukuran Rate, Errors, dan Duration (ms & p95 latency) per route secara real-time via `lib/telemetry/metrics.ts` terintegrasi langsung di layer routing `withRoute`. |
| Billing & Entitlements (Critical Path #5) | `app/api/billing/route.ts` & `app/api/billing/webhook/route.ts` | Manajemen langganan SaaS (`lib/services/billing-service.ts`): checkout session, pemrosesan webhook Stripe idempoten, penegakan limit kuota aset/user per plan (Community, Growth, Enterprise), masa tenggang dunning `PAST_DUE`, dan downgrade otomatis. |
| Tenant Onboarding API (Critical Path #1) | `app/api/auth/signup/route.ts` | Multi-tenant self-service signup (`lib/services/onboarding-service.ts`): inisialisasi urutan sequence numbering, akun Enterprise Admin pertama, dan cookie sesi otomatis. |
| Organization Activation (Critical Path #2) | `lib/services/wo-service.ts` | Penutupan Work Order pertama (`wo.complete`) mengesahkan kolom `organizations.activated_at` dan menerbitkan event aktivasi audit. |
| Hardened Hash-Chain Verification | `app/api/audit-trail/verify-chain/route.ts` | Verifikasi berantai SHA-256 seluruh entri audit log append-only dari blok genesis hingga state mutakhir (*zero tampering*). |
| Session Hardening & Revoke All | `app/api/auth/sessions/route.ts` | Pembacaan sesi aktif pengguna dan tombol darurat *"Sign out all devices"* yang mencabut seluruh token sesi aktif user sekaligus. |
| Offline Outbox Queue | `lib/offline/outbox.ts` | Manajemen antrean mutasi offline PWA di browser, pelacakan retry aman dengan `Idempotency-Key` sama (*zero duplicates*). |
| Vendor Escalation Service | `lib/services/notification-service.ts` | Disposisi notifikasi eskalasi vendor saat SLA kritis mendekati batas pelanggaran, pencatatan jejak audit forensik. |
| Session Anti-CSRF Token | `lib/auth/csrf.ts` | Pembuatan dan validasi double-submit token anti-CSRF kriptografis HMAC-SHA256 terikat sesi token pengguna. |
| Deep Readiness Health Probe | `app/api/health/route.ts` | Pemeriksaan kesehatan mendalam: eksekusi query database (`SELECT 1`), latensi DB ms, memori RSS/Heap, dan uptime runtime server. |



---

## 2. Command Pemeriksaan untuk Coding Agent Anda

### 2.1 Git Status Seluruh Berkas
```bash
# Periksa semua berkas yang telah dibuat dan diperbarui
git status --short
```

### 2.2 Pengecekan Domain Governance, Keamanan & UI Matrix
```bash
# 1. Cek komponen utama AuditTrail (4 KPI, Split 7/5, Inspector, Dialogs)
cat components/audit/AuditTrail.tsx | head -n 80

# 2. Cek endpoint search multi-entity & integrasi Command Palette
cat app/api/search/route.ts
grep -n -C 5 "searchResults" components/ops/CommandPalette.tsx

# 3. Cek endpoint User CRUD & Org Hub provisioning
cat app/api/organization/users/route.ts
cat app/api/organization/users/\[id\]/route.ts
grep -n -C 5 "api/organization/users" components/org/OrgHub.tsx

# 4. Cek permalink event detail
cat app/\(ops\)/audit-trail/\[id\]/page.tsx

# 5. Cek user security dossier
cat app/\(ops\)/organization/users/\[id\]/page.tsx | head -n 80

# 6. Cek settings jobs history
cat app/\(ops\)/settings/jobs/page.tsx | head -n 80

# 7. Cek shared critical action dialog pattern
cat components/ui/critical-action-dialog.tsx | head -n 80

# 8. Cek UI State Matrix gallery
cat app/\(ops\)/ui-patterns/page.tsx | head -n 80
```

### 2.3 Pengecekan Domain Field Inspections & Defect Triaging
```bash
# 9. Cek service inspeksi & konversi temuan (Slice 6)
cat lib/services/inspection-service.ts | head -n 100

# 10. Cek endpoint auto-WO conversion dari finding
cat app/api/findings/\[id\]/convert/route.ts

# 11. Cek komponen desktop hub Field Inspections (Screen 5 Stitch)
cat components/field/FieldInspectionsHub.tsx | head -n 80

# 12. Cek mobile finding capture & bottom nav integration
cat components/field/FindingCapture.tsx | head -n 60
cat app/\(field\)/field/findings/new/page.tsx
grep -n -C 2 "findings/new" components/field/FieldShell.tsx

# 13. Cek desktop findings list & auto-WO conversion desk
cat app/\(ops\)/field/findings/page.tsx | head -n 60
cat app/\(ops\)/field/findings/\[id\]/page.tsx | head -n 60

# 14. Cek API endpoints inspeksi dan temuan
cat app/api/inspections/route.ts
cat app/api/inspections/\[id\]/force-dispatch/route.ts
cat app/api/findings/route.ts
```

### 2.4 Pengecekan Universal Work Orders, Tasks, PM, Procurement & Inventory
```bash
# 15. Cek server-side paging & filter di route handlers
grep -n -C 3 "searchParams" app/api/audit-trail/route.ts
grep -n -C 3 "searchParams" app/api/work-orders/route.ts
grep -n -C 3 "searchParams" app/api/service-requests/route.ts
grep -n -C 3 "searchParams" app/api/parts/route.ts
grep -n -C 3 "searchParams" app/api/purchasing/route.ts

# 16. Cek endpoint notifications & reports aggregates
cat app/api/notifications/route.ts
cat app/api/reports/aggregates/route.ts

# 17. Cek skema pm_rules & service otomatisasi PM (Slice 8)
grep -n -C 5 "pmRules" db/schema.ts
cat lib/services/pm-service.ts | head -n 100
cat app/api/preventive-maintenance/route.ts
cat app/api/preventive-maintenance/\[id\]/generate/route.ts

# 18. Cek skema po_line_items & goods_receipt_notes (Slice 7)
grep -n -C 5 "poLineItems" db/schema.ts
grep -n -C 5 "goodsReceiptNotes" db/schema.ts
cat lib/services/procurement-service.ts | head -n 100
cat app/api/purchasing/route.ts
cat app/api/purchasing/grn/route.ts

# 19. Cek skema wo_tasks dan evidence di database (Slice 5)
grep -n -C 5 "woTasks" db/schema.ts
grep -n -C 5 "evidence" db/schema.ts
cat lib/services/task-service.ts | head -n 100
cat app/api/work-orders/\[id\]/tasks/route.ts
cat app/api/work-orders/\[id\]/evidence/route.ts

# 20. Cek inventory service & endpoints mutasi stok (Slice 4)
cat lib/services/inventory-service.ts | head -n 100
cat app/api/parts/route.ts
cat app/api/parts/movements/route.ts

# 21. Cek universal work order dossier coverage
cat app/\(ops\)/work-orders/\[id\]/page.tsx | head -n 120

# 22. Cek universal service request dossier coverage
cat app/\(ops\)/service-requests/\[id\]/page.tsx | head -n 100

# 23. Cek 3-way match invoice reconciliation dossier
cat app/\(ops\)/purchasing/invoices/\[id\]/page.tsx | head -n 100

# 24. Cek MSA contract lifecycle dossier
cat app/\(ops\)/vendors/contracts/\[id\]/page.tsx | head -n 100

# 25. Cek Asset technical document lifecycle
cat app/\(ops\)/assets/\[id\]/documents/\[docId\]/page.tsx | head -n 100

# 26. Cek universal purchasing PO & PR dossier
cat components/purchasing/PurchaseDetail.tsx | head -n 100
cat app/\(ops\)/purchasing/\[id\]/page.tsx

# 27. Cek universal vendor detail & expired MSA lock
cat components/vendors/VendorDetail.tsx | head -n 100
cat app/\(ops\)/vendors/\[id\]/page.tsx

# 28. Cek universal BIM schematics
cat app/\(ops\)/assets/\[id\]/bim/page.tsx
cat app/\(ops\)/assets/\[id\]/page.tsx | head -n 100

# 29. Cek shift handover & rejection protocol
cat components/shifts/ShiftPlan.tsx | head -n 100

# 30. Cek global work order dispatch flow
cat app/\(ops\)/work-orders/new/page.tsx | head -n 80

# 31. Cek facility room & zone detail
cat app/\(ops\)/facilities/\[id\]/page.tsx | head -n 80

# 32. Cek inventory movement ledger
cat app/\(ops\)/inventory/[sku]/page.tsx | head -n 80

# 33. Cek report analytical dossier
cat app/\(ops\)/reports/\[id\]/page.tsx | head -n 80

# 34. Cek PM plan detail
cat app/\(ops\)/preventive-maintenance/\[id\]/page.tsx | head -n 80
```

### 2.5 Pengecekan Template Dokumen Cetak Fisik
```bash
# 35. Cek Work Order travel pack cetak
cat app/work-orders/\[id\]/print/page.tsx | head -n 80

# 36. Cek Permit to Work (PTW) cetak
cat app/permits/\[id\]/print/page.tsx | head -n 80

# 37. Cek Personnel Badge / QR cetak
cat app/badges/\[id\]/print/page.tsx | head -n 80
```

### 2.6 Pengecekan Onboarding, Hash-Chain, Billing, Sessions, Offline Outbox & Deep Readiness
```bash
# 38. Cek multi-tenant onboarding service & signup endpoint (Critical Path #1)
cat lib/services/onboarding-service.ts | head -n 80
cat app/api/auth/signup/route.ts

# 39. Cek billing & stripe webhook subscription engine (Critical Path #5)
grep -n -C 5 "subscriptions" db/schema.ts
cat lib/services/billing-service.ts | head -n 80
cat app/api/billing/route.ts
cat app/api/billing/webhook/route.ts

# 40. Cek hash-chain audit verification endpoint (Phase 2 B.4)
cat app/api/audit-trail/verify-chain/route.ts
grep -n -C 5 "verifyAuditHashChain" lib/services/audit-service.ts

# 41. Cek session hardening & sign-out-all-devices endpoint (Phase 2 B.6)
cat app/api/auth/sessions/route.ts
grep -n -C 5 "revokeAllUserSessions" lib/auth/session.ts

# 42. Cek offline outbox queue manager (Phase 1 A.10)
cat lib/offline/outbox.ts | head -n 60

# 43. Cek panduan cutover Hosted PostgreSQL & read-replica router (Phase 1 A.15 & Phase 4 D.1/D.5)
cat docs/POSTGRES_MIGRATION_CUTOVER.md | head -n 60
cat lib/db/replicas.ts

# 44. Cek multi-instance rate limiting engine (Phase 1 A.12)
grep -n -C 5 "rateLimits" db/schema.ts
cat lib/auth/limits.ts

# 45. Cek background queue worker & DLQ engine (Phase 4 D.2)
cat lib/queue/worker.ts | head -n 60
cat app/api/queue/jobs/route.ts

# 46. Cek HTTP ETag caching engine (Phase 4 D.3)
cat lib/api/etag.ts

# 47. Cek OTel W3C traceparent logging (Phase 2 B.1)
cat lib/log.ts | head -n 60
grep -n -C 3 "traceparent" lib/api/http.ts

# 48. Cek SCADA telemetry ingestion & safety thresholds (Phase 4 D.6)
grep -n -C 5 "sensorReadings" db/schema.ts
cat lib/services/telemetry-service.ts | head -n 60
cat app/api/telemetry/ingest/route.ts

# 49. Cek retention digest & ops loop (Phase 3 C.5)
cat lib/services/retention-service.ts | head -n 60
cat app/api/retention/digest/route.ts

# 50. Cek product analytics funnel tracking (Phase 3 C.3)
cat lib/telemetry/analytics.ts | head -n 60

# 51. Cek telemetry RED metrics engine (Phase 2 B.3)
cat lib/telemetry/metrics.ts
cat app/api/telemetry/metrics/route.ts

# 52. Cek vendor escalation service & CSRF
cat lib/services/notification-service.ts
cat lib/auth/csrf.ts

# 53. Cek deep readiness & liveness probe
cat app/api/health/route.ts
```

---

*Seluruh ekosistem CMMS kini telah beroperasi penuh, tanpa dead link atau missing page, siap untuk diverifikasi oleh coding agent Anda.*
