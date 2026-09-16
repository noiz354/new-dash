/**
 * Field Technician Offline Outbox (Phase 1 A.10 & Canon H3).
 * Manages queued offline mutations and guarantees idempotent replay with preserved Idempotency-Key.
 */

export interface OutboxItem {
  id: string;
  op: string;
  url: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body: unknown;
  idempotencyKey: string;
  status: 'QUEUED' | 'SENDING' | 'FAILED' | 'SYNCED';
  attempts: number;
  createdAt: string;
  lastAttemptAt: string | null;
  errorMessage: string | null;
}

const STORAGE_KEY = 'apexops_field_outbox_v1';

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function listOutbox(): OutboxItem[] {
  const store = getStorage();
  if (!store) return [];
  try {
    const raw = store.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOutbox(items: OutboxItem[]): void {
  const store = getStorage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or blocked
  }
}

export function enqueueOutbox(
  item: Omit<OutboxItem, 'id' | 'attempts' | 'status' | 'createdAt' | 'lastAttemptAt' | 'errorMessage'>,
): OutboxItem {
  const items = listOutbox();
  const id = `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const record: OutboxItem = {
    ...item,
    id,
    attempts: 0,
    status: 'QUEUED',
    createdAt: now,
    lastAttemptAt: null,
    errorMessage: null,
  };

  items.push(record);
  saveOutbox(items);
  return record;
}

export async function flushOutbox(
  onProgress?: (item: OutboxItem, state: 'SENDING' | 'SYNCED' | 'FAILED') => void,
): Promise<{ synced: number; failed: number }> {
  const items = listOutbox();
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    if (item.status === 'SYNCED') continue;

    item.status = 'SENDING';
    item.lastAttemptAt = new Date().toISOString();
    item.attempts += 1;
    saveOutbox(items);
    onProgress?.(item, 'SENDING');

    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': item.idempotencyKey,
        },
        body: JSON.stringify(item.body),
      });

      if (res.ok || res.status === 409) {
        // 200/201 = success, 409 = already processed / duplicate handled
        item.status = 'SYNCED';
        item.errorMessage = null;
        synced++;
        onProgress?.(item, 'SYNCED');
      } else {
        item.status = 'FAILED';
        item.errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        failed++;
        onProgress?.(item, 'FAILED');
      }
    } catch (err: unknown) {
      item.status = 'FAILED';
      item.errorMessage = err instanceof Error ? err.message : 'Network offline / connection dropped';
      failed++;
      onProgress?.(item, 'FAILED');
    }

    saveOutbox(items);
  }

  return { synced, failed };
}

export function clearSyncedOutbox(): void {
  const items = listOutbox().filter((i) => i.status !== 'SYNCED');
  saveOutbox(items);
}
