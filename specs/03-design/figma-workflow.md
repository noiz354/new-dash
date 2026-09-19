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

## Aktivasi integrasi MCP (wired 2026-09-19, nonaktif by default)

Paket terverifikasi: `figma-developer-mcp` v0.13.2 (npm, MIT, Framelink —
third-party, bukan resmi Figma; repo `github.com/GLips/Figma-Context-MCP`).
`opencode.json` di root repo mendefinisikan server `figma` dengan
`--figma-api-key={env:FIGMA_PAT} --stdio` dan `enabled: true`.

Status aktivasi (2026-09-19, commit 0e454f6): TERHUBUNG — token `FIGMA_PAT`
(45 char, dari `~/.bashrc`, scope baca) terverifikasi via `GET /v1/me`
(HTTP 200) dan handshake MCP stdio (`Figma MCP Server` v0.13.2 merespons
`initialize`). Token TIDAK ter-commit (substitusi `{env:...}` runtime);
opencode mewarisinya dari env shell interaktif — pastikan opencode
dijalankan dari terminal yang me-load `~/.bashrc`. Telemetri Framelink
dimatikan (`FRAMELINK_TELEMETRY=off`). Prasyarat pakai: restart opencode
agar server ter-load + siapkan link file/frame Figma.

Langkah aktivasi (sudah dilakukan 2026-09-19; arsip historis):

1. Buat Figma API access token (Figma → Account Settings → Personal access
   tokens; scope baca saja cukup untuk pull frame).
2. Ganti `PASTE_FIGMA_API_KEY_HERE` di `opencode.json` dengan token, set
   `enabled: true`, restart opencode agar server ter-load.
3. Pakai dengan link file/frame/group Figma + instruksi ("implementasikan
   frame X mengikuti kontrak § Kontrak per feature spec di atas").
4. Verifikasi hasil terhadap token Sistem A vs B (`design-system.md`) —
   output MCP tidak otomatis patuh token Aligner.

Catatan keamanan: token melewati paket komunitas — gunakan token ber-scope
minimum dan revoke setelah tidak dipakai. Jangan commit token ke repo.
