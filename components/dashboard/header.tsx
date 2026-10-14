"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  action?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  onRefresh,
  isRefreshing = false,
  action,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-13 px-6 sm:px-8 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 backdrop-blur-sm flex items-center justify-between shrink-0 font-sans">
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

      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7 px-2.5 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-[#18181c] text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-zinc-200/40 dark:bg-white/[0.05] pointer-events-none">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#ff6600] to-transparent animate-shimmer-progress shadow-[0_0_8px_rgba(255,102,0,0.6)]" />
        </div>
      )}
    </header>
  );
}
