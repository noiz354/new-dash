# CODEX.md — Handoff: Seluruh Pekerjaan Tersisa (Apex Ops)

> Dokumen ini adalah daftar kerja lengkap untuk agen Codex agar bisa melanjutkan
> tanpa membaca seluruh riwayat chat. Bahasa respons ke user: **Indonesia**.
> Kode & komentar: English. Baca `AGENTS.md` + file di bawah sebelum mulai.

## 0. Mode otonom penuh — JANGAN bertanya, JANGAN berhenti

1. Kerjakan Fase A→F berurutan sampai semua checkbox `[x]` atau tercatat BLOCKED.
2. Bila ada ambiguitas: pakai default dari tabel di bawah, tandai
   `[ASUMSI-OTOMATIS]` di file yang disentuh + catat di `PROGRESS.md` (bagian
   Asumsi Otonom) untuk review user. Jangan berhenti, jangan menunggu jawaban.
3. Bila benar-benar buntu (butuh kredensial, layanan eksternal, atau perintah
   yang bertentangan dengan aturan keras §3): tulis `BLOCKED: <alasan>` di
   `TODO.md`, lanjutkan ke item independen berikutnya. Aturan keras TIDAK boleh
   dilanggar dengan alasan otonomi.
4. Commit lokal setiap selesai satu unit kerja (satu layar / satu fase).
   Jalankan `git push` bila remote terjangkau; bila gagal, catat `PUSH-BLOCKED`
   di `PROGRESS.md` dan lanjut kerja — jangan berhenti.

### Default keputusan (menggantikan semua "tanya user")

| Keputusan | Default — langsung pakai |
|---|---|
| C14 `Elena Moreno` | Persona TERPISAH: requestor/front-desk di SR triage; `Elena Voronova` = engineer lapangan. Jangan digabung. Tandai `[ASUMSI-OTOMATIS]` |
| Stack produksi (Fase 1/E) | **A: Next.js 14 + Tailwind + shadcn/ui**. Gelombang HTML HIGH–LOW tetap standalone; Fase F rebuild memakai stack A |
| M4–M5 desain | Ikuti pola terdekat dari `ui-state-patterns` + layar sejenis (drawer untuk detail, modal untuk konfirmasi); pilih opsi paling konsisten, catat asumsi |
| Konflik baru tak tercakup kanon | Mayoritas sumber menang (metodologi C1–C22); bila seri, pilih sumber paling otoritatif untuk domain itu (RBAC→org hub, progres→hub antrean, harga→line item eksplisit); catat |
| Push gagal (tanpa akses remote) | Tetap commit lokal per unit; catat `PUSH-BLOCKED`; lanjut kerja |

## 1. Status saat ini (2026-09-13)

- Git: repo terinisiasi, remote `git@github.com:noiz354/new-dash.git` (branch `main`).
  Commit `07c3045` hanya berisi `README.md` (+ baris `# new-dash`). **Belum ada
  `git add -A`** — sebagian besar file masih untracked.
- Fase audit TUNTAS: 20/20 layar (pass-1 + pass-2 independen), navigation audit,
  readiness multi-page, expansion checklist (270 item), interaction trees
  (201 pohon L0→L5), spec H1, spec wiring H1–H3, **kanonisasi data**.
- Blokir G3 (kanon) dinyatakan tertutup. Siap generate halaman HIGH.

## 2. Peta dokumen (baca sesuai kebutuhan)

| Dokumen | Isi |
|---|---|
| `AGENTS.md` | Aturan kerja WAJIB (folder beku, verifikasi visual, DoD) |
| `PROGRESS.md` / `TODO.md` | Status + rencana (update tiap selesai fase) |
| `docs/INVENTORY.md` | 20 layar + ukuran file |
| `docs/PROMPT_UI_AUDIT.md` | Template audit v2 (arsip metodologi) |
| `docs/ui-audit/navigation-audit.md` | Sitemap 16 route desktop + 4 field, 14 missing pages (§4), temuan lintas layar (§5–§6) |
| `docs/ui-audit/*.md` + `pass2/` | Audit per layar (6 seksi + `// TODO`) |
| `docs/AUDIT_MULTI_PAGE_READINESS.md` | Gap G1–G7, 14 missing pages (H1–H3/M1–M6/L1–L4), tabel wiring, **4 prompt final Opsi 1–4**, urutan eksekusi (§5) |
| `docs/CANON_DATA.md` | 22 keputusan kanon C1–C22 + format ID + **klausa CANON siap tempel** (§5) |
| `docs/EXPANSION_CHECKLIST.md` | 270 item P1/P2/P3 per layar (tanpa kode) |
| `docs/INTERACTION_TREES.md` | 201 pohon interaksi L0→L5 + pola `[POLA-BARU]` |
| `docs/SPEC_WORK_ORDER_DETAIL.md` | Spec H1: gap G8–G13, prompt Opsi 5, hidden UI WOD-01…WOD-12, DoD |
| `docs/SPEC_WIRING_HIGH_PAGES.md` | Spec wiring: gap G14–G18, prompt Opsi 6 (+varian Sistem B & H3), matriks wiring, DoD |

## 3. Aturan keras (jangan dilanggar)

1. **JANGAN EDIT** `stitch_facility_maintenance_platform_ui/` (arsip beku). Kode
   baru di folder terpisah (`app/` / `web/` atau file HTML standalone baru).
2. **JANGAN HAPUS** `.zip`, `.png`, `DESIGN.md`.
3. **Bootstrap DILARANG** — stack UI adalah Tailwind + token sistem A (desktop,
   cobalt `#2563EB`) / sistem B (field: border tebal, touch 48px). ID operasional
   (`AST-*`, `WO-2026-*`, SKU, LOTO) selalu monospace.
4. Setiap klaim visual wajib diverifikasi lawan `screen.png` sefolder.
5. Satu layar = satu unit kerja; selesaikan + verifikasi sebelum pindah.
6. Inkonsistensi antar-layar dicatat di `PROGRESS.md` bagian Temuan, jangan
   diam-diam "diperbaiki".
7. Secret `apx_live_sec_…` di settings dianggap **bocor** — rotasi saat seeding,
   prod hanya `last4`. Jangan mereplikasi nilai penuh ke file baru.
8. Dilarang tambah dependensi/backend tanpa persetujuan user.

## 4. Daftar pekerjaan (urut)

### Fase A — Tutup 4 item kanon tertunda (`docs/CANON_DATA.md` §1–§2)
- [ ] C9: bearing SKU `6205 vs 6204` — grep ulang + putuskan (keduanya tak ketemu
      di pass kanonisasi; cari varian penulisan lain, mis. tanpa prefix `PART-`).
- [ ] C10: klaim `CHILL-NUSA-04` / `WO-0894` pendek — verifikasi, bila artefak
      nyatakan gugur.
- [ ] C12: progres `INS-2026-0412` 65% vs 50% — konfirmasi angka di kedua file,
      tetapkan satu.
- [ ] C14: `Elena Moreno` — pakai default §0 (persona terpisah, requestor SR triage).
- Kriteria selesai: `CANON_DATA.md` tanpa status DITUNDA (kecuali menunggu user).

### Fase B — Gelombang HIGH (prompt Opsi 3 + Opsi 2, satu halaman per request)
Sumber: readiness §2 (H1–H3), `SPEC_WORK_ORDER_DETAIL.md`, `SPEC_WIRING_HIGH_PAGES.md`.
Sertakan klausa CANON + ANTI-ARTIFACTS di tiap prompt. Output: HTML standalone.
- [ ] H1 `work-order-detail.html` (rute `/work-orders/[id]`) — 12 kelompok WOD
      (§4 spec), wiring entry dari tabel dispatch + findings convert.
- [ ] H2 tiga file field (sistem B!): `my-audits.html`, `run-checklist.html`,
      `sync-status.html` — PIN override supervisor, guard FAIL, alur offline→sync.
- [ ] H3 `purchase-detail.html` (rute `/purchasing/[id]`) — otorisasi $2.900 +
      envelope $64.200, GRN idempoten, 3-Way Match, RFQ, badge SLA BREACH.
- DoD tiap file: layout cocok `screen.png` acuan, token A/B benar, 3 breakpoint,
  badge + ID monospace benar, **zero `href="#"`**, tanpa placeholder/kode terpotong.

### Fase C — Gelombang MEDIUM (M1–M3, M6; M4–M5 butuh keputusan desain user)
- [ ] M1–M3, M6 sesuai readiness §2.
- [ ] M4–M5: pakai default desain §0 (pola terdekat ui-state-patterns; catat asumsi).

### Fase D — Gelombang Wiring (prompt Opsi 4 + Opsi 6)
- [ ] Sambung semua elemen mati di tabel wiring (readiness §3 + spec wiring §3):
      tiap tombol Next/View Detail/Submit punya `href`/route nyata; HTMX hanya
      untuk aksi (bukan fragment halaman — kecuali pola facility yang sudah ada).
- [ ] Verifikasi tidak ada `alert()`/`confirm()` demo tersisa (ganti modal/PIN).

### Fase E — Gelombang LOW (L1–L4) + keputusan stack
- [ ] L1–L4 sesuai readiness §2.
- [ ] Stack produksi: pakai default §0 (A: Next.js 14 + Tailwind + shadcn) —
      JANGAN bertanya; langsung inisialisasi proyek + token DESIGN.md.

### Fase F — Rebuild + integrasi (TODO Fase 2 & 3, 0/20)
- [ ] Rebuild 20 layar sebagai aplikasi produksi (referensi visual = Stitch HTML,
      bukan copy-paste; tanpa CDN Tailwind play di kode produksi).
- [ ] Kontrak komponen dari `[POLA-BARU]` (AlertDialog destruktif, banner,
      command palette ⌘K, `Logo` tunggal, EmptyState/OfflineBanner/ErrorToast/
      TableSkeleton) — lihat `INTERACTION_TREES.md` + `ui-state-patterns.md`.
- [ ] QA: 3 breakpoint, state empty/loading/error/offline, zona WIB, format +62.

## 5. Cara verifikasi per unit kerja
1. Bandingkan dengan `screen.png` + token `DESIGN.md` yang benar (A vs B).
2. `rg 'href="#"|alert\(|confirm\(|TODO|placeholder' <file>` harus bersih
   (kecuali `// TODO` yang memang diminta audit).
3. Update `PROGRESS.md` (baris fase + Temuan) dan `TODO.md` (centang) setiap
   selesai satu fase — JANGAN menumpuk.
4. Commit dengan pesan ringkas sesuai gaya repo; jangan commit secret.
