# Decisions (Keputusan Tercatat)

| Tanggal | Keputusan | Konteks |
|---|---|---|
| 2026-09-19 | specs/ pass-1 = observasi, bukan janji | Sesi konsolidasi: tulis hanya yang terlihat di repo |
| 2026-09-19 | Skill eksternal tidak diinstal tanpa otorisasi | Blocker didokumentasikan, bukan dilanggar |
| 2026-09-19 | `page-layout-specs/` dibiarkan (arsip beku) | Untracked; bukan bagian specs/ |
| 2026-09-19 | Nomor modul→route di 03-design adalah rekonstruksi, INVENTORY sumber ukuran | Hindari fabrikasi pemetaan |
| 2026-09-1x | Auth = mock kredensial + session helper (bukan OAuth/JWT) | Tier 1; upgrade = Tier 6 |
| 2026-09-1x | DB = PGlite via Drizzle (bukan Postgres server) | Tier 1; upgrade = Tier 5/6 |
| 2026-09-1x | Sistem A untuk desktop, B untuk field | DESIGN.md; jangan campur |
| 2026-09-19 | Anomali inventory-parts/{tasks,verification}.md = SUPERSEDED, dikarantina di tempat (bukan dihapus) | P0 2026-09-19: GAP-11 = force-dispatch/field-queue (CLOSED 2026-09-16, bukan inventory); `P1S3` nol kemunculan di docs/; truth-map paths fabrikan (yang ada: audit-fe-be/full-app). Isi asli dipertahankan verbatim + koreksi |
| 2026-09-19 | screen-inventory.md ditulis ulang dgn nama folder aktual + route terverifikasi | Tabel lama pakai nama modul lawas yang tidak ada di repo; route tanpa mockup dicatat sebagai backlog Figma |
| 2026-09-19 | 20-vs-21 CLOSED: PNG ke-21 = avatar placeholder (tanpa code.html) | `find`: 20 code.html + 21 PNG; `screen-audits/summary.md` konfirmasi komposisi 18A+1B+2 non-layar |
| 2026-09-19 | Tier bukti: REPORTED → IMPLEMENTED UNVERIFIED → VERIFIED COMPLETE | Naik status wajib TESTED tereksekusi; unit 182/182 pass 2026-09-19; E2E chromium BLOCKED-BY-ENV |
| 2026-09-19 | Skill: hanya `web-perf` kandidat lanjut; lainnya ditolak/tunda | Evaluasi di `specs/05-roadmap/skills-evaluation.md`; tanpa instalasi |

## Aturan pengisian

- Setiap keputusan baru: tambah baris (tanggal, keputusan, konteks).
- Keputusan yang dibatalkan: jangan hapus baris — tambah baris baru "MENCABUT <tanggal>: ...".
