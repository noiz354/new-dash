import { TriangleAlert } from 'lucide-react';

/**
 * Global honesty banner (Phase 0 §K, wording updated for Phase 1 slice 1).
 * The auth + work-order flow is now REAL (Postgres/PGlite, persisted);
 * most other screens still show canon-seeded static content. The banner is
 * rendered once from the root layout in a fixed 28px strip (h-7); every
 * fixed header offsets by `top-7`. `no-print` keeps print dossiers clean.
 */
export function DemoBanner() {
  return (
    <div
      role="status"
      className="no-print fixed top-0 inset-x-0 z-[70] flex h-7 items-center justify-center gap-2 border-b border-warn-dot bg-warn-bg px-3 text-[11px] font-semibold text-warn-ink"
    >
      <TriangleAlert size={13} className="shrink-0" aria-hidden="true" />
      <p className="truncate">
        DEMO — real auth + work-order flow (Postgres) · other screens still simulated ·{' '}
        <span className="apex-id">docs/PHASE1_SLICE1.md</span>
      </p>
    </div>
  );
}
