"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Send,
  ChevronRight,
  RotateCw,
} from "lucide-react";

interface Metrics {
  totalEvents: number;
  delivered: number;
  retrying: number;
  failed: number;
  pending: number;
  avgLatencyMs: number;
}

interface RecentDelivery {
  id: string;
  status: "pending" | "retrying" | "delivered" | "failed";
  attemptsCount: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  eventType: string;
  eventId: string;
  endpointUrl: string;
}

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalEvents: 0,
    delivered: 0,
    retrying: 0,
    failed: 0,
    pending: 0,
    avgLatencyMs: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testEventType, setTestEventType] = useState("order.created");
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        orderId: "ord_1042",
        customer: { email: "dev@acme.corp" },
        amount: 8500,
        currency: "USD",
      },
      null,
      2
    )
  );
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentDeliveries) setRecentDeliveries(data.recentDeliveries);
      }
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSendTestEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEvent(true);
    setTestResponse(null);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(testPayload);
    } catch {
      setTestResponse(JSON.stringify({ error: "Invalid JSON in payload" }, null, 2));
      setIsSubmittingEvent(false);
      return;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Idempotency-Key": `sim_${Date.now()}`,
      };

      if (apiKeyInput.trim()) {
        headers["Authorization"] = `Bearer ${apiKeyInput.trim()}`;
      }

      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: testEventType,
          data: parsed,
        }),
      });

      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
      fetchData();
    } catch (err) {
      setTestResponse(JSON.stringify({ error: (err as Error).message }, null, 2));
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Overview"
        description="Delivery pipeline throughput and telemetry"
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        action={
          <Link
            href="/dashboard/events"
            className="h-7 px-3 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>View Events</span>
          </Link>
        }
      />

      <main className="p-6 sm:p-8 space-y-10 max-w-7xl w-full mx-auto">
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 pb-8 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
              Total Ingested
            </span>
            <div className="text-2xl font-semibold text-[#111111] dark:text-white">
              {metrics.totalEvents.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">All recorded events</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
              Delivered
            </span>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.delivered.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">2xx Acknowledged</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-medium">
              In Retry
            </span>
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
              {metrics.retrying.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Exponential backoff</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-red-600 dark:text-red-400 font-medium">
              Failed
            </span>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {metrics.failed.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Max retries reached</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-medium">
              Pending
            </span>
            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {metrics.pending.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Queued in pipeline</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
              Avg Latency
            </span>
            <div className="text-2xl font-semibold text-[#111111] dark:text-white">
              {metrics.avgLatencyMs}
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal ml-1">ms</span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Roundtrip response</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                  Live Delivery Feed
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Recent outbound webhook dispatches
                </p>
              </div>
              <Link
                href="/dashboard/deliveries"
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {recentDeliveries.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-3">
                <p className="text-sm font-medium text-[#111111] dark:text-white">No delivery records yet</p>
                <p className="text-xs max-w-sm mx-auto text-zinc-500 dark:text-zinc-400">
                  Register an endpoint and dispatch an event using the simulator to start delivering webhooks.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/dashboard/endpoints"
                    className="h-8 px-3 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-xs text-[#111111] dark:text-white flex items-center transition-colors"
                  >
                    Add Endpoint
                  </Link>
                  <Link
                    href="/dashboard/api-keys"
                    className="h-8 px-3 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium flex items-center transition-colors"
                  >
                    Generate Key
                  </Link>
                </div>
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
                      <th className="py-2.5 px-3 font-medium">Time</th>
                      <th className="py-2.5 px-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-xs">
                    {recentDeliveries.slice(0, 8).map((d) => (
                      <tr key={d.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="py-3 px-3 text-[#111111] dark:text-white font-medium">
                          {d.eventType}
                        </td>
                        <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate" title={d.endpointUrl}>
                          {d.endpointUrl}
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-500 dark:text-zinc-400">
                          {d.attemptsCount}/{d.maxAttempts}
                        </td>
                        <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                          {new Date(d.createdAt).toLocaleTimeString()}
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
          </section>

          <section className="space-y-4">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Dispatch Simulator
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Send test payload via <code className="text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">POST /api/v1/events</code>
              </p>
            </div>

            <form onSubmit={handleSendTestEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  API Key (Bearer)
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="rel_live_... (optional for logged in user)"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Event Type
                </label>
                <input
                  type="text"
                  value={testEventType}
                  onChange={(e) => setTestEventType(e.target.value)}
                  required
                  placeholder="e.g. order.created"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Payload (JSON)
                </label>
                <textarea
                  rows={4}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md p-2.5 font-mono text-[11px] text-[#111111] dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingEvent}
                className="w-full h-8 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmittingEvent ? (
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Dispatch Event</span>
              </button>
            </form>

            {testResponse && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Response
                </span>
                <CodeBlock code={testResponse} language="json" maxHeight="max-h-36" />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
