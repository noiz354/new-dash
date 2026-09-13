# UI Audit — Apex Ops Logo (`apex_ops_logo`)

> Sumber: `stitch_facility_maintenance_platform_ui/apex_ops_logo/code.html` (7 baris)
> + `screen.png` sefolder (render kecil: mark biru + wordmark). Design system: **A/B netral** (aset merek).
> **BUKAN route** — aset logo. Dibuat: 2026-09-13. Template v2 Architect
> (ringkas; seksi API/mock N/A dengan alasan).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

File ini bukan halaman — melainkan **master aset logo Apex Ops** dalam satu
elemen `<svg>`: mark + wordmark yang dipakai di sidebar, header, login, dan
dokumen. Mendokumentasikannya di sini agar rebuild memiliki satu sumber
kebenaran merek (bentuk, warna, tipografi, clearspace, varian), bukan
screenshot yang di-crop ulang per halaman.

### Daftar elemen UI utama (bedah SVG, 7 baris)

1. **Canvas** — `<svg viewBox="0 0 160 40">` (rasio 4:1, proporsional untuk
   sidebar/header horizontal).
2. **Mark (kotak)** — `<rect 36×36 rx=8 fill="#1E40AF">` (cobalt-800 sistem A).
3. **Mark (segitiga/Apex)** — path `M18 8L27 24H9L18 8Z`, stroke `#60A5FA`
   (blue-400) `2.5`, `linejoin round` — segitiga "puncak/apex" terbuka.
4. **Mark (node)** — `<circle cx=18 cy=20 r=2.5 fill="#FFFFFF">` — titik putih
   di dalam segitiga (pusat operasi/telemetri).
5. **Mark (baseline)** — path `M12 28H24`, stroke `#93C5FD` (blue-300) `2`,
   `linecap round` — garis fondasi di bawah segitiga.
6. **Wordmark** — `<text x=44 y=23>`: `APEX` (`#0F172A`, 700, 15px) +
   `OPS` (`#2563EB`, tspan) — `letter-spacing -0.02em`, font
   `system-ui, -apple-system, sans-serif`.
7. **Tagline** — `<text x=44 y=32>`: `FACILITY & ASSETS` (`#64748B`, 600,
   8.5px, `letter-spacing 0.08em`).

Varian yang tersedia vs dibutuhkan:

| Varian | Status |
|---|---|
| Primer horizontal (mark + wordmark + tagline, terang) | EXISTS (file ini) |
| Monokrom putih (untuk sidebar navy `#0F172A`-ish / footer gelap) | MISSING — buat (wordmark + tagline → putih) |
| Mark saja / favicon (36×36, `rx=8`) | MISSING — turunkan dari `<rect>` + segitiga |
| Varian field/rugged sistem B (border tebal / hard shadow) | Opsional — putuskan (umumnya logo tidak ikut gaya B) |

### State UI

- **Empty/Loading/Error:** N/A — aset statis. Padanan: `alt="Apex Ops logo"`,
  `Skeleton` kotak 36×36 + baris teks saat logo remote loading (tidak berlaku
  bila SVG inline lokal), fallback inisial `AO` bila file gagal dimuat.

## 2. Navigation Flow & Routing (Alur Navigasi) — N/A (Aset)

Logo bukan halaman dan tidak memiliki target navigasi sendiri. Satu-satunya
perilaku terkait: **logo di header/sidebar tiap halaman mengarah ke `/`**
(atau `/operations`) — konvensi yang ditetapkan di masing-masing dokumen audit
halaman, bukan di sini.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Klik logo (di shell tiap halaman) | `/` (landing atau `/operations`) — konvensi global |
| File `apex_ops_logo/code.html` sendiri | N/A — aset, bukan route |

## 3. Missing Pages & Flow Gaps — N/A; Yang Dibutuhkan Adalah Ekspor Aset

Bukan missing page. Gap = artefak turunan yang harus diproduksi dari master:

1. `logo.svg` primer + `logo-white.svg` + `mark.svg` + `favicon.svg`
   (`// TODO: Export logo variants from apex_ops_logo master SVG`).
2. Komponen `Logo`/`LogoMark` (ukuran `sm/md/lg`, varian `default/white/mark`).
3. Keputusan: wordmark memakai font sistem vs font merek (saat ini
   `system-ui`; bila merek menuntut Inter/Space Grotesk, konversi teks → path
   agar render deterministik).
   `// TODO: Decide logo typography (system-ui vs brand font outlined to path)`

**Temuan (jangan diam-diam diperbaiki):**

- **Header/sidebar mockup tidak memakai SVG ini.** Render `screen.png` logo
  (≈ mark + `APEX OPS / FACILITY & ASSETS`) secara visual cocok dengan mockup
  header, tetapi `code.html` tiap hub menanam logo via markup/kelas sendiri —
  produksi wajib memakai komponen tunggal, bukan duplikasi per halaman.
- **Tidak ada `screen.png` mandiri yang kaya.** Screenshot folder hanya render
  kecil logo (bukan komposisi halaman) — cukup sebagai verifikasi visual,
  tidak perlu diperlakukan sebagai mockup halaman.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- Satu file `code.html` berisi **SVG inline murni** (tanpa Tailwind, font,
  atau JS). Warna hex langsung: `#1E40AF`, `#60A5FA`, `#93C5FD`, `#FFFFFF`,
  `#0F172A`, `#2563EB`, `#64748B`.

### Stack produksi yang diharapkan

| Library / Framework | Peran aset ini |
|---|---|
| **Next.js `next/image` / SVG inline** | SVG inline untuk header/sidebar (crisp, tanpa request); file `.svg` untuk login/dokumen/favicon. |
| **SVGR (`@svgr/webpack`)** | Impor `logo.svg` sebagai komponen React (`Logo`, `LogoMark`) dengan props `size/variant`. |
| **Tailwind CSS** | Sizing (`h-9 w-auto`) + varian warna via `currentColor` bila memungkinkan. |
| Tidak ada runtime lain | Aset statis — tanpa JS, tanpa chart, tanpa fetching. |

## 5. Expected Backend APIs — N/A dengan Alasan

Logo adalah **aset build-time** yang dibundel bersama aplikasi; tidak ada
endpoint yang dibutuhkannya dan tidak ada respons yang menampilkannya secara
dinamis (tenant tidak mengunggah logo kustom di mockup ini). Bila di masa depan
dibutuhkan white-label per tenant, barulah kontrak `GET /api/v1/settings/
branding` relevan — saat ini sengaja tidak dispesifikasikan.

## 6. Data Mocking Strategy — N/A dengan Alasan + Usulan Komponen

Tidak ada mock data (tidak ada domain data). Sebagai gantinya, artefak
sementara adalah **komponen langsung dari master SVG**:

```tsx
// TODO: Export logo variants from apex_ops_logo master SVG (logo.svg, logo-white.svg, mark.svg, favicon.svg)
export function Logo({ variant = "default" }: { variant?: "default" | "white" | "mark" }) {
  // TODO: Decide logo typography (system-ui vs brand font outlined to path)
  if (variant === "mark") {
    return (
      <svg viewBox="0 0 36 36" fill="none" aria-label="Apex Ops mark">
        <rect width="36" height="36" rx="8" fill="#1E40AF" />
        <path d="M18 8L27 24H9L18 8Z" stroke="#60A5FA" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="18" cy="20" r="2.5" fill="#FFFFFF" />
        <path d="M12 28H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return <span role="img" aria-label="Apex Ops logo">{/* full lockup */}</span>;
}
```

Aturan: satu komponen dipakai semua shell (desktop + field + auth); tidak ada
duplikasi markup logo per halaman; `alt`/aria-label selalu ada.
