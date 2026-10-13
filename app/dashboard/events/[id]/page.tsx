"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { CodeBlock } from "@/components/ui/code-block";
import { ArrowLeft } from "lucide-react";

interface EventDetail {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey: string | null;
  createdAt: string;
}

interface DeliverySummary {
  id: string;
  status: "pending" | "retrying" | "delivered" | "failed";
  attemptsCount: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  endpointId: string;
  endpointUrl: string;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [deliveries, setDeliveries] = useState<DeliverySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setDeliveries(data.deliveries || []);
      } else {
        setError("Event not found or unauthorized");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Event Details"
        description={`ID: ${id}`}
        onRefresh={fetchDetail}
        isRefreshing={isLoading}
        action={
          <Link
            href="/dashboard/events"
            className="h-8 px-3 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-[#18181c] text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>All Events</span>
          </Link>
        }
      />

      <main className="p-6 sm:p-8 space-y-10 max-w-7xl w-full mx-auto">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {event && (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-8 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Event Type
                </span>
                <div className="text-sm font-semibold text-[#111111] dark:text-white">
                  {event.eventType}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Ingested {new Date(event.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Event ID
                </span>
                <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all select-all">
                  {event.id}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Idempotency Key
                </span>
                <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {event.idempotencyKey || "None provided"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Outbound Targets
                </span>
                <div className="text-sm font-semibold text-[#111111] dark:text-white">
                  {deliveries.length} destination(s)
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                  Outbound Deliveries ({deliveries.length})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Endpoints dispatched for this event
                </p>
              </div>

              {deliveries.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                  No matching endpoints subscribed to event type &lsquo;{event.eventType}&rsquo;.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                        <th className="py-2.5 px-3 font-medium">Status</th>
                        <th className="py-2.5 px-3 font-medium">Destination URL</th>
                        <th className="py-2.5 px-3 font-medium text-center">Attempts</th>
                        <th className="py-2.5 px-3 font-medium">Created</th>
                        <th className="py-2.5 px-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-xs">
                      {deliveries.map((del) => (
                        <tr key={del.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3">
                            <StatusBadge status={del.status} />
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-[#111111] dark:text-white max-w-[300px] truncate" title={del.endpointUrl}>
                            {del.endpointUrl}
                          </td>
                          <td className="py-3 px-3 text-center text-zinc-600 dark:text-zinc-400">
                            {del.attemptsCount} / {del.maxAttempts}
                          </td>
                          <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                            {new Date(del.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/dashboard/deliveries/${del.id}`}
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
            </section>

            <section className="space-y-3 pt-4 border-t border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Ingested Payload (JSON)
              </h2>
              <CodeBlock
                code={JSON.stringify(event.payload, null, 2)}
                language="json"
                title="Event Data"
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
