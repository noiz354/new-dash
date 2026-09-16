'use client';

import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';

/**
 * FP-21 / TASK-21 — windowing ringan tanpa dependency untuk list panjang.
 *
 * Bukan virtual-scroller penuh (tanpa variable-height reconciliation) — kontrak
 * eksplisit: TINGGI ROW HARUS SERAGAM (di-estimasi via `rowHeight`). List yang
 * height-nya variatif TIDAK boleh memakai hook ini (re-render penuh saja).
 *
 * Prinsip: render hanya [start..end) + overscan yang terlihat; spacer atas/bawah
 * mempertahankan scrollbar. Zero bug korrektur filter: index selalu dihitung
 * ulang dari scrollTop terhadap jumlah item terkini.
 */
export interface WindowSlice<T> {
  /** Subset item yang harus dirender. */
  items: T[];
  /** Index global offset ke slice (untuk key/keydown stabil). */
  offset: number;
  /** Spacer atas (px) sebelum slice. */
  topPad: number;
  /** Spacer bawah (px) sesudah slice. */
  bottomPad: number;
  /** Pasang pada scroll container. */
  onScroll: (e: UIEvent<HTMLElement>) => void;
  /** Pasang pada scroll container untuk sizing. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Total item (untuk footer). */
  total: number;
  /** true bila list sedang di-window (contained), false bila render penuh. */
  windowed: boolean;
}

export interface UseWindowOptions {
  /** Tinggi rata-rata satu row (px) — harus ≈ seragam. */
  rowHeight: number;
  /** Row ekstra di atas/bawah viewport; default 8. */
  overscan?: number;
  /** Mulai windowing hanya saat item > threshold; default 60. */
  threshold?: number;
  /** Estimasi tinggi container sebelum pengukuran pertama; default 640. */
  initialHeight?: number;
}

export function useWindow<T>(all: T[], opts: UseWindowOptions): WindowSlice<T> {
  const { rowHeight, overscan = 8, threshold = 60, initialHeight = 640 } = opts;
  const containerRef = useRef<HTMLElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(initialHeight);

  const total = all.length;
  const windowed = total > threshold;

  // Ukur container saat mount + pada resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.clientHeight || initialHeight);
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [initialHeight]);

  // Reset scroll saat list berubah materially (filter/search) → hindari halaman kosong.
  const prevLen = useRef(total);
  useEffect(() => {
    if (prevLen.current !== total) {
      prevLen.current = total;
      if (containerRef.current && containerRef.current.scrollTop > total * rowHeight) {
        containerRef.current.scrollTop = Math.max(0, (total - 1) * rowHeight);
      }
      setScrollTop((st) => Math.min(st, Math.max(0, (total - 1) * rowHeight)));
    }
  }, [total, rowHeight]);

  const onScroll = (e: UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return useMemo(() => {
    if (!windowed) {
      return {
        items: all,
        offset: 0,
        topPad: 0,
        bottomPad: 0,
        onScroll,
        containerRef,
        total,
        windowed: false,
      };
    }
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visible = Math.ceil(height / rowHeight) + overscan * 2;
    const end = Math.min(total, start + visible);
    const realStart = Math.max(0, Math.min(start, Math.max(0, total - visible)));
    const realEnd = Math.min(total, Math.max(end, realStart));
    return {
      items: all.slice(realStart, realEnd),
      offset: realStart,
      topPad: realStart * rowHeight,
      bottomPad: (total - realEnd) * rowHeight,
      onScroll,
      containerRef,
      total,
      windowed: true,
    };
  }, [all, height, overscan, rowHeight, scrollTop, threshold, total, windowed]);
}
