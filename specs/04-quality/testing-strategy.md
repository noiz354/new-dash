# Testing Strategy

> Status: ✅ implemented (unit/integration/audit-truthfulness) + 🔶 partial (e2e Playwright ada tapi exec blocked-by-env).

## Piramida test

| Lapisan | Lokasi | Cakupan |
|---|---|---|
| Unit | `tests/unit/` | services: work-order-service, service-request-service, inspection-service, inventory-service, procurement-service, validation, windowing |
| Integration | `tests/integration/` | API routes + DB (PGlite) |
| Audit-truthfulness | `tests/audit-truthfulness/` | klaim audit vs kode (mencegah fabrikasi) |
| E2E | `tests/e2e/*.spec.ts` (Playwright) | alur browser; **exec blocked-by-env** (sandbox tanpa browser/driver) |

## Kebijakan

- Setiap service domain wajib punya unit test pasangan (`tests/unit/<domain>-service.test.ts`).
- Setiap klaim audit besar wajib punya pasangan truthfulness test.
- E2E dijalankan di CI / mesin developer (bukan sandbox ini).
- Truthfulness: test boleh gagal bila kode berubah — itu sinyal, bukan noise. Perbaiki kode atau klaim, jangan hapus test.
