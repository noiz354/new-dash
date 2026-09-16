# Phase 1 — Slice 1: Database, Auth Nyata, dan Flow Work Order PASS

> Status: ✅ selesai di branch `arena/01a09dd4-new-dash` · 2026-09-14
> Rujukan: `docs/AUDIT_SAAS_E2E.md` §K Phase 1 (poin 1–4). Verdict audit: 0 flow PASS → slice ini mengejar PASS pertama.

## 1. Apa yang berubah (sebelum → sesudah)

| Aspek | Sebelum (audit) | Sesudah (slice 1) |
|---|---|---|
| Data | Array hardcode di komponen; refresh = reset | PostgreSQL (PGlite/WASM, repo-lokal) via Drizzle ORM; 16 tabel multi-tenant |
| Auth | Prefill email + `setTimeout` palsu | scrypt password hash + sesi DB (opaque token, sha256 at-rest) + TOTP MFA (RFC 6238) + rate limiting + RBAC |
| API | Tidak ada (semua `/api/*` 404) | 7 route handler dengan envelope `{ok,data,error}`, validasi Zod server-side, CSRF Origin-check, idempotency |
| Guard | 11 halaman 200 tanpa login | `middleware.ts` (cookie presence) + guard server di layout `(ops)`/`(field)` (verifikasi sesi ke DB, fail-closed) |
| Flow WO | Tombol toast palsu, state client-only | State machine 8 status × 7 aksi, transisi transaksional + optimistic guard + event log + audit trail |
| Dashboard | KPI hardcode | KPI dihitung dari rows nyata; SLA compliance `—` sampai ada completion; feed = `work_order_events` nyata |

## 2. Arsitektur

```
Browser
  └─ middleware.ts                     (gate murah: cookie apex_session ada? jika tidak → /login; /api dilewatkan)
      └─ app/(ops)/layout.tsx          (gate sebenarnya: getSessionContext() → verifikasi token ke tabel sessions; gagal → redirect /login)
          └─ page.tsx (server)         (query via lib/services/* — selalu org-scoped dari sesi)
              └─ components (client)   (fetch /api/* untuk mutasi; Idempotency-Key header; router.refresh())

app/api/*/route.ts  →  lib/api/http.ts (withRoute: log, envelope, CSRF, authN+RBAC, error mapping)
                    →  lib/services/*  (logika bisnis transaksional; DomainError)
                    →  db/client.ts    (PGlite singleton globalThis; db/schema.ts Drizzle; db/migrations/)
```

- **Multi-tenancy**: setiap tabel punya `organization_id`; setiap query service difilter oleh `ctx.orgId` dari sesi — bukan dari input klien. Ada tenant decoy (`APX-GL-9021`, `WO-2026-7777`) yang dipakai test isolasi.
- **Idempotency**: mutasi kritis menerima header `Idempotency-Key`; `withIdempotency()` jalan **di dalam transaksi** — replay key+body sama mengembalikan respons tersimpan; key sama body beda → `422 IDEMPOTENCY_KEY_REUSED`.
- **Penomoran WO**: tabel `sequences` (`UPDATE … SET next_val = next_val + 1 … RETURNING`) — atomik, per org per tahun. Manual pertama = `WO-2026-0910` (kanon).
- **State machine** (`lib/domain/work-orders.ts`): OPEN/SCHEDULED/DISPATCHED → start → IN_PROGRESS; hold→ON_HOLD (wajib reason); escalate→ESCALATED (wajib reason); resume→IN_PROGRESS; complete hanya dari IN_PROGRESS; cancel dari non-terminal (wajib reason); assign tidak mengubah status. Guard optimistik: `UPDATE … WHERE status = <current>` → 0 row = `409 WO_STALE_STATE`.

## 3. Auth & keamanan

- **Password**: scrypt N=16384, r=8, p=1, salt 16B acak; format `scrypt$N$r$p$salt$hash` (base64url). Kegagalan login seragam `401 INVALID_CREDENTIALS` (anti-enumerasi) + baris audit.
- **Sesi**: token opaque 32B (crypto.randomBytes); hanya sha256(token) disimpan; cookie `apex_session` httpOnly, SameSite=Lax, secure di prod, 7 hari; `lastSeenAt` disentuh; logout = revoke (delete) + audit.
- **MFA**: TOTP HMAC-SHA1 RFC 6238 (timestep 30s, 6 digit, window ±1). Challenge DB: TTL 5 menit, maks 5 percobaan lalu `429 MFA_LOCKED`, single-use (`consumedAt`). Semua user seed terdaftar TOTP.
  - **Dev hint**: non-production, respons login menyertakan `devHint` = kode TOTP saat ini (secret seed `JBSWY3DPEHPK3PXP`). Mati otomatis saat `NODE_ENV=production` atau `DEMO_MFA_HINT=0`. [ASUMSI-OTOMATIS: demo harus tetap bisa login tanpa authenticator app.]
- **Rate limit** (in-memory sliding window; cukup untuk 1 instance, perlu Redis untuk multi-instance — dicatat sebagai utang Phase 2): login 8/10 menit per email, 24/10 menit per IP.
- **RBAC**: 6 role kanon × peta permission (`lib/auth/rbac.ts`); `withRoute({permission})` menolak `403 FORBIDDEN`; UI juga menyembunyikan aksi (defense in depth, bukan satu-satunya lapis).
- **CSRF**: mutasi (`POST/PATCH/DELETE`) membandingkan header `Origin` vs `Host`; Origin absen (curl/native) diizinkan. Cookie SameSite=Lax lapis kedua. [ASUMSI-OTOMATIS: cukup untuk slice 1; token CSRF per-sesi menyusul kalau ada kebutuhan.]

## 4. API surface

| Method & path | Auth | Catatan |
|---|---|---|
| `POST /api/auth/login` | publik (rate-limited) | → `mfa_required` (+challengeId, devHint non-prod) atau `ok` (+Set-Cookie) |
| `POST /api/auth/mfa` | publik (challenge-scoped) | kode TOTP → sesi; single-use; 5× salah → locked |
| `POST /api/auth/logout` | sesi | revoke + clear cookie |
| `GET /api/auth/session` | sesi | konteks user aktif (untuk debug/klien) |
| `GET /api/health` | publik | `{ok:true,data:{status:'ok'}}` — untuk monitoring |
| `GET /api/work-orders` | `wo.read` | list rows tenant + techs assignable + caps RBAC |
| `POST /api/work-orders` | `wo.create` | create + numbering server + SLA window; Idempotency-Key |
| `POST /api/work-orders/[id]/transitions` | `wo.transition` | state machine; Idempotency-Key; event + audit |

Envelope sukses: `{ok:true,data:{…,requestId}}`. Error: `{ok:false,error:{code,message,details?,requestId}}` dengan HTTP status semantik (400/401/403/404/409/422/429/500/503). Kode error terdokumentasi di §3 memory + `lib/domain/errors.ts`.

## 5. Database & seed

- **Stack**: PGlite 0.5.8 (PostgreSQL 18.3 WASM, data di `.data/pg`, gitignored) + drizzle-orm 0.45.2 + drizzle-kit 0.31.10 (migrasi SQL di `db/migrations/`, committed).
- **Kenapa PGlite**: sandbox tidak punya Postgres server/docker. Skema 100% Postgres-style (uuid PK, timestamptz, FK, unique constraint per org) — migrasi ke Postgres hosted = ganti driver. [ASUMSI-OTOMATIS]
- **Batasan**: single-writer per data dir. `npm run db:setup`/`db:reset` dijalankan dengan dev server STOPPED. Test memakai temp dir sendiri → aman paralel dengan dev server.
- **Seed** (`db/seed.ts`, idempotent): 2 org, 7 user (canon + decoy), 4 aset, parts, 7 WO kanon (SLA relatif terhadap waktu seed), 5 SR, inspeksi+finding, 5 vendor, 5 PO, sequences (WO=910, SR=895, PO=316, INS=1093, FND=189).
- **Kredensial demo**: semua user canon `demo-pass-4821` (prefilled di LoginForm); decoy `decoy-pass-9021`. TOTP via devHint.

## 6. Definisi PASS — bukti flow Work Order

| Kriteria PASS (audit §2) | Bukti |
|---|---|
| Aksi user → state backend benar | Hold/Escalate/Resume/Complete/Cancel/Assign via dialog & list → `transitionWorkOrder()` transaksional |
| Data persisten | PGlite on-disk `.data/pg`; refresh browser / restart dev server → status tetap (re-read via `getWorkOrder`) |
| UI merefleksikan hasil | `router.refresh()` pasca-mutasi → server component re-fetch DB; badge status, hold reason, SLA countdown (dari `sla_due_at` nyata), event feed dashboard |
| Kegagalan terdiagnosis | Envelope error berkode (mis. `WO_INVALID_TRANSITION` 409, `IDEMPOTENCY_KEY_REUSED` 422) tampil di toast/dialog + `requestId` di log server (pino-style `lib/log.ts`) + baris `audit_events` |
| Outcome bisnis | SLA breach terhitung dari due time nyata; penomoran WO kanon; jejak audit per transisi (actor, from/to, reason) |

Test: `npm test` → **28/28 pass** (unit 17: TOTP vektor RFC 6238, scrypt, RBAC, rate limit, state machine, SLA label, request hash; integrasi 11: auth penuh, single-use challenge, logout revoke, isolasi tenant (list/get/mutasi), lifecycle hold→resume→complete + event rows, assign, numbering 0910/0911, idempotency replay/reuse/sequence, persistensi sesi, dashboard KPI).

## 7. Yang JUJUR masih simulasi (label di UI)

- Telemetry chiller, labor stopwatch, Export WO Log (dialog bilang "simulated").
- Checklist Step 01–05, parts ledger, compliance dossier di halaman detail = konten canon (belum tabel DB sendiri — slice 2).
- Notifikasi vendor (escalate mencatat event; email/webhook belum dikirim).
- Command palette ⌘K, pencarian global, halaman `/profile` sessions list: masih statis.
- Rate limit in-memory (reset saat restart; belum multi-instance).
- Foto sign-off: gate lokal (storage evidence slice 2).
- Halaman selain dashboard/work-orders masih data canon statis (asset, SR, inventory, dll. — DB rows sudah di-seed, UI menyusul per slice).

## 8. Runbook dev

```bash
npm install
npm run db:setup     # migrate + seed (dev server STOPPED; idempotent)
npm run dev          # http://localhost:3000 → redirect /login
npm test             # 28 unit+integration (temp PGlite sendiri)
npm run db:reset     # wipe .data/pg lalu setup ulang
```

Login: `m.vance@apexops.io` / `demo-pass-4821` (sudah prefilled) → Continue → kode MFA dari **dev hint** di layar → dashboard.

## 9. Utang teknis / slice berikutnya

1. Slice 2: service requests + inspections flow ke DB (SR→WO conversion nyata), parts ledger + evidence storage, checklist DB-driven.
2. Token bucket rate limit ke storage bersama kalau >1 instance; helmet-style headers; session rotation setelah MFA (sudah: token baru dibuat pasca-MFA).
3. CSRF token per-sesi (kalau ada kebutuhan cross-origin).
4. Migrasi ke Postgres hosted (supabase/neon/self-host) — ganti `db/client.ts` driver saja.
5. Worker untuk export/notifications (dialog Export sudah jujur "simulated background job").
6. Playwright E2E (flow login→hold→refresh) di CI.
