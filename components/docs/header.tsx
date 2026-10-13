"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, ArrowLeft, ArrowUpRight } from "lucide-react";

interface DocsHeaderProps {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export function DocsHeader({ mobileNavOpen, setMobileNavOpen }: DocsHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-13 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between font-sans">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="lg:hidden p-1.5 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          aria-label="Toggle Docs Navigation"
        >
          {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white flex items-center gap-2"
          >
            <span>Relay</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <Link
            href="/docs"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1.5"
          >
            <span>Docs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-[#ff6600]/10 text-[#ff6600]">
              v1.0
            </span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <nav className="hidden md:flex items-center gap-5 text-xs text-zinc-500 dark:text-zinc-400 mr-2">
          <Link href="/docs/quickstart" className="hover:text-black dark:hover:text-white transition-colors">
            Quickstart
          </Link>
          <Link href="/docs/api-reference" className="hover:text-black dark:hover:text-white transition-colors">
            API Reference
          </Link>
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            <span>Home</span>
          </Link>
        </nav>

        <ThemeToggle />

        <Link
          href="/dashboard"
          className="px-3 py-1.5 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-medium text-xs transition-colors flex items-center gap-1"
        >
          <span>Dashboard</span>
          <ArrowUpRight className="h-3 w-3 opacity-70" />
        </Link>
      </div>
    </header>
  );
}
