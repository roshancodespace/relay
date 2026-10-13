"use client";

import { useState } from "react";
import { DocsHeader } from "@/components/docs/header";
import { DocsSidebar } from "@/components/docs/sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#09090b] text-[#111111] dark:text-[#f4f4f5] flex flex-col font-sans">
      <DocsHeader mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#fbfbfa] dark:bg-[#09090b] border-r border-[#e7e7e5] dark:border-white/[0.08] p-6 overflow-y-auto transform transition-transform duration-200 ease-in-out lg:hidden ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Documentation Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="text-xs text-zinc-500 hover:text-black dark:hover:text-white"
          >
            Close
          </button>
        </div>
        <DocsSidebar onClose={() => setMobileNavOpen(false)} />
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sticky Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 py-8 pl-6 pr-6 border-r border-[#e7e7e5] dark:border-white/[0.08] sticky top-13 h-[calc(100vh-3.25rem)] overflow-y-auto">
          <DocsSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-6 sm:px-12 py-10 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  );
}
