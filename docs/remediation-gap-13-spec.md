# GAP-13 Spec — F6 evidence-serve + F30 rotate-key (CLOSE ALL GAPS)

## F6 — evidence persist-but-unservable → serve ter-otentikasi + UI viewer

**Status kini:** upload POST persist ke `.data/evidence/<orgId>/` + row DB; GET list JSON ada; TIDAK ADA cara mengunduh/melihat file (header route sendiri menandai TODO).

**Perubahan:**
1. `GET /api/work-orders/[id]/evidence/[evidenceId]` baru (`wo.read`):
   - lookup evidence tenant-scoped → 404 `EVIDENCE_NOT_FOUND` bila tak ada.
   - path traversal guard: resolve filePath harus di dalam `EVIDENCE_ROOT/<orgId>/` → 404 bila lolos (fail-closed, jangan bedakan pesan).
   - baca file; bila hilang di disk → 410 `EVIDENCE_FILE_MISSING` jujur (row yatim).
   - verifikasi SHA-256 ulang; mismatch → 500 `EVIDENCE_CORRUPT` (jangan sajikan byte korup).
   - respons: `Content-Type` = mimeType tersimpan, `Content-Length`, `Content-Disposition: inline; filename=…`, `Cache-Control: private, max-age=3600`, `X-Content-Type-Options: nosniff`.
2. UI: `WoChecklist` terima prop `evidence: EvidenceRow[]` (server fetch listWoEvidence di page) + render daftar per task: thumbnail `<img src={download-url}>` (same-origin cookie ikut) + link "Download" + sha256 short + ukuran; bila `enabled=false` daftar tetap tampil (read-only viewing, bukan aksi).
3. Test: upload PNG 1px → GET kembali byte-identik + header; 404 lintas-tenant; 404 id-asing.

## F30 — rotate-key toast fiksi → API key management nyata

**Status kini:** tombol `Rotate Key` hanya toast; tidak ada tabel/endpoint key.

**Perubahan (scope jujur: lifecycle management nyata; enforcement via key di gateway = follow-up eksplisit):**
1. Tabel `api_keys`: `{organizationId, id (AK-…), name, keyHash sha256, last4, createdBy, expiresAt, revokedAt, createdAt}` + index org.
2. `lib/services/api-key-service.ts`: `listApiKeys` (tanpa secret), `createApiKey` (secret `ak_live_<32 hex>` via randomBytes, simpan hash; respons secret SEKALI), `revokeApiKey` (set revokedAt + audit `API_KEY_REVOKE`), create audit `API_KEY_CREATE`. Secret TIDAK PERNAH dibaca kembali (show-once enforced: hanya hash tersimpan).
3. Routes: `GET /api/settings/api-keys` + `POST /api/settings/api-keys {name}` (201 `{id, secret, …}`) + `POST /api/settings/api-keys/[id]/revoke` — semua `settings.manage`.
4. UI ProfileSessions API Access card: daftar keys live (name/last4/created/revoked) + Rotate = create baru + revoke lama lama? TIDAK otomatis — rotate eksplisit: tombol "Generate new key" → tampilkan secret sekali (copy) + tombol "Revoke" per key; copy lama "…9fb4/rotated at seeding" DIHAPUS; copy jujur: "Keys authenticate programmatic access once the API gateway slice enforces them — lifecycle (issue/revoke) is live."
5. Test: create → secret format + list tanpa secret + revoke → revokedAt + create kedua tak bocorkan secret pertama.
6. RBAC: `settings.manage` sudah mencakup (Admin/Director) — tanpa permission baru.

## Out of scope

- Enforcement `Authorization: Bearer ak_live_` di withRoute (butuh desain gateway; dicatat follow-up, bukan klaim).
- Upload dari WoChecklist (RunChecklist sudah cover; viewer dulu).
- Migrasi DB manual — via `npm run db:generate` + `db:setup` idempoten (pola GAP-3/9/12).
