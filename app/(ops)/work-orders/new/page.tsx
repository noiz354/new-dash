'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Send,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { ApiError, apiFetch } from '@/lib/api/client';

function NewWorkOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState(
    searchParams.get('title') || 'Emergency HVAC Overhaul & Refrigerant Seal Replacement'
  );
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [assetCode, setAssetCode] = useState(searchParams.get('asset') || 'AST-HVAC-004');
  const [location, setLocation] = useState(
    searchParams.get('location') || 'Basement Mech Room B-204'
  );
  const [description, setDescription] = useState(
    'Replace worn mechanical shaft seal, flush refrigerant loop, and verify nominal suction pressure under full chiller load.'
  );
  const [assignee, setAssignee] = useState('Marcus Kowalski (Lead Tech)');
  const [lotoRequired, setLotoRequired] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await apiFetch<{ number?: string }>('/api/work-orders', {
        method: 'POST',
        body: {
          title,
          priority,
          assetCode: assetCode.trim() || undefined,
          location: location.trim() || undefined,
        },
      });
      const newId = data.number || 'WO-2026-0894';
      router.push(`/work-orders/${newId}`);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? `${err.message} (${err.code})` : err instanceof Error ? err.message : 'Unknown dispatch failure');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
      {error && (
        <div className="rounded-lg bg-fail-bg border border-fail p-4 text-xs text-fail-ink flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink">Work Order Dispatch Parameters</h2>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Work Order Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Emergency HVAC Overhaul"
            className="text-sm font-semibold"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Priority Level *</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'P1', label: 'P1 — CRITICAL (4h SLA)', tone: 'bg-fail text-white border-fail' },
                { id: 'P2', label: 'P2 — HIGH (24h SLA)', tone: 'bg-warn text-white border-warn' },
                { id: 'P3', label: 'P3 — MEDIUM (72h SLA)', tone: 'bg-cobalt-deep text-white border-cobalt-deep' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={cn(
                  'h-10 rounded border font-mono font-bold text-xs transition-colors flex items-center justify-center',
                  priority === p.id ? p.tone : 'border-border-strong bg-card text-muted hover:border-body'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Target Asset Code</label>
            <Input
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              placeholder="AST-HVAC-004"
              className="font-mono text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Zone / Room Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Basement Mech Room B-204"
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Detailed Work Scope</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe corrective steps, required spare parts, and acceptance criteria..."
            className="w-full p-2.5 rounded border border-border-strong text-xs outline-none bg-card"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Lead Assigned Technician</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full h-9 px-2 border border-border-strong rounded text-xs bg-card"
            >
              <option>Marcus Kowalski (Lead Tech)</option>
              <option>Elena Voronova (Instrumentation Tech)</option>
              <option>T. Chen (Electrical Tech)</option>
              <option>Sarah Al-Mansoor (Inventory Crib)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold p-2 rounded bg-surface border border-border-subtle h-9">
              <input
                type="checkbox"
                checked={lotoRequired}
                onChange={(e) => setLotoRequired(e.target.checked)}
                className="w-4 h-4 accent-cobalt rounded"
              />
              <span className="text-fail">Mandatory LOTO Lockout (#4092)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Link href="/work-orders">
            <Button variant="secondary" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="text-xs bg-cobalt-deep hover:bg-cobalt text-white gap-1.5"
          >
            <Send size={13} /> {submitting ? 'Dispatching…' : 'Create & Dispatch Work Order'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function NewWorkOrderPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-16">
      <nav className="flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
        <Link className="hover:text-cobalt transition-colors" href="/">
          Home
        </Link>
        <span>/</span>
        <Link className="hover:text-cobalt transition-colors" href="/work-orders">
          Work Orders
        </Link>
        <span>/</span>
        <span className="font-semibold text-body">New Dispatch</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold font-display text-ink">Create &amp; Dispatch Work Order</h1>
        <p className="text-xs text-muted mt-0.5">
          Issue a prioritized maintenance work order with SLA countdown and technician assignment.
        </p>
      </div>

      <Suspense fallback={<div className="p-6 text-center text-xs text-muted">Loading dispatch form…</div>}>
        <NewWorkOrderForm />
      </Suspense>
    </div>
  );
}
