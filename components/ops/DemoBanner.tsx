import { TriangleAlert } from 'lucide-react';

/**
 * Phase 0 (docs/AUDIT_SAAS_E2E.md §K) — global honesty banner.
 * This app is a DESIGN PROTOTYPE: simulated data, no backend/API/database/
 * auth, nothing persists. The banner is rendered once from the root layout
 * and occupies a fixed 28px strip (h-7) at the top; every fixed header in
 * the shells offsets by `top-7` so nothing is covered. `no-print` keeps
 * print dossiers clean.
 */
export function DemoBanner() {
  return (
    <div
      role="status"
      className="no-print fixed top-0 inset-x-0 z-[70] flex h-7 items-center justify-center gap-2 border-b border-warn-dot bg-warn-bg px-3 text-[11px] font-semibold text-warn-ink"
    >
      <TriangleAlert size={13} className="shrink-0" aria-hidden="true" />
      <p className="truncate">
        DEMO PROTOTYPE — simulated data · no backend / API / database / auth · nothing persists ·{' '}
        <span className="apex-id">docs/AUDIT_SAAS_E2E.md</span>
      </p>
    </div>
  );
}
