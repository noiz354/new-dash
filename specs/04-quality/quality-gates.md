# Quality Gates

> Definisi selesai per unit kerja. Status: ✅ implemented (dipakai Tier 0-4).

## Gate per task (SDD tiers)

1. **Typecheck** — `tsc --noEmit` bersih.
2. **Lint** — tidak ada error baru.
3. **Unit test** — pasangan `tests/unit/` hijau.
4. **Truthfulness** — klaim audit punya pasangan `tests/audit-truthfulness/` bila relevan.
5. **Visual** (layar rebuild) — cocok `screen.png` + token DESIGN.md benar + 3 breakpoint + badge & monospace benar + tanpa CDN Tailwind play.

## Gate per tier (docs/sdd)

- Tier dinyatakan done bila seluruh unit checklist-nya ✅ dan Closure Report ditulis.
- Tier 4 mensyaratkan 14/14 — saat ini 4/14 (T4-13..T4-16 + T4-11), maka Tier 4 **belum done**.

## CI

- Pre-commit hook me-revert churn `next-env.d.ts` dari `next dev` (`ci/git-hooks/`, aktifkan via `git config core.hooksPath ci/git-hooks`).
