# AGENTS.md — Facility Maintenance Platform UI (Stitch Export)

> Dokumen instruksi untuk semua AI agent yang bekerja di repo ini.
> Bahasa kerja: Indonesia. Kode & komentar: English.

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
