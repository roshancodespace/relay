import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#09090b] text-[#111111] dark:text-[#f4f4f5] flex flex-col justify-center items-center px-4 relative font-sans">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full text-center space-y-4">
        <div className="space-y-1.5">
          <div className="text-3xl font-semibold text-[#111111] dark:text-white">404</div>
          <h1 className="text-sm font-medium text-[#111111] dark:text-white">Page Not Found</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The route you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3 text-xs">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-medium rounded-md transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="px-3.5 py-1.5 border border-[#e7e7e5] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-[#111111] dark:text-white rounded-md transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
