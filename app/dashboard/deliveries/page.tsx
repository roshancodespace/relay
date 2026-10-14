"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge, DeliveryStatus } from "@/components/ui/status-badge";
import { Search } from "lucide-react";

interface DeliveryItem {
  id: string;
  status: DeliveryStatus;
  attemptsCount: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  eventType: string;
  eventId: string;
  endpointId: string;
  endpointUrl: string;
}

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: "all", label: "All" },
  { id: "delivered", label: "Delivered" },
  { id: "retrying", label: "Retrying" },
  { id: "failed", label: "Failed" },
  { id: "pending", label: "Pending" },
];

export default function DeliveriesListPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    try {
      const url =
        activeFilter === "all"
          ? "/api/v1/deliveries?limit=100"
          : `/api/v1/deliveries?status=${activeFilter}&limit=100`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const filtered = deliveries.filter((d) =>
    d.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.endpointUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Deliveries"
        description="Chronological webhook dispatch pipeline"
        onRefresh={fetchDeliveries}
        isRefreshing={isLoading}
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeFilter === f.id
                  ? "bg-[#111111] dark:bg-white text-white dark:text-black font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search URL, event, ID..."
                className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium">Event</th>
                    <th className="py-2.5 px-3 font-medium">Destination</th>
                    <th className="py-2.5 px-3 font-medium text-center">Attempts</th>
                    <th className="py-2.5 px-3 font-medium">Created</th>
                    <th className="py-2.5 px-3 font-medium">Next Retry</th>
                    <th className="py-2.5 px-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-xs">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-3">
                        <div className="h-5 w-16 bg-zinc-200/70 dark:bg-white/[0.06] rounded-full" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-24 bg-zinc-200/70 dark:bg-white/[0.06] rounded" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-40 bg-zinc-200/50 dark:bg-white/[0.04] rounded" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="h-4 w-8 bg-zinc-200/50 dark:bg-white/[0.04] rounded mx-auto" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-16 bg-zinc-200/50 dark:bg-white/[0.04] rounded" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-12 bg-zinc-200/40 dark:bg-white/[0.03] rounded" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="h-4 w-12 bg-zinc-200/50 dark:bg-white/[0.04] rounded ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
              <p className="text-sm font-medium text-[#111111] dark:text-white">No delivery records found</p>
              <p className="text-xs max-w-sm mx-auto text-zinc-500 dark:text-zinc-400">
                {activeFilter !== "all"
                  ? `No deliveries currently have status '${activeFilter}'.`
                  : "Deliveries appear here automatically when events match registered endpoints."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium">Event</th>
                    <th className="py-2.5 px-3 font-medium">Destination</th>
                    <th className="py-2.5 px-3 font-medium text-center">Attempts</th>
                    <th className="py-2.5 px-3 font-medium">Created</th>
                    <th className="py-2.5 px-3 font-medium">Next Retry</th>
                    <th className="py-2.5 px-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-xs">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="py-3 px-3 text-[#111111] dark:text-white font-medium">
                        {d.eventType}
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 max-w-[220px] truncate" title={d.endpointUrl}>
                        {d.endpointUrl}
                      </td>
                      <td className="py-3 px-3 text-center text-zinc-500 dark:text-zinc-400">
                        {d.attemptsCount}/{d.maxAttempts}
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                        {new Date(d.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                        {d.nextRetryAt ? new Date(d.nextRetryAt).toLocaleTimeString() : "—"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/dashboard/deliveries/${d.id}`}
                          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
