# AGENTS.md — Facility Maintenance Platform UI (Stitch Export)

> Dokumen instruksi untuk semua AI agent yang bekerja di repo ini.
> Bahasa kerja: Indonesia. Kode & komentar: English.

## 0. WAJIB — CodeGraph adalah alat PERTAMA untuk membaca kode

Repo ini terindeks CodeGraph (`.codegraph/` ada di root: 245 file, ~2.6k node).
**Sebelum** memakai `grep` / `glob` / `read` / pencarian apa pun untuk memahami
atau melacak kode, **pakai CodeGraph lebih dulu**.

- **Alat MCP (utama, panggil pertama):** `codegraph_explore`

  ```ts
  codegraph_explore({
    query: "SignupForm apiFetch provisionOrganization",   // nama simbol/file ATAU pertanyaan biasa
    projectPath: "/home/norman2/16-9-26-aligner-new-dash",
  })
  ```

  Satu panggilan mengembalikan **sumber verbatim bernomor baris** dari simbol/file
  relevan + jalur pemanggilan antar-simbol + ringkasan blast-radius, termasuk
  lompatan *dynamic dispatch* (render komponen, registry) yang tidak terlihat oleh grep.

- **Shell (selalu tersedia, output sama):**

  ```bash
  codegraph explore "<nama simbol / pertanyaan>"
  codegraph query "<kata kunci>"
  codegraph callers <simbol>   # siapa yang memanggil
  codegraph callees <simbol>   # simbol ini memanggil apa
  codegraph impact  <simbol>   # apa yang terpengaruh bila diubah
  codegraph node <simbol>      # satu simbol: sumber + jejak caller/callee
  codegraph affected <file>    # test apa yang terdampak perubahan file ini
  ```

Aturan pemakaian:

1. Pertanyaan "di mana X", "bagaimana X bekerja", atau **sebelum mengedit sebuah
   simbol** → `codegraph_explore` **lebih dulu**, bukan grep.
2. Sumber yang dikembalikan `codegraph_explore` **setara hasil `read`** pada file
   tersebut — **jangan buka ulang file yang sama** dengan `read`.
3. `grep` / `glob` / `read` dipakai hanya untuk yang **tidak dicakup** CodeGraph:
   file non-kode (`.md`, `.sql`, `.json`, `.css`), file di luar indeks (termasuk
   arsip beku `stitch_facility_maintenance_platform_ui/`), atau verifikasi baris persis.
4. Data indeks bersifat **lokal per mesin** (`.codegraph/codegraph.db` di-`.gitignore`):
   jangan pernah commit DB itu; yang boleh ter-commit hanya `.codegraph/.gitignore`.
5. Setelah `git pull` atau perubahan besar, **segarkan indeks** supaya hasil
   eksplorasi tidak basi:

   ```bash
   codegraph sync    # inkremental — pilihan default
   codegraph index   # bangun ulang penuh (bila sync bermasalah)
   codegraph status  # cek jumlah file/node
   ```

6. Jangan hapus/ubah `codegraph.db` secara manual. Bila ada lock nyangkut:
   `codegraph unlock`.

## 1. Konteks Proyek

Ekspor UI dari **Stitch** untuk platform **Facility Maintenance / CMMS** bernama
**Apex Ops** (varian nama: "Apex Operational Facility System", "Apex Ops CMMS").
Isinya **mockup HTML statis** (Tailwind via CDN) + screenshot referensi + 2 file
`DESIGN.md` sebagai design system. **Bukan aplikasi produksi** — belum ada
framework, routing, state, maupun backend.

Tujuan akhir (belum diputuskan, default diusulkan): membangun ulang sebagai
aplikasi produksi (mis. Next.js + Tailwind + shadcn) dengan Stitch HTML sebagai
**referensi visual**, bukan sebagai kode yang di-copy-paste mentah.

## 2. Sumber Kebenaran (Source of Truth)

| Jenis | Lokasi |
|---|---|
| Layar referensi (20 file) | `stitch_facility_maintenance_platform_ui/<nama_modul>/code.html` |
| Screenshot tiap layar | `stitch_facility_maintenance_platform_ui/<nama_modul>/screen.png` |
| Design system A (desktop/dispatch) | `stitch_facility_maintenance_platform_ui/apex_operational_facility_system/DESIGN.md` |
| Design system B (field/rugged) | `stitch_facility_maintenance_platform_ui/apex_ops_cmms/DESIGN.md` |
| Logo | `stitch_facility_maintenance_platform_ui/apex_ops_logo/code.html` |
| Avatar placeholder | `stitch_facility_maintenance_platform_ui/professional_headshot_avatar_of_a_male_enterprise_operations_facility_director/screen.png` |
| Status kerja | `PROGRESS.md` (update tiap selesai fase) |
| Rencana kerja | `TODO.md` |
| Inventaris layar | `docs/INVENTORY.md` |

## 3. Struktur Repo

```
/home/norman2/13-9-26-aligner-projects/
├── stitch_facility_maintenance_platform_ui/  # JANGAN DIEDIT — arsip referensi Stitch
│   ├── <20 modul>/code.html + screen.png
│   ├── apex_operational_facility_system/DESIGN.md
│   └── apex_ops_cmms/DESIGN.md
├── docs/
│   └── INVENTORY.md                          # tabel 20 layar + ukuran
├── AGENTS.md                                 # file ini
├── PROGRESS.md
├── TODO.md
├── README.md
└── stitch_facility_maintenance_platform_ui.zip  # arsip asli, jangan hapus
```

## 4. Tech Stack File Stitch (untuk dipahami, bukan dipertahankan)

- HTML statis satu file per layar, `https://cdn.tailwindcss.com` + config inline.
- Font: **Inter** (body), **JetBrains Mono** (ID/asset tag/WO number), **Space Grotesk**
  (headline khusus sistem B), ikon **Material Symbols Outlined**.
- Tidak ada JS framework, tidak ada build step, tidak ada routing.
- Buka preview: `python3 -m http.server` lalu buka `<modul>/code.html`,
  atau langsung open file. Bandingkan selalu dengan `screen.png` sefolder.

## 5. Dua Design System — Wajib Tahu

- **A — Apex Operational Facility System** (dispatch/desktop, command center):
  Canvas `#F8FAFC`, primary cobalt `#2563EB`/`#1E40AF`, radius 4/8px, shadow halus,
  tipografi Inter + JetBrains Mono, status emerald/amber/crimson/slate.
- **B — Apex Ops CMMS** (field/rugged, tablet sarung tangan, silau matahari):
  Border tebal 1.5–2px `#0F172A`, hard shadow `0 4px 0 0 rgba(15,23,42,.9)`,
  min touch target **48×48px**, headline Space Grotesk, tombol PASS `#059669` /
  FAIL `#DC2626` besar tersegmentasi.
- Saat membangun ulang: pakai **A untuk layar desktop**, **B untuk layar field/mobile**
  (`mobile_field_inspection_execution_desk`, alur inspeksi). Jangan campur sembarang.

## 6. Aturan Kerja Agent (WAJIB)

0. **CodeGraph dulu** (lihat §0): semua pembacaan/pelacakan kode dimulai dari
   `codegraph_explore`; `grep`/`glob`/`read` hanya pelengkap.
1. **Jangan edit** isi `stitch_facility_maintenance_platform_ui/` — itu arsip beku.
   Semua kode produksi ditulis di folder baru (mis. `app/` / `web/`), bukan menimpa referensi.
2. **Jangan hapus** file `.zip`, `.png`, atau `DESIGN.md`.
3. Setiap mulai kerja: baca `PROGRESS.md` + `TODO.md` dulu, lalu update keduanya saat selesai.
4. Setiap klaim visual ("mirip mockup") wajib diverifikasi: buka `code.html` terkait
   dan bandingkan dengan `screen.png`-nya. Jangan mengarang dari nama folder saja.
5. Patuhi token desain di `DESIGN.md` (warna, radius, font, spacing 4px base).
   ID operasional (`AST-*`, `WO#*`, SKU, LOTO) selalu monospace.
6. Satu layar = satu unit kerja. Selesaikan + verifikasi satu layar sebelum pindah.
7. Jika menemukan inkonsistensi antar-layar Stitch (nama, status, warna), catat di
   `PROGRESS.md` bagian "Temuan", jangan diam-diam "diperbaiki".
8. Bahasa respons ke user: Indonesia. Nama file/folder baru: `kebab-case` atau sesuai
   konvensi framework yang dipilih.
9. Dilarang menambahkan dependensi/backend tanpa persetujuan user. Tanyakan dulu
   pilihan stack (lihat TODO Fase 0) bila belum diputuskan.
10. Setelah `git pull` / perubahan besar: `codegraph sync` supaya §0 tidak basi.

## 7. Cara Preview Cepat

```bash
# dari root repo
python3 -m http.server 8000
# buka mis. http://localhost:8000/stitch_facility_maintenance_platform_ui/operations_dashboard/code.html
```

## 8. Definisi Selesai (DoD) per Layar Rebuild

- [ ] Layout & hierarki cocok dengan `screen.png`
- [ ] Token warna/font/spacing sesuai DESIGN.md yang benar (A vs B)
- [ ] Responsif minimal 3 breakpoint (mobile <768, tablet 768–1023, desktop ≥1024)
- [ ] Status badge & ID monospace benar
- [ ] Tidak ada CDN Tailwind play di kode produksi (build proper)
