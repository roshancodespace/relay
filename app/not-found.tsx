import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#09090b] text-[#111111] dark:text-[#f4f4f5] flex flex-col justify-center items-center px-4 relative font-sans">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-8 text-center space-y-4">
        <div className="h-8 w-8 mx-auto rounded bg-[#ff6600] text-white flex items-center justify-center">
          <Zap className="h-4 w-4 fill-current" />
        </div>

        <div className="space-y-1">
          <div className="font-mono text-2xl font-semibold text-[#111111] dark:text-white">404</div>
          <h1 className="text-sm font-medium text-[#111111] dark:text-white">Page Not Found</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The route you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3 text-xs">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 bg-[#ff6600] hover:bg-[#e65c00] text-white font-medium rounded-md transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-3.5 py-1.5 border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-[#18181c] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded-md transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
