"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, Menu, X } from "lucide-react";
import Link from "next/link";

function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, project, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#fbfbfa] dark:bg-[#09090b] text-[#111111] dark:text-[#f4f4f5] font-sans">
        {/* Top linear progress bar */}
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 overflow-hidden pointer-events-none bg-zinc-200/30 dark:bg-white/[0.04]">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#ff6600] to-transparent animate-shimmer-progress shadow-[0_0_10px_rgba(255,102,0,0.6)]" />
        </div>

        {/* Sidebar Skeleton (hidden on mobile, visible on md+) */}
        <aside className="hidden md:flex w-56 shrink-0 border-r border-[#e7e7e5] dark:border-white/[0.08] bg-[#fafaf9] dark:bg-[#09090b] flex-col justify-between h-screen p-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <div className="h-4 w-14 bg-zinc-200 dark:bg-white/[0.08] rounded animate-pulse" />
            </div>

            {/* Project selector skeleton */}
            <div className="h-8 w-full bg-zinc-200/50 dark:bg-white/[0.04] rounded-md animate-pulse" />

            {/* Navigation links skeleton */}
            <div className="space-y-1 pt-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-7 w-full bg-zinc-200/40 dark:bg-white/[0.03] rounded-md animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* User profile skeleton at bottom */}
          <div className="pt-3 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between px-1">
            <div className="space-y-1">
              <div className="h-3 w-20 bg-zinc-200 dark:bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2.5 w-14 bg-zinc-200/60 dark:bg-white/[0.03] rounded animate-pulse" />
            </div>
          </div>
        </aside>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header Skeleton */}
          <header className="h-13 px-6 sm:px-8 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 bg-zinc-200 dark:bg-white/[0.08] rounded animate-pulse" />
              <div className="h-3 w-44 bg-zinc-200/60 dark:bg-white/[0.04] rounded animate-pulse hidden md:block" />
            </div>
            <div className="h-7 w-16 bg-zinc-200/60 dark:bg-white/[0.05] rounded-md animate-pulse" />
          </header>

          {/* Content Placeholder */}
          <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pb-8 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-2.5 w-16 bg-zinc-200/60 dark:bg-white/[0.04] rounded" />
                  <div className="h-6 w-20 bg-zinc-200 dark:bg-white/[0.08] rounded" />
                  <div className="h-2.5 w-24 bg-zinc-200/40 dark:bg-white/[0.03] rounded" />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="h-4 w-32 bg-zinc-200 dark:bg-white/[0.08] rounded" />
              <div className="h-48 w-full bg-zinc-200/40 dark:bg-white/[0.03] rounded-lg border border-[#e7e7e5]/60 dark:border-white/[0.04]" />
            </div>
          </main>
        </div>

        <div className="hidden" aria-hidden="true">
          {children}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="hidden" aria-hidden="true">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#fbfbfa] dark:bg-[#09090b] text-[#111111] dark:text-[#f4f4f5] font-sans">
      <div className="md:hidden h-13 px-4 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fafaf9] dark:bg-[#09090b] flex items-center justify-between shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
          <span>Relay</span>
          {project && (
            <span className="text-[11px] text-zinc-500 ml-1 font-normal">
              {project.name}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-white dark:bg-[#121215]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="hidden md:flex shrink-0">
        <DashboardSidebar />
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-56 max-w-[80%] h-full bg-[#fafaf9] dark:bg-[#09090b] border-r border-[#e7e7e5] dark:border-white/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            <DashboardSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#fbfbfa] dark:bg-[#09090b]">
        {children}
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardAuthGuard>{children}</DashboardAuthGuard>
    </AuthProvider>
  );
}
