"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Rocket,
  KeyRound,
  Send,
  ShieldCheck,
  RefreshCw,
  Lock,
  FileCode2,
  Layers,
  Webhook,
  Activity,
  BarChart3,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Overview", href: "/docs", icon: BookOpen },
      { title: "Quickstart", href: "/docs/quickstart", icon: Rocket },
      { title: "Authentication", href: "/docs/authentication", icon: KeyRound },
    ],
  },
  {
    title: "Guides & Architecture",
    items: [
      { title: "Event Ingestion", href: "/docs/ingest", icon: Send },
      { title: "HMAC Signatures", href: "/docs/signatures", icon: ShieldCheck },
      { title: "Retries & Backoff", href: "/docs/retries", icon: RefreshCw },
      { title: "SSRF & Security", href: "/docs/security", icon: Lock },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "All Endpoints", href: "/docs/api-reference", icon: FileCode2 },
      { title: "Events API", href: "/docs/api-reference#events", icon: Layers },
      { title: "Endpoints API", href: "/docs/api-reference#endpoints", icon: Webhook },
      { title: "Deliveries API", href: "/docs/api-reference#deliveries", icon: Activity },
      { title: "API Keys API", href: "/docs/api-reference#api-keys", icon: KeyRound },
      { title: "Stats API", href: "/docs/api-reference#stats", icon: BarChart3 },
    ],
  },
];

interface DocsSidebarProps {
  onClose?: () => void;
}

const SECTION_IDS = ["events", "endpoints", "deliveries", "api-keys", "stats"];

export function DocsSidebar({ onClose }: DocsSidebarProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    if (pathname !== "/docs/api-reference") {
      setActiveSection("");
      return;
    }

    if (typeof window !== "undefined") {
      setActiveSection(window.location.hash || "");
    }

    const onHashChange = () => {
      setActiveSection(window.location.hash || "");
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 80;

          if (isBottom) {
            setActiveSection(`#${SECTION_IDS[SECTION_IDS.length - 1]}`);
          } else if (window.scrollY < 180) {
            setActiveSection("");
          } else {
            const threshold = Math.max(260, window.innerHeight * 0.35);
            let current = "";
            for (const id of SECTION_IDS) {
              const el = document.getElementById(id);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= threshold) {
                  current = `#${id}`;
                }
              }
            }
            if (current) {
              setActiveSection(current);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("scroll", onScroll, { passive: true });

    onScroll();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const isApiRefPage = pathname === "/docs/api-reference";

  return (
    <nav className="w-full space-y-8 font-sans">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;

              let isActive = false;
              if (isApiRefPage) {
                if (item.href === "/docs/api-reference") {
                  isActive = !activeSection || activeSection === "#all";
                } else if (item.href.includes("#")) {
                  const targetHash = item.href.slice(item.href.indexOf("#"));
                  isActive = activeSection === targetHash;
                }
              } else {
                isActive = item.href === "/docs" ? pathname === "/docs" : pathname === item.href;
              }

              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (item.href.includes("#")) {
                        const targetHash = item.href.slice(item.href.indexOf("#"));
                        setActiveSection(targetHash);
                        const el = document.getElementById(targetHash.slice(1));
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        }
                      } else if (item.href === "/docs/api-reference") {
                        setActiveSection("");
                        if (pathname === "/docs/api-reference") {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }
                      onClose?.();
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isActive
                      ? "bg-[#111111] dark:bg-white text-white dark:text-black font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-white/[0.1] text-zinc-700 dark:text-zinc-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
