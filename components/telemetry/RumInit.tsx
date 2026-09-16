'use client';

import { useEffect } from 'react';
import { initRum } from '@/lib/telemetry/rum';

/** Mount collector RUM sekali per shell (FP-07). Render: tidak ada. */
export function RumInit() {
  useEffect(() => initRum(), []);
  return null;
}
