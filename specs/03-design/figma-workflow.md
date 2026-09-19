# Figma-to-Frontend Workflow (Rancangan Integrasi, P2)

> Status: PROPOSAL — belum ada file Figma di repo; sumber desain saat ini = mockup Stitch
> (`code.html` + PNG) + token di dua `DESIGN.md`. Dokumen ini mendefinisikan cara setiap
> feature spec tersambung ke desain saat alur Figma diadopsi, tanpa mengubah struktur `specs/`.

## Rantai traceability per halaman/komponen

`Kebutuhan (00-product)` → `Desain (link Figma frame + token)` → `Komponen`
→ `Route + state` → `Varian responsif` → `Uji visual` → `Status`

## Kontrak per feature spec (wajib diisi saat bangun fitur baru)

1. **Desain ref**: link frame Figma (atau path `code.html` Stitch bila belum migrasi) + daftar token
   yang dipakai (warna, radius, font — Sistem A vs B, lihat `03-design/design-system.md`).
2. **Komponen**: nama komponen + props + state (loading/empty/error/guards untuk destructive action
   via ConfirmDialog — temuan audit yang belum konsisten).
3. **Responsif**: 3 breakpoint (mobile <768, tablet 768–1023, desktop ≥1024); Sistem B min 48×48px touch.
4. **Acceptance visual**: checklist perbandingan terhadap PNG/frame + temuan audit terkait (closed/belum).
5. **Uji**: unit (logika) + E2E smoke screen (`e2e/smoke.spec.ts` — tambah screen baru ke daftar 5 kritis).

## Backlog desain (tanpa referensi visual apa pun)

Route yang tidak punya mockup Stitch (`screen-inventory.md` § "TANPA mockup": login, signup,
profile, shifts, badges, permits, offline, …) adalah kandidat pertama frame Figma baru.
Jangan klaim "sesuai desain" untuk route ini sampai frame-nya ada.

## Tooling visual

- Audit performa/aksesibilitas: skill `web-perf` (sudah tersedia global, belum dievaluasi untuk repo ini).
- E2E visual: Playwright screenshot assertions (terblokir env yang sama dengan E2E — chromium).
