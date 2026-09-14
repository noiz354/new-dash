import type { Metadata } from 'next';
import './globals.css';

// NOTE (Fase E): fonts resolve via system stacks until woff2 files are
// self-hosted under app/fonts (BLOCKED in sandbox: Google Fonts unreachable).
// TODO Fase 1 requires local fonts with zero CDN — see PROGRESS.md.
const fontVars = 'font-sans';

export const metadata: Metadata = {
  title: 'Apex Ops CMMS',
  description: 'Facility maintenance / CMMS — production rebuild (tenant APX-NUSA-01).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-surface text-ink antialiased ${fontVars}`}>{children}</body>
    </html>
  );
}
