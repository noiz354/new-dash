# Tier 1 — Kecil & Jelas (11 unit)

## T1-1 — F-A11Y: form-field tanpa id/name ×2 (temuan TASK-26)

- Scope: 2 console issue form-field (lihat PROGRESS.md F-A11Y).
- AC: tambah `id`+`name` (atau `aria-label` bila memang uncontrolled-hidden); console CDP 0 issue di route terkait; test tidak pecah.
- Verifikasi: CDP console di route yang sama, reload, hitung issue form-field = 0.

## T1-2 — F-COPY: label fiksi (NotificationsHub + global)

- Scope: `WS-PUSH: 12ms` (debugger), `Live Sync Active`, `Telemetry Bus` → label jujur (`SSE`, `Simulated telemetry · demo data`, atau hapus).
- AC: grep `WS-PUSH|Live Sync Active|Telemetry Bus` di `app/ components/ lib/` → nol (atau hanya di docs historis); guard-test absence baru; runtime `/notifications` SSE intact.
- Verifikasi: CDP `/notifications` + grep-test hijau.

## T1-3 — Malformed handover id → 500 (temuan sesi 2026-09-16)

- Fakta: `GET /api/shifts/handovers/<non-uuid>` → 500 INTERNAL; id valid-tapi-unknown → 404 benar.
- AC: tambah validasi uuid di route (400 jujur untuk malformed, 404 tetap untuk unknown); test: malformed→400, unknown→404, valid→200.
- Verifikasi: curl + `npm test` + tidak merusak flow accept/reject T7.

## T1-4 — E.2 konsistensi zod v4

- Scope: ganti sisa `.string().uuid()/.email()` deprecated → `z.uuid()/z.email()`.
- AC: `rg '\.string\(\)\.(uuid|email)\(\)' app lib components` → nol; tsc + test hijau.
- Catatan: audit grep per slice; kerjakan sekaligus satu commit.

## T1-5 — E.3 next-env.d.ts churn

- AC: file tak pernah ikut commit (`git status` bersih setelah dev); pertimbangkan git hook `pre-commit` yang me-revert/sanity-check; dokumentasikan di AGENTS.md bila hook ditambah.
- Verifikasi: jalankan dev 60 detik → `git status --porcelain` tidak memuat `next-env.d.ts`.

## T1-6 — E.4 DemoBanner & README per slice

- AC: klaim "simulated" menyusut mengikuti slice yang selesai; checklist: tiap unit Tier ≥3 yang selesai WAJIB menyentuh banner/README bila relevan. Spec ini selesai bila prosedur ditulis di `00-master-spec.md` DoD (SUDAH — tinggalcentang setelah 1 batch Tier 3+ membuktikan kepatuhan).

## T1-7 — E.7 secrets hygiene

- AC: tidak ada `.env` ter-commit; `SEED_TOTP_SECRET`/`SEED_USER_PASSWORD` hanya via env di deployment; `.env.example` lengkap; `git log -- .env` kosong. Satu commit dokumentasi bila kurang.

## T1-8..T1-11 — Fase 1 keputusan stack (4 checkbox TODO, butuh user)

- T1-8: pilih stack produksi (default A: Next.js + Tailwind + shadcn — faktanya SUDAH berjalan; formalkan).
- T1-9: Design System per layar (A desktop vs B field).
- T1-10: folder kode produksi + Tailwind config dari token DESIGN.md.
- T1-11: font lokal + ikon lokal tanpa CDN (terkait woff2 Tier 5 — bila woff2 BLOCKED, putuskan interim ber-CDN dengan label jujur).
- AC per item: keputusan tertulis user + baris PROGRESS + centang TODO. Jika user menunda → status BLOCKED-ON-USER eksplisit, bukan dibiarkan menggantung.

---

## Verdict (dieksekusi 2026-09-17)

| Unit | Verdict | Bukti ringkas |
|---|---|---|
| T1-1 F-A11Y | **PASS** | 6 form-field NotificationsHub punya id+name; tsc+test hijau |
| T1-2 F-COPY | **PASS** | grep 3 label fiksi → nol; widget "Telemetry (demo)"; guard-test absence baru; 167/167 |
| T1-3 malformed handover id | **PASS** | UUID_RE guard di service; 400/404/200 terverifikasi (test+curl); 168/168 |
| T1-4 E.2 zod v4 | **PASS** | 5 sisa → z.uuid()/z.email(); grep nol; hijau |
| T1-5 E.3 next-env churn | **PASS** | status bersih saat dev; hook ci/git-hooks/pre-commit + AGENTS.md §6.11 |
| T1-6 E.4 | **DEFERRED** | selesai stlh 1 batch Tier 3+ bukti kepatuhan (per spec) |
| T1-7 E.7 secrets | **PASS** | git log .env kosong; env-only di prod; README §Secrets & Deployment |
| T1-8..11 | **BLOCKED-ON-USER** | 4 keputusan stack diajukan ke user 2026-09-17 |
