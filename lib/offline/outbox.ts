/**
 * Field Technician Offline Outbox (FP-06) — antrian mutasi offline yang NYATA.
 *
 * - Storage: IndexedDB (async, transaksional) dengan migrasi dari localStorage v1.
 *   Gagal IDB → fallback in-memory + indikator tidak persisten (lihat isPersistent()).
 * - Replay: sekuensial, Idempotency-Key ASLI preserved → server dedup (409 = SYNCED).
 * - TTL: item non-synced > 7 hari → EXPIRED (tidak di-replay, tetap terlihat).
 * - Cross-tab: BroadcastChannel 'apex-outbox' (+fallback storage event).
 * - Hygiene: purge saat logout ditangani lib/auth/broadcast.ts.
 *
 * Peringatan: 4xx (bukan 408/409) = FAILED permanen — payload ditolak server,
 * replay tidak akan pernah membantu. NETWORK/TIMEOUT = tetap QUEUED (retryable).
 */
import { ApiError, apiFetch } from '../api/client';
import { has } from '../platform/capability';
import { idbGetAll, idbSaveAll } from './db';

export interface OutboxItem {
  id: string;
  op: string;
  url: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body: unknown;
  idempotencyKey: string;
  status: 'QUEUED' | 'SENDING' | 'FAILED' | 'SYNCED' | 'EXPIRED';
  attempts: number;
  createdAt: string;
  lastAttemptAt: string | null;
  errorMessage: string | null;
}

const LEGACY_STORAGE_KEY = 'apexops_field_outbox_v1';
const LEGACY_CORRUPT_KEY = 'apexops_field_outbox_v1_corrupt';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CHANNEL = 'apex-outbox';

// In-memory fallback bila IDB tidak tersedia (per-tab, tidak persisten).
let memoryItems: OutboxItem[] | null = null;
let migrated = false;

export function isPersistent(): boolean {
  return has.indexedDb() && memoryItems === null;
}

function broadcastUpdate(): void {
  const msg = { kind: 'OUTBOX_UPDATED' as const, at: Date.now() };
  if (has.broadcastChannel()) {
    try {
      const ch = new BroadcastChannel(CHANNEL);
      ch.postMessage(msg);
      ch.close();
      return;
    } catch {
      /* fallback */
    }
  }
  try {
    localStorage.setItem('apex_outbox_signal', JSON.stringify(msg));
  } catch {
    /* diblokir — tab lain basi sampai refresh */
  }
}

export function subscribeOutbox(cb: () => void): () => void {
  if (has.broadcastChannel()) {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = () => cb();
    return () => ch.close();
  }
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'apex_outbox_signal') cb();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

function isValidItem(x: unknown): x is OutboxItem {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.url === 'string' &&
    typeof o.idempotencyKey === 'string' &&
    typeof o.method === 'string'
  );
}

/** Migrasi satu kali: localStorage v1 → IDB (invalid dikarantina, tidak dihapus). */
async function migrateLegacy(): Promise<void> {
  if (migrated || typeof window === 'undefined') return;
  migrated = true;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch {
    return;
  }
  if (!raw) return;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isValidItem)) {
      if (parsed.length > 0) await idbSaveAll(parsed);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } else {
      window.localStorage.setItem(LEGACY_CORRUPT_KEY, raw);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    try {
      window.localStorage.setItem(LEGACY_CORRUPT_KEY, raw);
    } catch {
      /* tidak ada tempat karantina — biarkan legacy utuh */
    }
  }
}

async function load(): Promise<OutboxItem[]> {
  await migrateLegacy();
  const fromDb = await idbGetAll<OutboxItem>();
  if (fromDb !== null) {
    memoryItems = null;
    return applyTtl(fromDb);
  }
  if (memoryItems === null) memoryItems = [];
  return applyTtl(memoryItems);
}

async function save(items: OutboxItem[]): Promise<void> {
  if (memoryItems !== null) {
    memoryItems = items;
    broadcastUpdate();
    return;
  }
  const ok = await idbSaveAll(items);
  if (!ok) memoryItems = items; // IDB gagal → turun ke memori (tidak persisten)
  broadcastUpdate();
}

function applyTtl(items: OutboxItem[]): OutboxItem[] {
  const now = Date.now();
  return items.map((i) =>
    i.status !== 'SYNCED' && i.status !== 'EXPIRED' && now - new Date(i.createdAt).getTime() > TTL_MS
      ? { ...i, status: 'EXPIRED' as const }
      : i,
  );
}

export async function listOutbox(): Promise<OutboxItem[]> {
  return load();
}

export async function enqueueOutbox(
  item: Omit<OutboxItem, 'id' | 'attempts' | 'status' | 'createdAt' | 'lastAttemptAt' | 'errorMessage'>,
): Promise<OutboxItem> {
  const items = await load();
  const id = `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const record: OutboxItem = {
    ...item,
    id,
    attempts: 0,
    status: 'QUEUED',
    createdAt: new Date().toISOString(),
    lastAttemptAt: null,
    errorMessage: null,
  };
  items.push(record);
  await save(items);
  return record;
}

export interface FlushOptions {
  /** Batasi replay ke subset item (mis. retry satu item dari UI). */
  onlyIds?: string[];
  onProgress?: (item: OutboxItem, state: 'SENDING' | 'SYNCED' | 'FAILED' | 'RETRY') => void;
}

export async function flushOutbox(opts: FlushOptions = {}): Promise<{ synced: number; failed: number; pending: number }> {
  const items = await load();
  let synced = 0;
  let failed = 0;
  let pending = 0;

  for (const item of items) {
    if (item.status === 'SYNCED' || item.status === 'EXPIRED') continue;
    if (opts.onlyIds && !opts.onlyIds.includes(item.id)) continue;

    item.status = 'SENDING';
    item.lastAttemptAt = new Date().toISOString();
    item.attempts += 1;
    await save(items);
    opts.onProgress?.(item, 'SENDING');

    try {
      await apiFetch<unknown>(item.url, {
        method: item.method,
        body: item.body,
        idempotencyKey: item.idempotencyKey, // preserved — dedup server
        timeoutMs: 30_000,
      });
      item.status = 'SYNCED';
      item.errorMessage = null;
      synced++;
      opts.onProgress?.(item, 'SYNCED');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Sudah diproses (duplikat) — dedup server bekerja sesuai desain.
        item.status = 'SYNCED';
        item.errorMessage = null;
        synced++;
        opts.onProgress?.(item, 'SYNCED');
      } else if (err instanceof ApiError && (err.code === 'NETWORK' || err.code === 'TIMEOUT')) {
        // Masih offline/lambat — tetap QUEUED, hentikan flush agar tidak menghamburkan attempts.
        item.status = 'QUEUED';
        item.errorMessage = err.message;
        pending++;
        opts.onProgress?.(item, 'RETRY');
        await save(items);
        break;
      } else if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        // Payload ditolak (validasi/otorisasi) — permanen.
        item.status = 'FAILED';
        item.errorMessage = `${err.code}: ${err.message}`;
        failed++;
        opts.onProgress?.(item, 'FAILED');
      } else {
        item.status = 'QUEUED';
        item.errorMessage = err instanceof Error ? err.message : 'Unknown send failure';
        pending++;
        opts.onProgress?.(item, 'RETRY');
        await save(items);
        break;
      }
    }

    await save(items);
  }

  return { synced, failed, pending };
}

export async function clearSyncedOutbox(): Promise<void> {
  const items = await load();
  await save(items.filter((i) => i.status !== 'SYNCED'));
}
