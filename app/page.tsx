import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { CANON } from '@/lib/canon';

/**
 * Fase E scaffold landing. Fase F replaces this with the rebuilt
 * Operations Dashboard (visual reference: web/ + stitch archive).
 */
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-card border border-border-subtle rounded-lg p-8 flex flex-col gap-4 shadow-card">
        <Logo />
        <h1 className="text-2xl font-semibold tracking-tight">Apex Ops CMMS</h1>
        <p className="text-sm text-muted">
          Production scaffold ready — Next.js 14 + Tailwind + shadcn-style. Tenant{' '}
          <span className="apex-id font-semibold text-ink">{CANON.tenant}</span>. Design tokens A/B
          loaded; canon constants in <span className="apex-id">lib/canon.ts</span>.
        </p>
        <ul className="text-sm flex flex-col gap-2">
          <li>
            <Link className="text-cobalt font-semibold hover:underline" href="/work-orders/WO-2026-0894">
              Open WO-2026-0894 (Fase F rebuild)
            </Link>
          </li>
          <li className="text-muted">
            Standalone prototypes: <span className="apex-id">web/work-order-detail.html</span> etc.
            (serve repo root, open web/…)
          </li>
        </ul>
      </div>
    </main>
  );
}
