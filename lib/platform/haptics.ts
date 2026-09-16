/**
 * Vibration haptics (FP-12) — umpan balik taktil untuk tombol PASS/FAIL
 * pada tablet rugged (Design System B). No-op diam di browser tanpa dukungan.
 */
import { has } from './capability';

export function vibrate(pattern: number | number[]): boolean {
  if (!has.vibration()) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export const haptic = {
  /** Konfirmasi positif — PASS verified. */
  pass: (): boolean => vibrate(50),
  /** Peringatan/negatif — FAIL, PIN salah, aksi kritis. */
  fail: (): boolean => vibrate([80, 40, 80]),
  /** Notifikasi ringan. */
  info: (): boolean => vibrate(20),
};
