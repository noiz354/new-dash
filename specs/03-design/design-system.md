# Design System

> Dua sistem desain Stitch (A dispatch/desktop, B field/rugged). Sumber: dua file `DESIGN.md` + 20 `code.html` + 20 `screen.png`. Status: 🔶 REPORTED (komponen ADA di `components/ui/` — 7 file; pemetaan token→kode belum diverifikasi sesi ini. KOREKSI: `src/components/ui/` + `src/app/globals.css` TIDAK ADA).

## Sistem A — Apex Operational Facility System (dispatch / desktop)

Dipakai untuk layar desktop / command center.

| Token | Nilai |
|---|---|
| Canvas | `#F8FAFC` |
| Primary cobalt | `#2563EB` / `#1E40AF` |
| Radius | 4 / 8px |
| Shadow | halus (subtle) |
| Body font | Inter |
| ID / asset tag / WO number | JetBrains Mono |
| Status | emerald / amber / crimson / slate |

## Sistem B — Apex Ops CMMS (field / rugged)

Dipakai untuk layar field / mobile (`mobile_field_inspection_execution_desk`, alur inspeksi).

| Token | Nilai |
|---|---|
| Border | tebal 1.5–2px `#0F172A` |
| Hard shadow | `0 4px 0 0 rgba(15,23,42,.9)` |
| Min touch target | **48×48px** (sarung tangan, silau matahari) |
| Headline | Space Grotesk |
| PASS / FAIL | tombol besar tersegmentasi `#059669` / `#DC2626` |

## Aturan pemakaian

- Desktop → A. Field/mobile → B. Jangan campur sembarang.
- Font: Inter (body), JetBrains Mono (ID operasional: `AST-*`, `WO#*`, SKU, LOTO), Space Grotesk (headline sistem B).
- Ikon: Material Symbols Outlined.
- ID operasional **selalu monospace**.

## Implementasi di repo

- `components/ui/*.tsx` — komponen shadcn-style (dialog, dropdown, tabs, sheet, dll.; 7 file terhitung)
- `app/globals.css` — Tailwind + CSS variables (keberadaan ADA, isi belum dibaca)
- Verifikasi visual per layar: buka `code.html` terkait dan bandingkan dengan `screen.png`-nya (jangan mengarang dari nama folder)
