# UI Audit Pass-2 — Apex Ops Logo (`apex_ops_logo`)

> Sumber: `stitch_facility_maintenance_platform_ui/apex_ops_logo/code.html` (8 baris SVG)
> + `screen.png` sefolder (5958 bytes). **Bukan route** — master aset SVG.
> Audit independen pass-2 (dari nol, tanpa membaca pass-1). Dibuat: 2026-09-13.
> Diacu global: `docs/ui-audit/navigation-audit.md` (§5: wajib satu komponen `Logo`).

## 1. Page Overview & UI Elements (Bedah SVG)

### Tujuan

Master logo `APEX OPS / FACILITY & ASSETS` untuk header sidebar + header mobile.
File hanya satu `<svg>` `viewBox="0 0 160 40"` — tidak ada halaman, tabel,
form, atau state. `screen.png` menampilkan mark kecil di atas transparan/catur.

### Inventaris elemen SVG (urutan render)

1. `rect 36×36 rx=8 fill #1E40AF` — tile biru cobalt (radius 8).
2. `path M18 8L27 24H9L18 8Z stroke #60A5FA sw=2.5 linejoin=round` — segitiga
   apex (huruf A abstrak).
3. `circle cx=18 cy=20 r=2.5 fill #FFFFFF` — titik/node di dalam apex
   (kesan sensor/telemetri).
4. `path M12 28H24 stroke #93C5FD sw=2 linecap=round` — baseline/horizon
   di bawah apex.
5. `text x=44 y=23 font system-ui 700 15px fill #0F172A ls=-0.02em`
   `APEX` + `tspan fill #2563EB` `OPS` — wordmark dua warna.
6. `text x=44 y=32 font system-ui 600 8.5px fill #64748B ls=0.08em`
   `FACILITY & ASSETS` — tagline caps abu.

### State UI

Tidak ada state operasional. Yang relevan sebagai aset: varian yang **tidak ada**
di file ini — versi putih/monokrom untuk sidebar gelap, mark saja (tanpa teks),
favicon, dan ukuran responsif — semuanya MISSING (lihat §3).
`screen.png` (5,9 KB) hanya memuat mark; wordmark tidak ikut ter-render di
screenshot referensi.

## 2. Navigation Flow & Routing (Bukan Route — Kontrak Pemakaian)

File ini **bukan route** dan tidak memicu navigasi. Kontrak pemakaiannya:

| Elemen / Pemakaian | Target / Perilaku |
|---|---|
| Logo di sidebar desktop (16 hub) | Klik → `/operations` (atau `/`); saat ini tiap hub menduplikasi markup, bukan komponen |
| Logo di header mobile + login (nanti) | Klik → rute home layout masing-masing (`/operations` vs `/(field)/audits`) |
| Favicon / PWA icon | `/favicon.ico`, `/icon.svg`, `apple-touch-icon` — MISSING |
| Varian putih untuk sidebar gelap | `Logo variant="white"` — MISSING |
| Mark saja (avatarтут/breadcrumb sempit) | `Logo variant="mark"` — MISSING |

## 3. Missing Pages & Flow Gaps (Kesenjangan Aset)

1. **Komponen tunggal `Logo` (HIGH)** — setiap hub menduplikasi markup logo
   di header; wajib satu komponen (`props: variant, size`) agar perubahan
   brand tidak menyebar ke 16 file.
   `// TODO: Create shared Logo component (variants: default/white/mark) and replace duplicated header markup`
2. **Varian putih + mark + favicon (MEDIUM)** — tidak ada di `code.html`;
   sidebar gelap (`bg-inverse-surface`) membutuhkan versi putih agar kontras;
   favicon/PWA membutuhkan mark teroptimasi.
   `// TODO: Create Logo white/mark/favicon variants`
3. **Aset font (LOW)** — SVG memakai `system-ui` (benar untuk aset), tetapi
   wordmark produksi sebaiknya memakai Inter (sistem A) dengan tracking yang
   sama (`-0.02em` / `0.08em`) agar konsisten dengan tipografi aplikasi.

**Catatan warna (dicatat):** tile `#1E40AF` + aksen `#60A5FA/#93C5FD` +
teks `#0F172A/#2563EB/#64748B` selaras dengan palet sistem A
(cobalt/navy/slate) — cocok untuk tema terang; untuk sidebar gelap butuh
varian putih (lihat butir 2).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- Satu file SVG inline 8 baris, tanpa CSS/JS/framework; font `system-ui`
  (tidak perlu webfont untuk aset); `fill="none"` di root dengan fill eksplisit
  per elemen.

### Stack produksi yang diharapkan

| Library / Framework | Peran aset ini |
|---|---|
| **Next.js 14 + `next/image` / SVG component (SVGR)** | Impor logo sebagai React component (`Logo.tsx`) + favicon/metadata API. |
| **Tailwind CSS (build)** | Ukuran responsif (`h-8 w-auto`) + varian warna via `currentColor` bila memungkinkan. |
| **shadcn/ui** | Tidak langsung; logo dipakai di `Sidebar`, `Header`, `(auth)/login` kelak. |
| **SVGO / Image optim** | Minifikasi SVG + generate favicon (16/32/180px) + maskable PWA. |

## 5. Expected Backend APIs (Tidak Ada — Aset Statis)

Logo adalah aset statis; tidak ada endpoint backend. Satu-satunya "kontrak"
adalah path file publik:

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/logo.svg` | Master SVG (file ini) | Import komponen / `<img>` header |
| GET | `/logo-white.svg` | Varian putih sidebar gelap — MISSING | Import saat tema gelap |
| GET | `/logo-mark.svg` | Mark saja (favicon/PWA/sempit) — MISSING | Favicon / breadcrumb sempit |
| GET | `/favicon.ico` | Favicon browser — MISSING | On page load (head) |

```ts
// TODO: Create shared Logo component (variants: default/white/mark) and replace duplicated header markup
import Logo from "@/components/logo";

export function SidebarHeader() {
  return (
    <a href="/operations" aria-label="Apex Ops home">
      <Logo variant="white" className="h-8 w-auto" />
    </a>
  );
}
```

## 6. Data Mocking Strategy (Aset Statis — Tanpa Mock Data)

Tidak ada mock data; yang di-`// TODO` adalah pekerjaan komponen:

```tsx
// TODO: Create shared Logo component (variants: default/white/mark) and replace duplicated header markup
export function Logo({ variant = "default", className }: { variant?: "default" | "white" | "mark"; className?: string }) {
  if (variant === "mark") {
    // TODO: Create Logo white/mark/favicon variants
    return (
      <svg viewBox="0 0 36 36" className={className} aria-label="Apex Ops mark">
        <rect width="36" height="36" rx="8" fill="#1E40AF" />
        <path d="M18 8L27 24H9L18 8Z" stroke="#60A5FA" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="18" cy="20" r="2.5" fill="#FFFFFF" />
        <path d="M12 28H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 40" className={className} aria-label="Apex Ops — Facility & Assets">
      <rect width="36" height="36" rx="8" fill="#1E40AF" />
      <path d="M18 8L27 24H9L18 8Z" stroke="#60A5FA" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="18" cy="20" r="2.5" fill="#FFFFFF" />
      <path d="M12 28H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <text x="44" y="23" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="15" fill="#0F172A" letterSpacing="-0.02em">APEX<tspan fill="#2563EB">OPS</tspan></text>
      <text x="44" y="32" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="8.5" fill="#64748B" letterSpacing="0.08em">FACILITY &amp; ASSETS</text>
    </svg>
  );
}
```

Aturan: jangan copy-paste markup SVG ke tiap header; selalu impor `Logo`;
varian putih/mark/favicon dibuat sekali di komponen ini.

## 7. Perbandingan Pass-1 vs Pass-2

### (a) Temuan pass-1 yang TERKONFIRMASI

- **Bedah 7–8 elemen SVG identik** (tile `#1E40AF`, apex `#60A5FA`, node putih,
  baseline `#93C5FD`, `APEX #0F172A` + `OPS #2563EB`, tagline `#64748B`,
  `viewBox 160×40`) — pass-1 (`docs/ui-audit/logo.md`) dan pass-2 membaca
  nilai yang sama persis dari `code.html`.
- **Varian MISSING yang sama:** putih/monokrom untuk sidebar gelap, mark saja,
  favicon — kedua pass sepakat harus diproduksi dari master.
- **Duplikasi markup logo per hub** (bukan komponen tunggal) — pass-2
  mengonfirmasi dari sisi berlawanan (header tiap hub + §5 navigation-audit:
  "Header tiap hub menduplikasi markup logo — wajib satu komponen `Logo`").

### (b) Temuan BARU yang luput di pass-1

- **`screen.png` hanya me-render mark kecil** (5.958 bytes, tanpa wordmark) —
  pass-2 mencatatnya eksplisit sebagai batas verifikasi visual (cukup untuk
  mark, tidak untuk lockup penuh).
- **Rekomendasi tipografi produksi:** SVG memakai `system-ui`; pass-2
  mengusulkan Inter (sistem A) dengan tracking yang sama (`-0.02em`/`0.08em`)
  agar konsisten dengan aplikasi — belum dibahas pass-1.
- **Kontrak path aset statis** (`/logo.svg`, `/logo-white.svg`,
  `/logo-mark.svg`, `/favicon.ico`) sebagai tabel seksi 5 — pass-1
  menetapkan N/A; pass-2 memodelkannya sebagai endpoint file agar
  checklist turunan aset tidak hilang.

### (c) KOREKSI atas pass-1

- **Hitungan baris trivial:** pass-1 menulis "7 baris"; file aktual 8 baris
  (termasuk tag penutup `</svg>`). Bukan kesalahan substansi — hanya presisi.
- **Tidak ada koreksi material lain.** Perbedaan seksi 5 (N/A vs tabel path
  statis) adalah pilihan dokumentasi setara.
