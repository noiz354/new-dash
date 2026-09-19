# Skills Evaluation (coding agent + skill, 2026-09-19)

## Agen yang dipakai

Sesi ini berjalan di **opencode** (model Muse Spark). Tidak ada direktori skill di repo
(`.opencode/` tidak ada — terverifikasi). Skill global yang tersedia:
`agents-sdk`, `cloudflare`, `cloudflare-one`, `web-perf`, `workers-best-practices`, `wrangler`.

## Hasil evaluasi per kebutuhan 5 domain Aligner

| Kebutuhan | Skill kandidat | Putusan |
|---|---|---|
| Audit performa/aksesibilitas halaman (pendukung P2 visual) | `web-perf` (global, ada) | LAYAK dievaluasi lanjut — relevan langsung dengan quality gates; belum diuji di repo ini |
| Deploy Cloudflare / Workers / Tunnel | `cloudflare*`, `wrangler`, `agents-sdk` | TIDAK relevan — repo deploy bukan di Cloudflare; jangan install |
| SDD feature-spec workflow (Spec Kit / OpenSpec / Agent Skills) | eksternal, butuh network + `npm` | DITOLAK sementara — instalasi di luar otorisasi; `docs/sdd/` sudah berfungsi sebagai sistem internal |
| Skill repo-lokal (konvensi Aligner: token A/B, guards, audit-trail) | belum ada | PROPOSAL — kandidat pertama bila skill lokal diputuskan (lihat bawah) |

## Keputusan

1. Tidak ada instalasi skill pada tahap ini (sejalan dengan keputusan sesi konsolidasi).
2. Satu-satunya kandidat tindak lanjut: uji `web-perf` terhadap 5 screen kritis E2E
   saat environment browser tersedia (terblokir yang sama dengan E2E: chromium).
3. Bila skill repo-lokal diputuskan, isinya minimal: (a) token Sistem A vs B,
   (b) ConfirmDialog untuk destructive action, (c) pola audit-trail, (d) aturan
   "ID operasional monospace" — keempatnya sudah terdokumentasi di `specs/` dan tinggal
   diformalkan ke format skill yang didukung opencode.

## Instalasi 2026-09-19 (otorisasi network + npm dari user)

1. **Skill repo-lokal `aligner-conventions` — INSTALLED.**
   `.agents/skills/aligner-conventions/SKILL.md` (auto-discovered oleh opencode
   via jalur project agent-compatible; `.opencode/` di-`.gitignore` repo ini
   sehingga skill team-shared ditaruh di `.agents/`).
   Isi: token Sistem A vs B, guards destructive-action (`ConfirmDialog` dari
   `@/components/ui/alert-dialog`), `EmptyState`, pola audit-trail append-only,
   ID operasional monospace, aturan "route-ada ≠ fully-functional".
   Semua path terverifikasi via `ls`/`grep` sesi ini.
2. **OpenSpec (`@fission-ai/openspec` v1.13.1, MIT) — INSTALLED (workflow only).**
   `openspec init --tools agents` non-interaktif: `.agents/skills/openspec-*/`
   (6 workflow skill: propose/apply/archive/update/explore/sync-specs) +
   `openspec/config.yaml` (konteks Aligner terisi) + `openspec/changes/`,
   `openspec/specs/` (kosong). Root `AGENTS.md` TIDAK tersentuh (terverifikasi
   via `git status`). Kebijakan: `openspec/specs/` tetap KOSONG — tidak ada
   migrasi/duplikasi; katalog kanonis tetap `specs/`; `openspec/changes/`
   hanya untuk proposal perubahan ke depan.
3. **Spec Kit (`specify-cli`) — DITOLAK (redundan).** Setelah OpenSpec menutup
   kebutuhan workflow SDD, menginstal sistem paralel kedua (`.specify/`)
   melanggar tujuan konsolidasi satu sistem. Dicatat agar tidak diajukan ulang
   tanpa alasan baru.
4. **Figma MCP (`figma-developer-mcp` v0.13.2, MIT, Framelink third-party —
   BUKAN resmi Figma) — WIRED, DISABLED.** `opencode.json` (root) mendefinisikan
   server `figma` (`--stdio`, `enabled: false`, placeholder key). Mengaktifkan
   butuh: (a) Figma API access token user (ganti `PASTE_FIGMA_API_KEY_HERE`),
   (b) `enabled: true`, (c) file/frame key saat memakai. Catatan keamanan: paket
   komunitas perantara API key — pakai token ber-scope minimum.
5. **`web-perf` (global, pre-installed) — BELUM dijalankan.** Tetap kandidat uji
   performa/aksesibilitas 5 screen kritis; butuh dev server + browser (dibahas
   bersama kerja E2E).

## Kriteria instalasi skill eksternal (bila diajukan lagi)

- Berasal dari sumber tepercaya + terverifikasi (registry/docs resmi), kebutuhan nyata
  dari 5 domain, dependensi terinstal tanpa network tak terduga, dan otorisasi eksplisit user.
