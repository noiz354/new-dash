'use client';

import Link from 'next/link';
import { Bell, Building2, ChevronDown, Plus, Search } from 'lucide-react';

export function TopBar({ onPalette }: { onPalette: () => void }) {
  return (
    <header className="fixed top-0 left-0 desktop:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-card z-40 px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-2xl min-w-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF4FF]">
          <Building2 size={16} className="text-cobalt-deep" />
          <div className="flex flex-col text-left">
            <span className="apex-label-caps text-muted">Facility Scope</span>
            <span className="text-[13px] font-semibold truncate max-w-xs">HQ Campus - East Wing (Nusantara Tower)</span>
          </div>
          <ChevronDown size={16} className="text-muted" />
        </div>
        <button
          type="button"
          onClick={onPalette}
          className="relative flex-1 min-w-0 text-left h-9 pl-9 pr-12 bg-card text-muted text-sm rounded-lg border border-border-subtle shadow-card"
        >
          <Search size={18} className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          <span className="truncate block">Search WO, AST, PART…</span>
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 apex-id text-muted bg-surface-subtle px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded bg-[#EFF4FF]">
          <span className="w-2 h-2 rounded-full bg-pass" />
          <span className="apex-id text-muted">
            HTMX Server: <span className="text-pass font-semibold">Connected</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onPalette}
          className="h-9 px-4 rounded-lg bg-cobalt-deep text-white text-[13px] font-semibold hidden sm:flex items-center gap-2 hover:bg-cobalt"
        >
          <Plus size={16} strokeWidth={3} />
          <span>New Dispatch / Request</span>
        </button>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#EFF4FF] relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-fail ring-2 ring-surface" />
        </Link>
        <Link href="/profile" className="flex items-center gap-2" aria-label="User profile">
          <span className="w-8 h-8 rounded-full bg-cobalt-deep text-white text-[13px] font-bold flex items-center justify-center">
            SK
          </span>
          <span className="hidden md:flex flex-col text-left">
            <span className="text-[13px] font-semibold leading-tight">Marcus Vance</span>
            <span className="apex-label-caps text-muted leading-tight">VP Operations &amp; Facilities</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
