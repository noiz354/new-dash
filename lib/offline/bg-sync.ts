/**
 * FP-17 / TASK-25 — Background Sync + Badging (feature-detected, no-op aman).
 *
 * Alur: enqueueOutbox() memanggil registerOutboxSync() → Chromium menjadwalkan
 * flush via SW saat koneksi pulih MESKIPUN tab ditutup. Browser tanpa
 * PeriodicSync/SyncManager (Safari/Firefox) → no-op; flush tetap via event
 * 'online' di SyncStatus (fallback penuh).
 *
 * Update badge (FF-17b): jumlah pending kecil → navigator.setAppBadge —
 * hanya tampil saat PWA terinstal (sesuai contract platform, no-UA sniff).
 */
import { has } from '../platform/capability';

const SYNC_TAG = 'apex-outbox-flush';

interface SyncCapableRegistration extends ServiceWorkerRegistration {
  sync?: { register: (tag: string) => Promise<void> };
}

/** Daftarkan one-shot background sync ke SW aktif. Resolve false bila unsupported. */
export async function registerOutboxSync(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  if (!has.serviceWorker() || !('sync' in ServiceWorkerRegistration.prototype)) {
    return false; // fallback: flush via online-event (SyncStatus auto-flush)
  }
  try {
    const reg = (await navigator.serviceWorker.ready) as SyncCapableRegistration;
    await reg.sync?.register(SYNC_TAG);
    return true;
  } catch {
    return false; // izin ditolak / kuota — degradasi terhormat
  }
}

/**
 * Update badge ikon aplikasi (PWA terinstal). count 0 → hapus badge.
 * Tidak melempar; resolve false bila unsupported.
 */
export async function updateOutboxBadge(count: number): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  const n = navigator as Navigator & {
    setAppBadge?: (count?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  if (typeof n.setAppBadge !== 'function') return false;
  try {
    if (count > 0) await n.setAppBadge(count);
    else if (typeof n.clearAppBadge === 'function') await n.clearAppBadge();
    else await n.setAppBadge(0);
    return true;
  } catch {
    return false;
  }
}
