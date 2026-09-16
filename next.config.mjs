/**
 * Security headers (FP-03):
 * - CSP ENFORCE (TASK-22) setelah 1 siklus report-only + migrasi inline handler
 *   print → components/print/PrintButton.tsx. 'unsafe-inline' tetap preset
 *   untuk script bootstrap Next & style attribute sampai CSP nonce wave;
 *   pelanggaran baru tetap dilaporkan via report-uri.
 * - Permissions-Policy default DITOLAK; geolocation=(self) dibuka untuk FP-10
 *   (stamp koordinat evidence); camera=(self) dibuka untuk FP-13 (barcode scan
 *   aset via BarcodeDetector — feature-detected, fallback manual).
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    // TASK-22: ENFORCE (inline print handler sudah dimigrasi ke komponen klien).
    // 'unsafe-inline' tetap dipertahankan untuk script bootstrap Next + style
    // attribute sampai wave nonce; report-uri tetap memantau blok baru.
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      'report-uri /api/security/csp-report',
    ].join('; '),
  },
  {
    key: 'Permissions-Policy',
    value: [
      'camera=(self)',
      'microphone=()',
      'geolocation=(self)',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'serial=()',
      'hid=()',
    ].join(', '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone prototypes live in web/ — never bundle them.
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
