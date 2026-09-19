# Aligner — Konsolidasi Spec-Driven Development (Rencana Induk 2026-09-19)

> Disimpan dari pesan user 2026-09-19. Dokumen ini adalah **permintaan konsolidasi**,
> bukan hasil inventarisasi terverifikasi. Eksekusi dilakukan oleh coding agent
> dengan akses repository lokal.

## Pendekatan

Untuk proyek Aligner, pendekatan yang tepat adalah mengubah seluruh dokumentasi `.md`
yang tersebar menjadi **satu sistem Spec-Driven Development (SDD)** yang mencerminkan
kondisi implementasi sebenarnya, bukan membuat spesifikasi baru yang mengabaikan
fitur yang telah selesai.

Konsolidasi mencakup: dokumentasi, source code, hasil audit screenshot,
riwayat implementasi, pengujian, dan backlog yang masih terbuka.

## 1. Struktur akhir yang dituju (`specs/`)

Satu sumber dokumentasi terstruktur untuk fitur, implementasi, pengujian,
dan pengembangan berikutnya.

```text
specs/
├── README.md
├── 00-product/
│   ├── product-overview.md
│   ├── existing-features.md
│   └── product-requirements.md
├── 01-architecture/
│   ├── system-architecture.md
│   ├── domain-model.md
│   ├── navigation-map.md
│   └── shared-logic.md
├── 02-features/
│   ├── purchasing/
│   │   ├── spec.md
│   │   ├── implementation.md
│   │   ├── tasks.md
│   │   └── verification.md
│   ├── vendors/
│   ├── reports/
│   └── notifications/
├── 03-design/
│   ├── screen-inventory.md
│   ├── design-system.md
│   └── screenshot-traceability.md
├── 04-quality/
│   ├── acceptance-criteria.md
│   ├── test-coverage.md
│   └── submission-readiness.md
├── 05-roadmap/
│   ├── missing-features.md
│   └── implementation-plan.md
└── 06-history/
    ├── decisions.md
    └── documentation-migration.md
```

> Folder dan nama fitur di atas adalah rancangan awal, bukan hasil
> inventarisasi repository yang telah diverifikasi.

Setiap fitur memiliki keterkaitan antara kebutuhan produk, desain,
implementasi, pengujian, dan status aktualnya.

## 2. Referensi dan skill yang relevan (kandidat, belum diverifikasi)

- **GitHub Spec Kit** — toolkit spec/plan/tasks/implementation.
  <https://github.com/github/spec-kit>
- **OpenSpec (Fission AI)** — SDD untuk proyek existing/brownfield.
  <https://github.com/Fission-AI/OpenSpec>
- **Agent Skills** — format instruksi/workflow agen coding.
  <https://agentskills.io/>
- **Addy Osmani — spec-driven agentic engineering** — konteks, spesifikasi,
  perencanaan, implementasi bertahap, verifikasi.
  <https://addyosmani.com/blog/>

Versi terkini, kompatibilitas dengan tooling Aligner, dan metode instalasi
belum diverifikasi — harus diteliti dari sumber primer sebelum instalasi.

## 3. Master prompt eksekusi (ringkasan operasional)

Project root: `/home/norman2/16-9-26-aligner-new-dash`

- **Phase 1 — Discovery:** catat git status/branch/HEAD; inventarisasi semua
  `.md` tracked vs untracked; baca PROMPT.md, TODO.md, PROGRESS.md,
  screen-audits/summary.md, per-screen audits, second-pass; inspeksi source,
  routes, tests, migrations, manifests, Docker, seed; catat tujuan migrasi;
  jangan overwrite/revert worktree changes.
- **Phase 2 — Feature reconciliation:** inventarisasi kanonis dari
  docs + code + routes + tests + screenshot evidence. Klasifikasi:
  VERIFIED COMPLETE / IMPLEMENTED UNVERIFIED / PARTIAL / PLANNED /
  BLOCKED / UNKNOWN. Jangan simpulkan selesai hanya dari TODO/PROGRESS.
- **Phase 3 — Research:** sumber primer Addy Osmani, Spec Kit, OpenSpec,
  Agent Skills, skill discovery/install agent aktual, skill stack
  (testing/FE/BE/DB/security/Docker/visual-regression). Catat URL, tanggal,
  maintenance, kompatibilitas, lisensi.
- **Phase 4 — Select & install skills:** identifikasi agent + direktori skill
  yang didukung; inspeksi instruksi/script/dep/privilege/network; instal hanya
  yang kompatibel & terpercaya & terotorisasi; dokumentasikan
  name/source/pin/path/dep/permission/verify/result; bila unsupported —
  catat blocker, jangan klaim sukses.
- **Phase 5 — Canonical specs/:** 00-product, 01-architecture, 02-features
  (per domain: spec/implementation/tasks/verification),
  03-design, 04-quality, 05-roadmap, 06-history. Baseline = arsitektur &
  implementasi existing. Pisahkan fakta observasi vs usulan.
- **Phase 6 — Migration:** mapping source→destination untuk setiap `.md`;
  klasifikasi CANONICAL/HISTORICAL/SUPERSEDED/DUPLICATE/REQUIRES REVIEW;
  preservasi git history; jangan hapus originals di pass pertama; update root
  docs entry-point; selesaikan kontradiksi dengan evidence atau tandai unresolved.
- **Phase 7 — Validation:** semua `.md` terindeks; fitur verified punya spec +
  evidence; screenshot terhubung ke screen; P0/P1 di roadmap; temuan pass-1/2
  preserved; tak ada klaim complete tanpa bukti; link internal resolve;
  worktree changes utuh; jalankan tests/lint/typecheck/build/seed bila didukung
  env, catat command/SHA/hasil/blocker.
- **Phase 8 — Delivery:** update TODO.md + PROGRESS.md tanpa duplikat; laporan
  akhir (jumlah md, status fitur, konflik, specs, gaps, skills, verifikasi,
  files created/updated/untouched).

Constraints: preservasi behavior; jangan rewrite impl demi spec; jangan revert
unrelated; jangan fabrikasi completion/test; jangan ubah history; jangan hapus
source docs; jangan instal untrusted skills; jangan remote push tanpa otorisasi;
laporkan setiap penyimpangan.

## 4. Catatan submission Aligner

Panduan submission mensyaratkan pekerjaan desain & implementasi yang dibuat
manusia; workflow yang menghasilkan implementasi aplikasi langsung dari prompt
AI dinyatakan tidak memenuhi syarat.

Karena itu konsolidasi harus membedakan: fitur existing, implementasi manusia,
bantuan AI, dan rencana berikutnya. Dokumentasi baru tidak boleh dipakai untuk
menyatakan kepemilikan/authorship berbeda dari riwayat sebenarnya.

**Target akhir:** setiap fitur existing punya satu spesifikasi kanonis yang
terhubung ke source code & bukti verifikasi; temuan audit tetap terlacak;
skill terpasang terdokumentasi & dapat diperiksa.

---
*Sumber: pesan user 2026-09-19. File master prompt lengkap tersedia di histori chat.*
