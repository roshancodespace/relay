"use client";

import React from "react";
import { Menu, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDashboardShell } from "@/components/dashboard/dashboard-shell";

export interface DashboardHeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export type HeaderProps = DashboardHeaderProps;

export function DashboardHeader({
  title,
  description,
  onRefresh,
  isRefreshing = false,
  action,
  className = "",
  children,
}: DashboardHeaderProps) {
  const shell = useDashboardShell();

  return (
    <header
      className={`sticky top-0 z-20 h-13 px-4 sm:px-6 md:px-8 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 backdrop-blur-sm flex items-center justify-between shrink-0 font-sans gap-2 sm:gap-4 ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {shell && (
          <button
            type="button"
            onClick={shell.toggleMobileNav}
            className="md:hidden p-1.5 -ml-1 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors shrink-0"
            aria-label="Toggle navigation menu"
            aria-expanded={shell.mobileNavOpen}
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center min-w-0">
          <h1 className="text-sm font-semibold text-[#111111] dark:text-[#f4f4f5] tracking-tight truncate">
            {title}
          </h1>
          {description && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden md:inline truncate ml-3 font-normal">
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {children}

        <ThemeToggle className="h-7 w-7 p-0 inline-flex items-center justify-center shrink-0" />

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7 w-7 sm:w-auto px-0 sm:px-2.5 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-[#18181c] text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? "animate-spin text-[#ff6600]" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {action}
      </div>

      {isRefreshing && (
        <div className="absolute bottom-0 inset-x-0 h-[2px] overflow-hidden bg-zinc-200/40 dark:bg-white/[0.05] pointer-events-none">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#ff6600] to-transparent animate-shimmer-progress shadow-[0_0_8px_rgba(255,102,0,0.6)]" />
        </div>
      )}
    </header>
  );
}
