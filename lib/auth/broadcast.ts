/**
 * Auth cross-tab broadcast + logout hygiene (FP-05).
 * Sinyal membawa TIDAK ADA payload sensitif — hanya jenis event + timestamp.
 * Fallback BroadcastChannel → storage event pada key sentinel.
 */
import { has } from '../platform/capability';

export type AuthSignalType = 'LOGOUT' | 'SESSIONS_REVOKED';
export interface AuthSignal {
  type: AuthSignalType;
  at: number;
}

const CHANNEL = 'apex-auth';
const SENTINEL_KEY = 'apex_auth_signal';

export function postAuthSignal(type: AuthSignalType): void {
  const signal: AuthSignal = { type, at: Date.now() };
  if (has.broadcastChannel()) {
    try {
      const ch = new BroadcastChannel(CHANNEL);
      ch.postMessage(signal);
      ch.close();
      return;
    } catch {
      // jatuh ke sentinel
    }
  }
  try {
    localStorage.setItem(SENTINEL_KEY, JSON.stringify(signal));
  } catch {
    /* storage diblokir — tab lain tidak sinkron (degradasi terhormat) */
  }
}

export function subscribeAuthSignals(cb: (signal: AuthSignal) => void): () => void {
  if (has.broadcastChannel()) {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e: MessageEvent) => {
      const d = e.data as AuthSignal | null;
      if (d && typeof d.type === 'string' && Date.now() - d.at < 30_000) cb(d);
    };
    return () => ch.close();
  }
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key !== SENTINEL_KEY || !e.newValue) return;
    try {
      const d = JSON.parse(e.newValue) as AuthSignal;
      if (Date.now() - d.at < 30_000) cb(d);
    } catch {
      /* abaikan payload rusak */
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

/**
 * Bersihkan state lokal perangkat saat logout (shared tablet, impersonation window).
 * Menghapus semua key localStorage ber-prefix `apex` + outbox IndexedDB.
 */
export function purgeLocalState(): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('apex')) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* akses storage diblokir */
  }
  try {
    if (has.indexedDb()) indexedDB.deleteDatabase('apexops_field');
  } catch {
    /* best-effort */
  }
}
