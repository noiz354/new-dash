# Tier 5 — Susah / Terkunci (8 unit)

> Aturan: TIDAK mulai sebelum Wave 3–4 final (SUDAH terpenuhi 2026-09-16).
> Item BLOCKED dikerjakan saat blocker hilang; blocker dicatat eksplisit.

## T5-1 — TASK-27 web push (opt-in P1)

- AC: opt-in eksplisit per user; push terkirim untuk event P1 nyata (uji end-to-end dengan service worker aktif); unsubscribe bersih; tidak ada permission prompt sebelum opt-in.
- Verifikasi: CDP → opt-in → picu event P1 → notifikasi tiba; tolak permission → UI tetap jujur.

## T5-2 — TASK-28 passkeys (role-terbatas)

- AC: registrasi + login passkey untuk role yang diizinkan; fallback TOTP tetap; revoke passkey per user; audit event.
- Verifikasi: register → logout → login passkey → sesi valid; revoke → passkey mati.

## T5-3 — TASK-29 worker CSV (gated bukti RUM longtask)

- GATE: dilarang implementasi sebelum ada bukti RUM longtask (ukur dulu dengan harness T4-6).
- AC: export CSV besar via worker (UI tidak freeze; longtask hilang terukur); fallback main-thread bila worker unsupported + label jujur.

## T5-4 — TASK-30 save-as picker

- AC: File System Access API bila tersedia; fallback download biasa + label jujur bila tidak; tidak ada tombol mati di browser unsupported.

## T5-5 — TASK-FONT + woff2 self-host (BLOCKED: aset font, CDN unreachable dari sandbox)

- AC: Inter/JetBrains Mono/Space Grotesk self-host lokal; `rg 'fonts.googleapis|cdn.tailwindcss'` → nol; build + offline-load hijau.
- Blocker: butuhkan file woff2 (unduh dari mesin ber-internet ATAU keputusan interim T1-11). Status sampai blocker hilang: BLOCKED.

## T5-6 — TASK-22 CSP enforce (butuh ≥1 siklus report bersih)

- AC: mode report-only 1 siklus penuh → 0 pelanggaran legit → enforce; pelanggaran pre-existing (mis. CSP-eval dev-only GAP-09) diselesaikan dulu atau di-allowlist eksplisit tercatat.
- Verifikasi: header enforce aktif + semua route smoke hijau + tidak ada console CSP error.

## T5-7 — A.16 aktivasi CI (BLOCKED: maintainer)

- AC: maintainer salin `ci/ci.yml` → `.github/workflows/ci.yml` (instruksi di header file); pipeline hijau di run pertama.
- Aksi agen: siapkan segalanya + ping maintainer dengan instruksi tempel-siap. Status: BLOCKED-ON-MAINTAINER.

## T5-8 — E.1 advisory drizzle-kit + E.6 hapus folder beku

- E.1: upgrade saat upstream rilis fix (jangan `audit fix --force`); monitor per sprint; gate prod tetap hijau sementara (dev-only).
- E.6: hapus `web/` + `stitch_facility_maintenance_platform_ui/` HANYA atas persetujuan user eksplisit (folder beku AGENTS.md). Status: BLOCKED-ON-USER sampai disetujui.
