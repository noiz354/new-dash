# SDD Master Spec — Penyelesaian Sisa Kerja ±200 Unit

> Metodologi: **Spec-Driven Development**. Setiap unit kerja punya spec dengan
> acceptance criteria + langkah verifikasi runtime. TIDAK ada klaim DONE tanpa
> verdict runtime via Chrome CDP :9227 (snapshot + console + network + state).
> Sumber kebenaran roadmap tetap `TODO.md`; file-file di `docs/sdd/` adalah
> spec eksekusi per tier.

## 1. Aturan main (mengikat semua tier)

1. **Satu unit = satu verdict**: `PASS` / `PARTIAL` / `FAIL` / `BLOCKED` — ditulis di spec + `PROGRESS.md`.
2. **Estimasi ketergantungan**: Tier N+1 boleh mulai paralel KECUALI yang dinyatakan TERKUNCI (Tier 5 TASK-27+ terkunci sampai Wave 3–4 final — SUDAH TERBUKA 2026-09-16).
3. **Pre-flight tiap sesi**: `npx tsc --noEmit` hijau → dev server `:3157` UP (`/api/health`) → `npm run db:setup` bila migrasi baru (idempotent, server STOP dulu) → login `m.vance@apexops.io` + TOTP devHint.
4. **Fail-closed honesty**: tidak ada toast/angka/badge fiktif; fallback SEED wajib ber-badge; error server jujur (400/404/409).
5. **Commit + push per unit/batch kecil** di branch `arena/01a0aa7a-new-dash`; rebase bila push ditolak (agen lain aktif).
6. **Guard-test**: tiap perbaikan copy/refs fiktif WAJIB menambah grep-test absence (pola GAP-08/GAP-16).
7. **(U) = verifikasi dulu**: item bertanda (U) diverifikasi kedalamannya saat implementasi; boleh jadi DONE-semu (langsung centang) atau PROMOTE-asli (kerjakan).

## 2. Peta tier + status

| Tier | Spec | Unit | Status |
|---|---|---|---|
| 0 — Verifikasi + centang | `tier-0-verify.md` | 5 | ✅ 4 PASS + 1 PARTIAL (2026-09-17; T0-5 Skema/Test → T4-15) |
| 1 — Kecil & jelas | `tier-1-small.md` | 11 | ✅ 10/11 PASS (T1-8..11 user-approved 2026-09-17) · T1-6 deferred (stlh batch Tier 3+) |
| 2 — GAP-17 KEEP batch | `tier-2-keep-batch.md` | 6 | ✅ 6/6 PASS + 5 label fix (2026-09-17) |
| 3 — Test debts | `tier-3-test-debts.md` | 7 | ✅ 6 PASS + 1 PARTIAL (T3-4→T4-16); e2e exec BLOCKED-BY-ENV (2026-09-17) |
| 4 — Fitur medium | `tier-4-medium.md` | 14 | 🔶 4/14 PASS (T4-5 + T4-14 + T4-15 + T4-16, 2026-09-17 — scope user-approved Batch C+D dulu; sisa 10 ⬜) |
| 5 — Susah / terkunci | `tier-5-hard-blocked.md` | 8 | ⬜ |
| 6 — Backlog Batch 1 Operasi | `tier-6-batch-1.md` | 44 PROMOTE | ⬜ |
| 6 — Backlog Batch 2 Aset | `tier-6-batch-2.md` | 45 PROMOTE + 11 (U) | ⬜ |
| 6 — Backlog Batch 3 Governance | `tier-6-batch-3.md` | 45 PROMOTE + 4 (U) | ⬜ |
| 6 — Backlog Batch 4 ui-audit | `tier-6-batch-4.md` | 15+1ref PROMOTE + 4 (U) | ⬜ |

Total: **72 checkbox TODO + 6 temuan PROGRESS ≈ 200 unit** (backlog terurai ±150 sub-item).

## 3. Definition of Done global (per unit)

1. `npx tsc --noEmit` hijau · `npm test` hijau (test baru untuk domain/service baru) · `next build` hijau bila menyentuh route.
2. Verdict runtime via CDP :9227 tercatat (screenshot + console 0 error + network).
3. Guard-test grep untuk tiap penghapusan fiksi.
4. Baris `PROGRESS.md` + update `TODO.md` + laporan `docs/` bila Tier ≥3 atau temuan.
5. Commit + push (rebase bila konflik dengan agen lain).

## 4. Urutan eksekusi yang disarankan

Tier 0 → Tier 1 → Tier 2 → Tier 3 → Tier 4 → Tier 5 (yang tidak BLOCKED) → Tier 6 per batch tema (±50–80 item/sesi, sesuai aturan TODO §0).
