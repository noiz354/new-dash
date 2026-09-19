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

## Kriteria instalasi skill eksternal (bila diajukan lagi)

- Berasal dari sumber tepercaya + terverifikasi (registry/docs resmi), kebutuhan nyata
  dari 5 domain, dependensi terinstal tanpa network tak terduga, dan otorisasi eksplisit user.
