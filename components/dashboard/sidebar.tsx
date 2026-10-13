"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { LogOut, ChevronDown, Check, Plus } from "lucide-react";

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
  const { user, project, projects, switchProject, createProject, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setIsCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim());
    setNewProjectName("");
    setIsCreating(false);
    setDropdownOpen(false);
  };

  return (
    <aside className="w-56 shrink-0 border-r border-[#e7e7e5] dark:border-white/[0.08] bg-[#fafaf9] dark:bg-[#09090b] flex flex-col justify-between select-none text-[#111111] dark:text-[#f4f4f5] h-screen font-sans">
      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between px-1">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white hover:opacity-80 transition-opacity"
          >
            Relay
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] text-xs transition-colors border border-transparent hover:border-[#e7e7e5] dark:hover:border-white/[0.06]"
          >
            <span className="font-medium text-[#111111] dark:text-white truncate">
              {project?.name || "Workspace"}
            </span>
            <ChevronDown
              className={`h-3 w-3 text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-full bg-[#fbfbfa] dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md shadow-lg z-30 p-1 space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 px-2 py-1 font-medium">
                Projects ({projects.length})
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setDropdownOpen(false);
                      if (p.id !== project?.id) switchProject(p.id);
                    }}
                    type="button"
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${p.id === project?.id
                      ? "bg-zinc-200/70 dark:bg-white/[0.08] text-[#111111] dark:text-white font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                      }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === project?.id && <Check className="h-3 w-3 text-emerald-500" />}
                  </button>
                ))}
              </div>

              <div className="pt-1 border-t border-[#e7e7e5] dark:border-white/[0.06]">
                {isCreating ? (
                  <form onSubmit={handleCreate} className="p-1 space-y-1.5">
                    <input
                      type="text"
                      autoFocus
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project name..."
                      className="w-full bg-white dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded px-2 py-1 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-2 py-0.5 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-0.5 text-[11px] bg-[#111111] dark:bg-white text-white dark:text-black rounded font-medium"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="w-full text-left px-2 py-1.5 rounded text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04] flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>New Project</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-0.5 pt-2">
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
