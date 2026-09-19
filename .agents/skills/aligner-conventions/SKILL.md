---
name: aligner-conventions
description: Aligner CMMS repo conventions — design tokens System A vs B, destructive-action guards, EmptyState, audit-trail pattern, monospace operational IDs. Load before building or modifying any screen, component, or service in this repo.
user-invocable: true
---

# Aligner Conventions (repo-local, observed-only)

Canonical references: `specs/03-design/design-system.md`,
`specs/03-design/figma-workflow.md`, `specs/01-architecture/shared-logic.md`,
`AGENTS.md` §5. This skill summarizes; the specs files are authoritative.

## 1. Two design systems — never mix arbitrarily

- **System A (dispatch/desktop)**: canvas `#F8FAFC`, primary cobalt
  `#2563EB`/`#1E40AF`, radius 4/8px, soft shadow, Inter + JetBrains Mono.
  Use for all `app/(ops)/*` screens.
- **System B (field/rugged)**: 1.5–2px `#0F172A` borders, hard shadow
  `0 4px 0 0 rgba(15,23,42,.9)`, min touch target **48×48px**, Space Grotesk
  headlines, PASS `#059669` / FAIL `#DC2626` segmented buttons.
  Use for `app/(field)/field/*` screens only.
- Base components live in `components/ui/` (`button`, `dialog`,
  `alert-dialog`, `critical-action-dialog`, `badge`, `input`, `skeleton`).
  Reference implementation: `app/(ops)/ui-patterns/page.tsx`.

## 2. Destructive actions MUST be guarded (known-inconsistent — fix toward this)

- Use `ConfirmDialog` from `@/components/ui/alert-dialog`
  (or `critical-action-dialog` for critical flows). Never wire a bare
  delete/approve/reject button on a new screen.
- Reject-style actions require a reason (precedent:
  `lib/services/handover-service.ts` — reject requires discrepancy reason
  >= 3 chars).

## 3. Empty/loading states

- Use `EmptyState` from `@/components/ops/EmptyState` for empty detail
  content (precedent: `work-orders/[id]`, `service-requests/[id]`,
  `audit-trail/[id]`, `assets/[id]` pages).

## 4. Audit trail (append-only)

- State-changing service operations record append-only audit entries
  (precedent: `PO_APPROVE`/`PO_REJECT` in
  `lib/services/procurement-service.ts`, notification-service write at
  `lib/services/notification-service.ts:100`).
- New mutating endpoints must be readable via `/api/audit-trail`
  (`app/(ops)/audit-trail/`).

## 5. Operational IDs are monospace

- `AST-*`, `WO#*`, SKU, LOTO, GRN numbers always render in JetBrains Mono
  (`font-mono`). Never proportional font for IDs.

## 6. Before claiming "matches design"

- Screens WITH Stitch mockup: compare against
  `stitch_facility_maintenance_platform_ui/<modul>/screen.png`
  (inventory: `specs/03-design/screen-inventory.md`).
- Screens WITHOUT mockup (login, signup, profile, shifts, badges, permits,
  offline, … — full list in `screen-inventory.md` § "TANPA mockup"):
  do NOT claim design conformance; they are Figma-frame candidates
  (see `specs/03-design/figma-workflow.md`).
- Route-exists ≠ fully-functional: several detail routes render `EmptyState`
  on seed-only data (`specs/03-design/screen-inventory.md`).

## Anti-patterns

- WRONG: building a field screen with System A soft shadows and 32px buttons.
- WRONG: adding an unguarded DELETE button because "the atomic action is simple".
- WRONG: rendering `WO#123` in Inter because "it looks fine".
- WRONG: claiming a no-mockup route "sesuai desain".
