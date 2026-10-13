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
      <div className="h-screen w-full flex items-center justify-center bg-[#fbfbfa] dark:bg-[#09090b] text-zinc-500 font-sans">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Loader2 className="h-4 w-4 animate-spin text-[#ff6600]" />
          <span>Authenticating session...</span>
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
