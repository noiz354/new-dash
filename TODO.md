# TODO.md — Rencana Kerja

## Fase 0 — Fondasi ✅ (selesai 2026-09-13)

- [x] Ekstrak zip ke `stitch_facility_maintenance_platform_ui/`
- [x] Inventarisasi 20 layar (`docs/INVENTORY.md`)
- [x] Tulis `AGENTS.md`, `PROGRESS.md`, `TODO.md`, `README.md`

## Fase Audit UI (20/20) ✅ Selesai — template `docs/PROMPT_UI_AUDIT.md` (v2 Architect)

- [x] Simpan template prompt audit (`docs/PROMPT_UI_AUDIT.md`) — v2: 6 seksi (+ Navigasi, + Missing Pages, kolom Trigger)
- [x] Audit `operations_dashboard` → `docs/ui-audit/operations-dashboard.md` (dimigrasi ke v2)
- [x] Navigation audit global → `docs/ui-audit/navigation-audit.md` (sitemap + 14 missing pages)
- [x] Audit 19 layar sisa, satu file per layar di `docs/ui-audit/`:
  - [x] `work-order-management-execution-hub` → `work-orders.md`
  - [x] `service-requests-triage-hub` → `service-requests.md`
  - [x] `asset-registry-lifecycle-management-ledger` → `asset-registry.md`
  - [x] `asset-detail-spare-parts-inventory-ledger` → `asset-detail.md`
  - [x] `preventive-maintenance-scheduling-automation-hub` → `preventive-maintenance.md`
  - [x] `field-inspections-audit-queue-hub` → `field-inspections.md`
  - [x] `inspection-findings-auto-wo-conversion-desk` → `findings-conversion.md`
  - [x] `mobile-field-inspection-execution-desk` → `mobile-execution.md`
  - [x] `facility-locations-spatial-hierarchy-management` → `facilities.md`
  - [x] `inventory-spare-parts-management-ledger` → `inventory.md`
  - [x] `purchasing-pos-management-hub` → `purchasing.md`
  - [x] `vendors-contractors-management-hub` → `vendors.md`
  - [x] `organization-rbac-governance-hub` → `organization-rbac.md`
  - [x] `audit-trail-system-logs-hub` → `audit-trail.md`
  - [x] `notifications-sla-alerts-hub` → `notifications.md`
  - [x] `reports-analytics-hub` → `reports.md`
  - [x] `settings-system-configuration` → `settings.md`
  - [x] `ui-state-variants-patterns` → `ui-state-patterns.md` (komponen reusable)
  - [x] `apex-ops-logo` → `logo.md` (aset/SVG)

## Fase Audit UI Pass-2 (19/19) ✅ Selesai — audit independen + §7 perbandingan di `docs/ui-audit/pass2/`

- [x] Pass-2 batch inti operasi (6): `work-orders.md`, `service-requests.md`, `preventive-maintenance.md`, `field-inspections.md`, `findings-conversion.md`, `mobile-execution.md`
- [x] Pass-2 batch aset & resource (6): `asset-registry.md`, `asset-detail.md`, `facilities.md`, `inventory.md`, `purchasing.md`, `vendors.md`
- [x] Pass-2 batch governance & sistem (7): `reports.md`, `audit-trail.md`, `notifications.md`, `organization-rbac.md`, `settings.md`, `ui-state-patterns.md`, `logo.md`
- [x] Koreksi atas pass-1 dicatat (§7 tiap file): cabut klaim "Kowalski ganda", revisi ui-state-patterns §2, kalibrasi label MISSING→aksi inline

## Handoff Codex ✅ Selesai — `.gitignore` + `CODEX.md` (Fase A–F untuk Codex)

## Fase A — Tutup Kanon ✅ Selesai (2026-09-13)

- [x] C9: bearing SKU — BUKAN konflik (PART-BRG-6204 vs PART-BRG-6205 dua SKU berbeda)
- [x] C10: CHILL-NUSA-04 / WO-0894 / WO-9042 — artefak GUGUR, rewire format penuh
- [x] C12: progres INS-2026-0412 — 65% kanon (hub otoritatif)
- [x] C14: Elena Moreno — persona terpisah [ASUMSI-OTOMATIS]
- [x] Amandemen C3 (tetap $1,450; ledger H1 $1,765) + C4 (tetap Trane) + klausa CANON §5 final

## Fase 1 — Keputusan Stack ⬜ (butuh jawaban user)

- [ ] Pilih stack produksi. Opsi default yang diusulkan:
  - **A (disarankan): Next.js 14 + Tailwind + shadcn/ui** — untuk app multi-layar, routing, state.
  - B: Vite + React + Tailwind — lebih ringan, tanpa SSR.
  - C: Pertahankan HTML statis + build Tailwind CLI — tercepat, tapi tanpa komponen.
- [ ] Tentukan Design System yang dipakai per layar (A desktop vs B field — lihat AGENTS.md §5)
- [ ] Tentukan folder kode produksi (`app/` atau `web/`), inisialisasi proyek + Tailwind config dari token DESIGN.md
- [ ] Setup font (Inter, JetBrains Mono, Space Grotesk) + ikon (Material Symbols / Lucide) secara lokal, tanpa CDN

## Fase Multi-Page Readiness ✅ Selesai — audit dokumen dulu (tanpa generate)

- [x] Audit 4 draf prompt anti-shortcut → `docs/AUDIT_MULTI_PAGE_READINESS.md` (gap analysis, 14 missing pages, wiring per layar, 4 prompt final HTML standalone + Tailwind, urutan eksekusi)
- [x] Spec deep view H1 → `docs/SPEC_WORK_ORDER_DETAIL.md` (gap G8–G13 + prompt Opsi 5 + spec WOD-01…WOD-12 + DoD; HTML menyusul setelah kanonisasi)
- [x] Spec wiring H1–H3 → `docs/SPEC_WIRING_HIGH_PAGES.md` (gap G14–G18 + prompt Opsi 6 + matriks wiring H1/H2/H3 + DoD; snippet per kelompok setelah kanonisasi)
- [x] Kanonisasi data → `docs/CANON_DATA.md` (22 keputusan C1–C22 + format ID + klausa CANON; DITUNDA: C9/C10/C12/C14)
- [x] Gelombang HIGH: H1 `work-order-detail.html` → H2 tiga file field (sistem B) → H3 `purchase-detail.html` (Opsi 3 + Opsi 2, satu halaman per request)
- [x] Gelombang MEDIUM (M1–M3, M6; M4–M5 keputusan desain di `docs/DECISIONS_M4_M5_M6.md`)
- [x] Gelombang Wiring: audit 9 file web/ — DoD rg bersih, semua link resolve kecuali L1/L2 (Fase E)
- [ ] Gelombang LOW (L1–L4) + keputusan stack → Fase E

## Fase Expansion Checklist + Interaction Trees ✅ Selesai — audit mendalam tanpa kode

- [x] Expansion checklist 20 layar → `docs/EXPANSION_CHECKLIST.md` (270 item P1/P2/P3 + bahasan + transisi TERDEFINISI/TAK TERDEFINISI per layar; part: `docs/exp-check/`)
- [x] Interaction trees 20 layar → `docs/INTERACTION_TREES.md` (201 pohon L0→L5 + [POLA-BARU] kandidat kontrak komponen; part: `docs/exp-trees/`)

## Fase 2 — Rebuild Layar (0/20) ⬜

Urutan disarankan (dashboard dulu sebagai kerangka navigasi):

1. [ ] `operations_dashboard` (749 baris) — kerangka sidebar + KPI + command center
2. [ ] `work_order_management_execution_hub` (651) — inti CMMS
3. [ ] `service_requests_triage_hub` (650)
4. [ ] `asset_registry_lifecycle_management_ledger` (858)
5. [ ] `asset_detail_spare_parts_inventory_ledger` (985)
6. [ ] `preventive_maintenance_scheduling_automation_hub` (957)
7. [ ] `field_inspections_audit_queue_hub` (653)
8. [ ] `inspection_findings_auto_wo_conversion_desk` (543)
9. [ ] `mobile_field_inspection_execution_desk` (254, sistem B)
10. [ ] `facility_locations_spatial_hierarchy_management` (773)
11. [ ] `inventory_spare_parts_management_ledger` (725)
12. [ ] `purchasing_pos_management_hub` (719)
13. [ ] `vendors_contractors_management_hub` (727)
14. [ ] `organization_rbac_governance_hub` (1052)
15. [ ] `audit_trail_system_logs_hub` (777)
16. [ ] `notifications_sla_alerts_hub` (701)
17. [ ] `reports_analytics_hub` (868)
18. [ ] `settings_system_configuration` (920)
19. [ ] `ui_state_variants_patterns` (451) — jadikan komponen reusable, bukan halaman
20. [ ] `apex_ops_logo` (7) — jadikan aset/SVG komponen

DoD tiap layar: lihat `AGENTS.md` §8.

## Fase 3 — Integrasi & QA ⬜

- [ ] Routing + navigasi antar-layar sesuai sidebar Stitch
- [ ] State mock → API contract (schema WO, Asset, Inventory, Vendor, RBAC, Audit)
- [ ] Responsif 3 breakpoint + uji kontras status badge
- [ ] Hapus semua CDN Play, ganti build Tailwind proper
