# Spec: Build Deep View `work-order-detail.html` (H1)

> Target: missing page prioritas HIGH H1 (`AUDIT_MULTI_PAGE_READINESS.md` §2) —
> dead-end terbesar, dirujuk semua layar konversi/dispatch.
> Keputusan user (2026-09-13): **dokumen/spec saja** (tanpa generate HTML),
> mode **audit dokumen dulu**, teknologi **diadaptasi ke Tailwind + token repo**.
> Bahasa Inggris dipertahankan di blok prompt (AI generator lebih patuh).

---

## 1. Gap Analysis Draf "Build the Deep Views & Components"

| # | Gap | Status | Perbaikan |
|---|---|---|---|
| G8 | Menyebut **Bootstrap 5** + `.is-invalid` — repo memakai Tailwind + pola `FormField` dari `ui-state-patterns` (audit §1) | 🔴 BLOCKER (lanjutan G1) | Ganti ke stack §3; validasi = pesan inline per field + tombol disabled beralasan (bukan class Bootstrap) |
| G9 | Tidak merujuk **Interaction Tree** mana pun — "Hidden UI Elements L3–L5" tanpa sumber membuat AI mengarang modal/toast sendiri | 🔴 BLOCKER | Prompt wajib melampirkan inventaris §4 (12 pohon WO Hub, ID WOD-01…WOD-12) dan mewajibkan semua elemen tersembunyi berasal dari sana |
| G10 | Tidak ada klausa **CANON data** — halaman detail WO adalah tempat konflik WO seal ganda (0894 vs 8802) + LOTO ganda meledak | 🔴 BLOCKER (lanjutan G3) | Klausa CANON + daftar keputusan prasyarat §5 |
| G11 | "Ready for **HTMX injection**" ambigu — target yang disepakati file standalone; satu-satunya preseden HTMX (facility `hx-get` fragment) justru dilarang diporting 1:1 | 🟡 WARNING (lanjutan G6) | Tegaskan: file standalone penuh; atribut `hx-*` hanya sebagai penanda perilaku, bukan fragment parsial |
| G12 | 12 pohon × 5 level = file sangat besar; risiko AI memotong (masalah asal keempat prompt) | 🟡 WARNING (lanjutan G7) | Struktur §4 dipecah: layout dulu, lalu Hidden UI per kelompok; tetap 1 file, 1 request, tanpa placeholder |
| G13 | Tanpa klausa **ANTI-ARTIFACTS** (bottom-nav mobile, `alert()`/`confirm()`, foto asing) | 🔴 BLOCKER (lanjutan G2) | Sertakan paragraf yang sama dengan prompt Opsi 1–4 |

---

## 2. Prompt Final Adaptasi — Opsi 5 "Build Deep View" (Siap Tempel)

```text
**TASK: Build the Deep View work-order-detail.html (Work Order Detail View, System A desktop/dispatch).**

Tech stack (STRICT): standalone HTML + Tailwind CSS (CDN play), fonts Inter (body) + JetBrains Mono (all operational IDs: WO-2026-XXXX, AST-*, PART-*), Material Symbols Outlined icons. Design tokens System A: canvas #F8FAFC, primary cobalt #2563EB/#1E40AF, radius 4/8px, subtle shadows. Reuse the exact sidebar from the existing screens (same 15 nav items, same order, Work Orders active).

CANON (do not invent conflicting facts): this page shows ticket WO-2026-0894 on asset AST-HVAC-014 (canon seed). IDs MUST follow WO-2026-XXXX / AST-* / PART-* / PO-2026-XXXX formats. [PENDING CANON DECISIONS in §5 — apply the decided values before generating.]

ANTI-ARTIFACTS (never reproduce): mobile bottom-nav on this desktop screen; wrong <title>; stock/foreign photography; hotlinked avatars; alert()/confirm() (design real modal dialogs); exposed API secrets.

Generate the COMPLETE, unabridged work-order-detail.html. Do NOT use placeholders or truncated snippets. It MUST contain:
1. Main layout per §4.1 (header, 5-step checklist, labor, parts ledger, compliance).
2. ALL Hidden UI Elements per §4.2 (modals, drawer, lightbox, toasts, skeletons) — present in the file, hidden by default, ready to trigger.
3. Validation UI per §4.3 (inline per-field messages + disabled-with-reason submit, NO Bootstrap classes).
4. Terminal states per §4.4 (success toasts, ErrorToast+Trace+Retry, skeletons, STALE labels).

Wire entry/exit: table rows in operations_dashboard → this page (href="work-order-detail.html"); "Back" returns to the pipeline; Convert/Dispatch results from SR/finding flows land here. Zero href="#" on this page.
```

---

## 3. Dependensi Kanon (prasyarat, tanpa AI)

1. WO seal tunggal: `WO-2026-0894` vs `WO-2026-8802` (G3/G10).
2. Gembok LOTO: `#4092` vs `#M-44` — memengaruhi guard WOD-06 + evidence `loto_breaker_isolated.jpg`.
3. Format `WO-2026-XXXX` (vs `WO-2024-*` di dashboard dispatch).
4. Harga `PART-SEAL-8821` ($1.420 vs $1.450) untuk ledger parts.
5. Jam Shift A (memengaruhi timer labor di handover WOD-11).

---

## 4. Build Spec `work-order-detail.html`

### 4.1 Layout utama (dari audit work-orders §1 + tree WOD-02 L2)

Header eksekusi (pill `IN PROGRESS P1 CRITICAL`, countdown SLA, badge Modbus/telemetri 4 tile) → checklist 5 step (Step 04 "Replace Worn Primary Shaft Mechanical Seal" + Step 05 LOCKED) → panel labor + time clock → ledger parts ($1.735) → compliance/OSHA 1910.147 → toolbar eksekusi (Save Step Progress, Put On Hold, Escalate to Vendor, Mark Task Complete, Shift Handover, Export WO Log, Print Work Permit).

### 4.2 Inventaris Hidden UI L3–L5 (wajib ada, tersembunyi by default)

| ID | Pohon sumber (`INTERACTION_TREES.md` §1) | Elemen tersembunyi |
|---|---|---|
| WOD-01 | Create WO | Modal buat WO + validasi inline + spinner tombol + Success Toast |
| WOD-02 | Buka detail (halaman ini) | `TableSkeleton` tile/konten, strip OFFLINE telemetri, label STALE + tombol Sync Now |
| WOD-03 | Simpan progres Step 04 | Toast retry (draf dipertahankan), pesan inline catatan wajib, spinner inline |
| WOD-04 | Quick-log labor | Pesan inline durasi/kode, ErrorToast+Retry (form mempertahankan isi) |
| WOD-05 | Put On Hold / Escalate | Modal konfirmasi + alasan wajib (tombol disabled bila kosong), toast retry eskalasi |
| WOD-06 | Mark Task Complete | Modal sign-off OSHA + Smart Badge, tombol disabled + hint (Step 05/LOTO/foto), ErrorToast |
| WOD-07 | Filter pipeline/view | EmptyState lane + ajakan Create WO, TableSkeleton lane, label STALE kartu |
| WOD-08 | Requisition drawer | Drawer inventaris prefill `?wo=WO-2026-0894` (konvensi M5), pesan inline SKU/qty, badge SHORTAGE + tombol disabled beralasan |
| WOD-09 | Evidence viewer | Lightbox + hash SHA-256 (`7f8c92a10b48`), thumbnail placeholder + Retry, banner integritas UNVERIFIED [POLA-BARU Evidence Lightbox] |
| WOD-10 | Drag lane | State optimistis kartu + rollback, pill BREACHED + eskalasi inline, modal alasan pemindahan berisiko |
| WOD-11 | Shift Handover | Alur handover + warning ACTIVE CLOCK non-blokir (stop vs serahkan timer), draf dipertahankan saat gagal |
| WOD-12 | Export / Print | Status job unduh + Retry, Print View matriks SIGNED/PENDING [POLA-BARU Print View] |

### 4.3 Validasi (tanpa Bootstrap — pola `FormField` ui-state-patterns)

Pesan inline merah per field + tombol submit disabled + hint alasan (WOD-01/03/04/05/06/08). Kasus guard khusus: tombol sign-off disabled tiga syarat (Step 05, LOTO verified, foto Step 04) — WOD-06; badge SHORTAGE + tombol disabled (WOD-08); warning non-blokir timer ACTIVE CLOCK (WOD-11).

### 4.4 Terminal states (vocabulary ui-state-patterns, kecuali [POLA-BARU])

Success Toast (+ tautan unduh untuk export), ErrorToast + Trace + Retry (modal/draf tetap), TableSkeleton, EmptyState, label STALE, pill status terupdate (ON HOLD / COMPLETED / BREACHED), banner UNVERIFIED, Print View.

### 4.5 Entry/exit wiring (Opsi 4, setelah file ada)

Masuk dari: baris dispatch dashboard, 5 link histori PM, `#WO-2025-0812` asset-detail, `View Work Order` notifications, kartu user org-rbac, hasil konversi SR (SR-2026-0894) & findings (FND-2026-0188), panel ruangan facility, baris PR purchasing, kartu dispatch vendors. Keluar: Back → pipeline; requisition → drawer (M5); export → kait `/reports`; print → L3.

---

## 5. DoD halaman ini (dilampirkan ke request generate)

```text
Acceptance: (1) layout §4.1 cocok hierarki mockup WO hub; (2) token System A benar; (3) responsif <768 / 768–1023 / ≥1024; (4) badge + ID monospace benar; (5) semua 12 kelompok WOD-01…WOD-12 hadir sebagai hidden UI tanpa placeholder; (6) zero href="#" dan zero alert()/confirm().
```
