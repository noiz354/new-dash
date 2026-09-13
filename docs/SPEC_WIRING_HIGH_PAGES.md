# Spec: Wiring Deep Interactions — Halaman HIGH H1–H3 (Opsi 6)

> Keputusan user (2026-09-13): cakupan **semua HIGH (H1–H3)**, runtime
> **HTMX via CDN**, target tetap **dokumen/spec dulu**, teknologi **Tailwind + token repo**.
> Bahasa Inggris dipertahankan di blok prompt (AI generator lebih patuh).
> Sumber pohon: `INTERACTION_TREES.md` §1 (WO Hub), §6 (Mobile Run),
> Purchasing (part-aset); checklist: `EXPANSION_CHECKLIST.md`.

---

## 1. Gap Analysis Draf "Wire the Deep Interactions"

| # | Gap | Status | Perbaikan |
|---|---|---|---|
| G14 | Memakai **`data-bs-toggle`** (Bootstrap) — repo tanpa Bootstrap; mockup memakai JS inline/custom untuk modal/drawer | 🔴 BLOCKER (lanjutan G8) | Ganti ke atribut HTMX + `id` target eksplisit; toggle modal/drawer via `hx-get` swap atau class toggle terdefinisi, tanpa class/attr Bootstrap |
| G15 | **Asumsi runtime `hx-*` tak dinyatakan** — snippet `hx-post`/`hx-indicator`/`hx-target` mati tanpa HTMX termuat; preseden `hx-get` facility justru fragment yang dilarang diporting 1:1 (G11) | 🔴 BLOCKER | Klausa CDN-HTMX §2: tiap file HIGH wajib tag script CDN + spinner indikator global; HTMX hanya untuk aksi (POST/PUT/PATCH/DELETE + swap target), **bukan** fragment parsial halaman |
| G16 | "According to the Interaction Tree" **tanpa sitasi wajib** — AI bebas mengarang alur (pola G9) | 🔴 BLOCKER | Tiap snippet wajib bersitasi ID pohon + cabang L1–L5 + terminal state (§3/§4.4 spec H1); snippet tanpa sitasi = ditolak DoD |
| G17 | Volume: H1 36 sel + H2/H3 ≈ 60+ snippet — risiko pemotongan (pola G12) | 🟡 WARNING | Eksekusi per kelompok (satu WOD / satu file per request); §3 di bawah adalah urutannya |
| G18 | Tanpa **CANON + ANTI-ARTIFACTS** (pola G10/G13) — ID/snippet bisa mengulang konflik WO seal, LOTO, artefak mobile | 🔴 BLOCKER | Klausa yang sama dengan Opsi 5; ID di snippet H2/H3 ikut kanon/step H1 |

---

## 2. Prompt Final Adaptasi — Opsi 6 "Wire Deep Interactions" (Siap Tempel)

```text
**TASK: Wire the deep interactions of [FILE, e.g. work-order-detail.html] (System [A/B]) per the Interaction Tree.**

Tech stack (STRICT): standalone HTML + Tailwind CSS (CDN play) + **HTMX via CDN** (include the script tag + one global hx-indicator spinner). NO Bootstrap — never use data-bs-toggle or .is-invalid. Tokens: System A (canvas #F8FAFC, cobalt #2563EB) for desktop / System B (2px borders, 48px touch targets, segmented PASS/FAIL) for field. Fonts Inter + JetBrains Mono (all IDs), Material Symbols icons.

CANON: reuse the decided canon values (WO-2026-0894, AST-HVAC-014, PART-SEAL-8821, [PENDING §5 spec H1]). ANTI-ARTIFACTS: no mobile bottom-nav on desktop, no alert()/confirm(), no stock photos, no exposed secrets.

For EACH wiring group in §3 ([WOD-IDs / file rows]): output exactly 3 snippets + 1 flow note —
1. **Trigger**: exact <button>/<a> with hx-post|hx-put|hx-patch|hx-get (+ hx-headers for Idempotency-Key where stated), citing tree branch L0–L2.
2. **Loading State**: hx-indicator target + disabled-with-reason button (cite L3–L4 guard branch).
3. **Target Update**: exact id + hx-target + hx-swap where the inline message / toast / badge lands (cite L5 terminal state).
Then 2–3 sentences: how click → guard → loading → target → terminal state, naming the failure branch and its Retry path.

Rules: every hx-target id MUST exist in the same file; zero href="#"; zero placeholders; HTMX for actions only, never partial-page fragments. One wiring group per response.
```

Varian Sistem B (H2): tambah "touch targets min 48px (h-14 PASS/FAIL, h-12 actions), no hover-only triggers, offline branches end in OfflineBanner + Sync queue."
Varian H3: tambah "Authorize/GRN requests MUST send hx-headers Idempotency-Key; same key on Retry; EDI failure keeps PO status unchanged (no half-dispatch)."

---

## 3. Matriks Wiring

### 3.1 H1 `work-order-detail.html` (Sistem A, 12 kelompok)

| ID | Trigger (hx-*) | Loading | Target Update → Terminal |
|---|---|---|---|
| WOD-01 | `+ New Work Order` → `hx-post /work-orders`, `hx-target #wo-pipeline`, `hx-swap afterbegin` | `hx-indicator #wo-create-spinner`, submit disabled | Inline `#wo-form-errors` → Success Toast + pipeline terupdate; gagal → ErrorToast+Retry, draf utuh |
| WOD-02 | Baris dispatch → `href="work-order-detail.html"` (navigasi GET, tanpa HTMX) | `#detail-skeleton` saat muat | `#telemetry-stale` + `Sync Now` (`hx-get` refresh tile) → konten live / label STALE |
| WOD-03 | `Save Step Progress` → `hx-put steps/04`, `hx-target #step-04-status` | Spinner inline tombol | Toast retry (draf dipertahankan) → status step tersimpan; catatan kosong → pesan inline + disabled |
| WOD-04 | `Quick-log labor` → `hx-post labor`, `hx-target #labor-panel` | `hx-indicator #labor-spinner` | `#labor-form-errors` inline → panel terupdate; gagal → ErrorToast+Retry, isi form utuh |
| WOD-05 | `Put On Hold`/`Escalate` → modal konfirmasi → `hx-put status` | Tombol disabled bila alasan kosong | Toast retry eskalasi → pill ON HOLD; gagal → ErrorToast+Retry |
| WOD-06 | `Mark Task Complete` → modal sign-off OSHA → `hx-post signoff` | Tombol disabled 3 syarat (Step 05, LOTO verified, foto Step 04) + hint | Smart Badge → COMPLETED; gagal → ErrorToast, modal tetap |
| WOD-07 | Filter/view → `hx-get ?view=`, `hx-target #pipeline` | `TableSkeleton` lane | EmptyState + CTA Create / label STALE kartu |
| WOD-08 | `Requisition` → drawer `hx-get inventory?wo=WO-2026-0894` | Spinner drawer | `#req-errors` SKU/qty inline, badge SHORTAGE + tombol disabled beralasan |
| WOD-09 | Thumbnail evidence → lightbox `#evidence-lightbox` | Placeholder + Retry thumb | Hash SHA-256 tampil / banner UNVERIFIED |
| WOD-10 | Drag kartu lane → `hx-put` status (optimistis) | Pill transisi | Rollback saat gagal; BREACHED + eskalasi inline; modal alasan untuk pindah berisiko |
| WOD-11 | `Shift Handover` → `hx-post handover` | Spinner + warning ACTIVE CLOCK non-blokir | Draf dipertahankan saat gagal + Retry |
| WOD-12 | `Export WO Log` → `hx-post export` (job) | Status job + spinner | Toast + tautan unduh; gagal → Retry; Print → Print View SIGNED/PENDING |

### 3.2 H2 — tiga file field (Sistem B, sumber: 11 pohon Mobile Run)

**`my-audits.html`** (daftar + entry): TableSkeleton → daftar audits + badge 3; baris audit → `href="run-checklist.html"`; tombol Sync → `href="sync-status.html"`; EmptyState bila tak ada audit aktif.

| Pohon sumber | Trigger | Loading → Target → Terminal |
|---|---|---|
| Submit → kembali daftar | Toast tautan WO (otomatis, bukan aksi) | — → daftar + status SUBMITTED terupdate |
| Tab Audits/Finding/Sync | Bottom-nav field valid (4 tab) | TableSkeleton → route tampil; badge Sync = antrean |

**`run-checklist.html`** (inti eksekusi, pola B: h-14 PASS/FAIL, h-12 aksi):

| Pohon sumber | Trigger (hx-*) | Loading → Target → Terminal |
|---|---|---|
| Toggle PASS/FAIL Step 02 | Segmented toggle → `hx-patch steps/02`, reading 18.4 ppm | Autosave spinner → badge FAIL + kapsul 1 Critical Defect; gagal offline → draf lokal + badge Sync+1 |
| Override PASS modal PIN | Toggle PASS atas FAIL → modal PIN (`hx-post override`) | Spinner → PASS OVERRIDE + audit trail; PIN salah → inline, tetap FAIL; gagal API → ErrorToast+Retry |
| Retake Photo | `Retake Photo` h-12 → `hx-post evidence` (multipart + GPS 0.7893S 113.9213E) | Spinner → frame + overlay GPS; gagal → inline + Retake; izin ditolak → pesan + opsi unggah |
| Voice Note | Toggle rekam → `hx-post evidence` (audio) | Spinner → Voice Note Saved + durasi; gagal/mic ditolak → inline + antre lokal |
| Sync Modbus Step 03 | `Sync via IoT` → `hx-get live-reading` 118 PSI (110–130) | Spinner Reading → tersimpan + badge manual-fallback bila gagal baca; out-of-bounds → auto-flag defect |
| Guard FAIL submit | Tombol disabled + hint (dock sticky) | Hint hilang saat reading+foto+catatan lengkap → tombol aktif |
| Submit + Auto-Dispatch | `Submit Audit` h-14 → `hx-post submit` | Spinner ganda disabled → Success Toast + tautan WO (H1) + kembali `my-audits.html`; gagal → ErrorToast+Retry / Save Offline |
| LOTO Step 01 | `Review` → lightbox `#loto-lightbox` [dependensi kanon #4092 vs #M-44] | Spinner → foto + PASS VERIFIED; offline → placeholder + OfflineBanner |

**`sync-status.html`** (alur report-finding/sync — judging "report-finding" melebur sebagai temuan FAIL yang di-submit): antrean draf→foto→voice; `Retry` per item (`hx-post` + kunci sama); gagal parsial → item bertahan + ErrorToast; kosong → EmptyState + ajakan ke Audits; sukses semua → antrean kosong + progres terupdate. OfflineBanner global selama offline.

### 3.3 H3 `purchase-detail.html` (Sistem A, sumber: 10 pohon Purchasing)

| Pohon sumber | Trigger (hx-*) | Loading → Target → Terminal |
|---|---|---|
| Otorisasi + auto-dispatch | `Authorize & Auto-Dispatch` → dialog ringkasan ($2.900, envelope $64.200) → `hx-post authorize` + `hx-headers Idempotency-Key` | Status Transmitting EDI → PO-2026-0315 DISPATCHED + toast; envelope kurang/tanda tangan belum lengkap → nonaktif + warning; EDI gagal → status PO tetap + ErrorToast+Retry kunci sama |
| Posting GRN | `Post GRN` → `hx-post goods-receipts` + Idempotency-Key | Status Posting → GRN-9941 POSTED + saldo ledger; double-post dicegah kunci; gagal → PO tetap DISPATCHED + Retry |
| Selisih GRN | `Flag Discrepancy` → modal (retur/klaim/partial) → `hx-post` | → GRN DISPUTED + tindak lanjut; alasan kosong → inline + disabled |
| Buat PR/PO | `+ Create PR/PO` → modal → `hx-post purchase-requests` | Inline SKU/qty/vendor/envelope → PR terbuat; vendor tak dikenal → EmptyState + onboard |
| 3-Way Match | Tab `?tab=match` (`hx-get`, `hx-target #match-panel`) | PARTIAL + pesan / MISMATCH + wajib Flag → MATCHED atau DISPUTED |
| Detail lintas-dokumen | Review/Receive/Audit → `href="purchase-detail.html?id="` (halaman ini); link WO-2026-0894 → H1 | Skeleton → tab review/receiving/match + riwayat signature; gagal → ErrorToast+Retry |
| Reject PR | `Reject` → modal alasan → `hx-post reject` | Alasan kosong → disabled → PR REJECTED |
| RFQ OEM | `Request OEM Quotes` → pilih vendor → `hx-post rfq` | Tanpa vendor → disabled → RFQ_SENT |
| Filter + countdown | `?tab=&q=&priority=&status=&page=` + poll 30 dtk | EmptyState + CTA; countdown habis → SLA BREACH + eskalasi |
| Export/Print | `Export` job → toast + unduh; `Print PO Batches` → pratinjau cetak | Gagal → ErrorToast+Retry |

---

## 4. DoD Wiring (dilampirkan ke tiap request Opsi 6)

```text
Acceptance: (1) every snippet cites tree ID + L-branch + terminal state; (2) every hx-target id exists in the same file; (3) zero href="#", zero data-bs-toggle, zero alert()/confirm(); (4) every flow ends in a §4.4-spec terminal state incl. its failure+Retry branch; (5) H3 mutating requests carry Idempotency-Key; (6) H2 actions meet 48px targets and offline ends in OfflineBanner + Sync queue.
```
