'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { CANON } from '@/lib/canon';

/** [POLA-BARU] M4/L4 command palette — global ⌘K target. */
const COMMANDS = [
  { label: `Open ${CANON.workOrderSeal} (seal job)`, hint: 'H1 · work order detail', href: `/work-orders/${CANON.workOrderSeal}` },
  { label: `Open ${CANON.purchaseOrder} (linked procurement)`, hint: 'H3 · purchase detail', href: `/purchasing/${CANON.purchaseOrder}` },
  { label: `Open ${CANON.serviceRequest} (conversion source)`, hint: 'M2 · service request', href: `/service-requests/${CANON.serviceRequest}` },
  { label: `Open field audits (${CANON.inspection})`, hint: 'H2 · mobile execution', href: '/field/audits' },
  { label: 'Open Trane Technologies (vendor)', hint: 'M1 · MSA-2024-TRN-09', href: '/vendors/trane-technologies' },
  { label: 'Open Shift Plan (Shift A/B)', hint: 'L1 · handover board', href: '/shifts/plan' },
  { label: 'Open BIM · AST-HVAC-004', hint: 'M6 · viewer', href: '/assets/AST-HVAC-004/bim' },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  const list = useMemo(
    () => COMMANDS.filter((c) => (c.label + c.hint).toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  useEffect(() => {
    if (open) setQ('');
  }, [open ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card rounded-lg shadow-modal overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b border-border-subtle">
          <Search size={18} className="text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && list[0]) {
                router.push(list[0].href);
                onClose();
              }
            }}
            aria-label="Type a command or search"
            className="flex-1 h-12 bg-transparent outline-none text-sm"
          />
          <kbd className="apex-id text-muted bg-surface-subtle px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-1 flex flex-col">
          {list.map((c) => (
            <li key={c.href + c.label}>
              <Link
                href={c.href}
                onClick={onClose}
                className="block px-3 py-2 rounded-lg hover:bg-surface-subtle"
              >
                <span className="text-[13px] font-semibold block">{c.label}</span>
                <span className="text-[11px] text-muted block">{c.hint}</span>
              </Link>
            </li>
          ))}
          {list.length === 0 && <li className="px-3 py-6 text-sm text-muted text-center">No matching command.</li>}
        </ul>
      </div>
    </div>
  );
}
