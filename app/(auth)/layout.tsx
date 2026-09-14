/** Standalone auth shell — no sidebar, centered (M3 parity). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">{children}</div>
  );
}
