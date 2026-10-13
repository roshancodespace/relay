"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/deliveries", label: "Deliveries" },
  { href: "/dashboard/endpoints", label: "Endpoints" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, project, logout } = useAuth();

  return (
    <aside className="w-52 shrink-0 border-r border-[#e7e7e5] dark:border-white/[0.08] bg-[#fafaf9] dark:bg-[#09090b] flex flex-col justify-between select-none text-[#111111] dark:text-[#f4f4f5] h-screen font-sans">
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white hover:opacity-80 transition-opacity"
          >
            Relay
          </Link>
          {project && (
            <span
              className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[85px] truncate font-normal"
              title={project.name}
            >
              {project.name}
            </span>
          )}
        </div>

        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-1.5 rounded-md text-xs transition-colors ${isActive
                  ? "bg-[#e8e8e6] dark:bg-white/[0.08] text-[#111111] dark:text-white font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white hover:bg-[#efefed] dark:hover:bg-white/[0.04]"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between gap-2">
        <Link
          href="/dashboard/profile"
          className="flex-1 min-w-0 p-1.5 rounded-md hover:bg-[#efefed] dark:hover:bg-white/[0.04] transition-colors"
        >
          <div className="text-xs font-medium text-[#111111] dark:text-white truncate">
            {user?.email || "Account"}
          </div>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
