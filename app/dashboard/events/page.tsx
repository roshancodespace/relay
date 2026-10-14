"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Search } from "lucide-react";

interface EventItem {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey: string | null;
  createdAt: string;
  deliveriesCount: number;
}

export default function EventsListPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/events?limit=100");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = events.filter((e) =>
    e.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.idempotencyKey && e.idempotencyKey.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Events"
        description="Ingested webhook events and fan-out dispatches"
        onRefresh={fetchEvents}
        isRefreshing={isLoading}
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <div className="relative w-full sm:w-80">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by event type, ID, idempotency key..."
              className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-4">
            <span>
              Total Events:{" "}
              {isLoading ? (
                <span className="inline-block h-3.5 w-6 bg-zinc-200/70 dark:bg-white/[0.08] rounded animate-pulse align-middle ml-1" />
              ) : (
                <strong className="text-[#111111] dark:text-white font-medium">{events.length}</strong>
              )}
            </span>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3 font-medium">Event Type</th>
                    <th className="py-2.5 px-3 font-medium">Event ID</th>
                    <th className="py-2.5 px-3 font-medium">Idempotency Key</th>
                    <th className="py-2.5 px-3 font-medium text-center">Deliveries</th>
                    <th className="py-2.5 px-3 font-medium">Ingested At</th>
                    <th className="py-2.5 px-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-xs">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-3">
                        <div className="h-4 w-28 bg-zinc-200/70 dark:bg-white/[0.06] rounded" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-32 bg-zinc-200/50 dark:bg-white/[0.04] rounded" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-20 bg-zinc-200/40 dark:bg-white/[0.03] rounded" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="h-4 w-14 bg-zinc-200/50 dark:bg-white/[0.04] rounded mx-auto" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="h-4 w-16 bg-zinc-200/50 dark:bg-white/[0.04] rounded" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="h-4 w-16 bg-zinc-200/50 dark:bg-white/[0.04] rounded ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
              <p className="text-sm font-medium text-[#111111] dark:text-white">No ingested events found</p>
              <p className="text-xs max-w-sm mx-auto text-zinc-500 dark:text-zinc-400">
                Submit an event using the simulator on the overview page or via HTTP POST to see events appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3 font-medium">Event Type</th>
                    <th className="py-2.5 px-3 font-medium">Event ID</th>
                    <th className="py-2.5 px-3 font-medium">Idempotency Key</th>
                    <th className="py-2.5 px-3 font-medium text-center">Deliveries</th>
                    <th className="py-2.5 px-3 font-medium">Ingested At</th>
                    <th className="py-2.5 px-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-xs">
                  {filtered.map((evt) => (
                    <tr key={evt.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-[#111111] dark:text-white font-medium">
                        {evt.eventType}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[140px] truncate" title={evt.id}>
                        {evt.id}
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                        {evt.idempotencyKey || "—"}
                      </td>
                      <td className="py-3 px-3 text-center text-zinc-600 dark:text-zinc-400">
                        {evt.deliveriesCount} fan-out
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/dashboard/events/${evt.id}`}
                          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                          View Details
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
