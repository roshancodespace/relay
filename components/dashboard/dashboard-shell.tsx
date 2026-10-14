"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { X } from "lucide-react";

interface DashboardShellContextValue {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}

function DashboardShellContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen]);

  const toggleMobileNav = useCallback(() => setMobileNavOpen((prev) => !prev), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <DashboardShellContext.Provider
      value={{
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav,
        closeMobileNav,
      }}
    >
      <div className="h-screen w-full flex overflow-hidden bg-[#fbfbfa] dark:bg-[#09090b] text-[#111111] dark:text-[#f4f4f5] font-sans">
        {isLoading && (
          <div className="fixed top-0 inset-x-0 h-[2.5px] z-50 overflow-hidden pointer-events-none bg-zinc-200/30 dark:bg-white/[0.04]">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#ff6600] to-transparent animate-shimmer-progress shadow-[0_0_10px_rgba(255,102,0,0.6)]" />
          </div>
        )}

        <div className="hidden md:flex shrink-0">
          <DashboardSidebar />
        </div>

        <div
          className={`fixed inset-0 z-50 md:hidden transition-all duration-200 ${mobileNavOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
            }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200 ${mobileNavOpen ? "opacity-100" : "opacity-0"
              }`}
            onClick={closeMobileNav}
          />
          <div
            className={`relative z-10 w-56 max-w-[80vw] h-full bg-[#fafaf9] dark:bg-[#09090b] border-r border-[#e7e7e5] dark:border-white/[0.08] shadow-2xl transition-transform duration-200 ease-out transform ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) {
                closeMobileNav();
              }
            }}
          >
            <div className="absolute top-3.5 right-3 z-20">
              <button
                type="button"
                onClick={closeMobileNav}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <DashboardSidebar />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#fbfbfa] dark:bg-[#09090b]">
          {children}
        </div>
      </div>
    </DashboardShellContext.Provider>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </AuthProvider>
  );
}
