/**
 * Download util terpusat (FP-02) — menggantikan 12 duplikasi pola
 * Blob + createObjectURL + anchor di komponen. Selalu me-revoke object URL
 * (menutup memory leak inkonsisten; sebelumnya hanya 1 komponen yang revoke).
 *
 * Titik ekstensi: showSaveFilePicker (FP-22, wave 4) di-balik `saveFile()`.
 */

export function sanitizeFilename(name: string): string {
  const clean = name.replace(/[\\/:*?"<>|-]+/g, '-').trim();
  return clean.slice(0, 180) || 'download';
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFilename(filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(filename: string, text: string, type = 'text/csv'): void {
  downloadBlob(filename, new Blob([text], { type: `${type};charset=utf-8` }));
}
