'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Lock,
  MapPin,
  QrCode,
  ScanLine,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { FieldToasts, useFieldToasts } from './toasts';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export function FindingCapture() {
  const router = useRouter();
  const { toasts, push } = useFieldToasts();

  const [asset, setAsset] = useState(CANON.assetSeal);
  const [zone, setZone] = useState('Basement Mech Room B-204');
  const [severity, setSeverity] = useState<Severity>('CRITICAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lotoRequired, setLotoRequired] = useState(true);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setAsset('AST-HVAC-004');
      setZone('Basement Mech Room B-204 · Trane CVHE Chiller #04');
      push(true, 'Barcode Scanned', 'Asset AST-HVAC-004 verified via camera barcode scanner.');
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      push(false, 'Validation Error', 'Finding title is required.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      push(true, 'Finding Queued', 'Defect captured and added to Field Sync queue.');
      setTimeout(() => {
        router.push('/field/audits');
      }, 1000);
    }, 700);
  };

  return (
    <>
      {/* Fixed Mobile Header */}
      <header className="no-print fixed top-7 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b-2 border-slate900">
        <div className="min-h-16 px-4 flex items-center justify-between gap-2 max-w-3xl mx-auto w-full py-2">
          <div className="flex items-center gap-2">
            <Link
              href="/field/audits"
              className="w-10 h-10 flex items-center justify-center rounded border-2 border-slate900 bg-white active:scale-95"
              aria-label="Back to Audits"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold font-display leading-tight">Log Field Finding</h1>
              <p className="text-xs text-muted truncate">E. Voronova · {CANON.shiftA}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded border-2 border-fail bg-fail-bg text-fail text-[11px] font-bold">
            DEFECT CAPTURE
          </span>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="w-full max-w-3xl mx-auto px-4 pt-[124px] pb-8 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Target Asset & Barcode Scan */}
          <div className="rounded border-2 border-slate900 bg-white p-4 shadow-hard flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Target Asset</span>
              <button
                type="button"
                onClick={simulateScan}
                className="text-xs font-bold text-cobalt flex items-center gap-1 active:scale-95"
              >
                <ScanLine size={14} /> {scanning ? 'Scanning…' : 'Scan Barcode / QR'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">Asset Tag</label>
                <Input
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="AST-HVAC-004"
                  className="font-mono font-bold text-sm border-2 focus:border-slate900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">Zone / Room Location</label>
                <Input
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="Basement Mech Room B-204"
                  className="text-sm border-2 focus:border-slate900"
                />
              </div>
            </div>
          </div>

          {/* Criticality / Severity Selector */}
          <div className="rounded border-2 border-slate900 bg-white p-4 shadow-hard flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Defect Severity</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'CRITICAL', label: 'CRITICAL', tone: 'border-fail bg-fail text-white' },
                  { id: 'HIGH', label: 'HIGH', tone: 'border-warn bg-warn text-white' },
                  { id: 'MEDIUM', label: 'MEDIUM', tone: 'border-slate900 bg-slate900 text-white' },
                  { id: 'LOW', label: 'LOW', tone: 'border-hold bg-hold text-white' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeverity(s.id)}
                  className={cn(
                    'h-11 rounded border-2 font-display font-bold text-xs transition-transform active:scale-95 flex items-center justify-center gap-1',
                    severity === s.id ? s.tone : 'border-border-strong bg-white text-muted hover:border-slate900'
                  )}
                >
                  {severity === s.id && <Check size={14} />}
                  {s.label}
                </button>
              ))}
            </div>
            {severity === 'CRITICAL' && (
              <p className="text-xs text-fail font-semibold flex items-center gap-1 mt-1">
                <AlertOctagon size={14} />
                Critical findings trigger automatic Work Order escalation &amp; safety review.
              </p>
            )}
          </div>

          {/* Finding Details */}
          <div className="rounded border-2 border-slate900 bg-white p-4 shadow-hard flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Defect Description</span>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">Finding Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Refrigerant Leak on Compressor Shaft Seal"
                className="text-base font-semibold border-2 focus:border-slate900"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">Detailed Observations</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe leak rate, pressure gauge reading, audible hissing, or visual defect..."
                className="w-full p-2.5 rounded border-2 border-border-strong text-sm focus:border-slate900 outline-none"
              />
            </div>
          </div>

          {/* Mandatory Photo Capture */}
          <div className="rounded border-2 border-slate900 bg-white p-4 shadow-hard flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Mandatory Evidence Media
              </span>
              <span className="font-mono text-[10px] text-muted">GPS: 0.7893°S 113.9213°E</span>
            </div>

            {hasPhoto ? (
              <div className="relative rounded border-2 border-pass bg-pass-bg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-pass flex items-center justify-center text-white font-bold">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold font-display">Macro Hazard Evidence Photo</span>
                    <span className="text-xs font-mono text-muted">Watermark: 14:15 WIB · GPS Locked</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasPhoto(false)}
                  className="text-xs text-fail font-bold hover:underline"
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setHasPhoto(true);
                  push(true, 'Photo Attached', 'High-res hazard photo geotagged and watermarked.');
                }}
                className="rounded border-2 border-dashed border-border-strong p-6 flex flex-col items-center justify-center gap-2 hover:border-slate900 active:scale-98 bg-surface"
              >
                <div className="w-12 h-12 rounded-full bg-slate900 text-white flex items-center justify-center">
                  <Camera size={22} />
                </div>
                <span className="text-sm font-bold font-display">Capture Evidence Photo</span>
                <span className="text-xs text-muted">Tap to activate camera with GPS &amp; time overlay</span>
              </button>
            )}
          </div>

          {/* Safety & Lockout Guardrails */}
          <div className="rounded border-2 border-slate900 bg-white p-4 shadow-hard flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Safety Protocols</span>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lotoRequired}
                onChange={(e) => setLotoRequired(e.target.checked)}
                className="w-4 h-4 accent-slate900 rounded"
              />
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <Lock size={14} className="text-fail" /> Hazardous Energy Lockout (LOTO #4092) Required
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link href="/field/audits" className="flex-1">
              <button
                type="button"
                className="w-full min-h-[52px] rounded border-2 border-slate900 bg-white text-body text-base font-bold active:scale-95"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[52px] rounded border-2 border-slate900 bg-fail text-white text-base font-bold shadow-hard active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Recording…' : 'Submit Finding'}
            </button>
          </div>
        </form>
      </main>

      <FieldToasts toasts={toasts} />
    </>
  );
}
