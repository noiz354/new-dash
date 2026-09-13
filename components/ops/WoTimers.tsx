'use client';

import { useEffect, useState } from 'react';

/** Live SLA countdown (WIB display). Starts at 42m15s canon seed. */
export function SlaCountdown({ startSec = 42 * 60 + 15 }: { startSec?: number }) {
  const [sec, setSec] = useState(startSec);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return (
    <span role="timer" className="text-4xl font-bold tabular-nums text-fail font-mono tracking-tight">
      {m}m {s}s
    </span>
  );
}

/** Labor stopwatch. Starts at 01:42:18 canon seed. */
export function LaborStopwatch({ startSec = 1 * 3600 + 42 * 60 + 18 }: { startSec?: number }) {
  const [sec, setSec] = useState(startSec);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return (
    <span className="text-4xl font-bold tabular-nums text-[#00563A] font-mono tracking-tight">
      {h}:{m}:{s}
    </span>
  );
}
