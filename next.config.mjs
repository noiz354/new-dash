/**
 * Security headers (FP-03):
 * - CSP dalam mode REPORT-ONLY — pelanggaran dilaporkan ke /api/security/csp-report,
 *   ditriase minimal satu siklus sebelum ENFORCE (TASK-22). script-src/style-src
 *   memakai 'unsafe-inline' sementara (Next inline bootstrap + inline event handler
 *   di print pages); tightening via nonce/hash = fase lanjut.
 * - Permissions-Policy default DITOLAK; geolocation=(self) dibuka untuk FP-10
 *   (stamp koordinat evidence). camera/microphone baru dibuka oleh PR fitur capture.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Content-Security-Policy-Report-Only',
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
      'camera=()',
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
