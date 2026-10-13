"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge, DeliveryStatus } from "@/components/ui/status-badge";
import { CodeBlock } from "@/components/ui/code-block";
import {
  ArrowLeft,
  RotateCw,
  ExternalLink,
} from "lucide-react";

interface DeliveryAttempt {
  id: string;
  attemptNumber: number;
  statusCode: number | null;
  responseTimeMs: number;
  responseBody: string | null;
  responseHeaders: Record<string, string> | null;
  errorMessage: string | null;
  attemptedAt: string;
}

interface DeliveryDetail {
  delivery: {
    id: string;
    status: DeliveryStatus;
    attemptsCount: number;
    maxAttempts: number;
    nextRetryAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  event: {
    id: string;
    eventType: string;
    payload: Record<string, unknown>;
    createdAt: string;
  } | null;
  endpoint: {
    id: string;
    url: string;
    isEnabled: boolean;
  } | null;
  attempts: DeliveryAttempt[];
}

function DeliveryInspectorContent() {
  const routeParams = useParams<{ id: string }>();
  const id = routeParams?.id;
  const [data, setData] = useState<DeliveryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/deliveries/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.attempts && json.attempts.length > 0 && !selectedAttemptId) {
          setSelectedAttemptId(json.attempts[0].id);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    setRetryMessage(null);
    try {
      const res = await fetch(`/api/v1/deliveries/${id}/retry`, {
        method: "POST",
      });
      if (res.ok) {
        setRetryMessage("Manual retry scheduled successfully.");
        await fetchDetail();
      } else {
        const err = await res.json();
        setRetryMessage(`Retry failed: ${err.error?.message || "Unknown error"}`);
      }
    } catch (e) {
      setRetryMessage(`Retry error: ${(e as Error).message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!data && isLoading) {
    return <DeliveryInspectorSkeleton />;
  }

  const selectedAttempt =
    data?.attempts.find((a) => a.id === selectedAttemptId) ||
    data?.attempts[0];

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Delivery Details"
        description={`ID: ${id}`}
        onRefresh={fetchDetail}
        isRefreshing={isLoading}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="h-8 px-3 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Retry Delivery</span>
            </button>
            <Link
              href="/dashboard/deliveries"
              className="h-8 px-3 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-[#18181c] text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>All Deliveries</span>
            </Link>
          </div>
        }
      />

      <main className="p-6 sm:p-8 space-y-10 max-w-7xl w-full mx-auto">
        {retryMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span>{retryMessage}</span>
            <button
              type="button"
              onClick={() => setRetryMessage(null)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-8 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Delivery Status
                </span>
                <div>
                  <StatusBadge status={data.delivery.status} />
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {data.delivery.attemptsCount} of {data.delivery.maxAttempts} attempts used
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Destination URL
                </span>
                <div className="font-mono text-xs text-[#111111] dark:text-white truncate" title={data.endpoint?.url}>
                  {data.endpoint?.url || "Endpoint deleted"}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {data.endpoint?.isEnabled ? "Endpoint active" : "Endpoint disabled"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Event Type
                </span>
                <div className="text-xs font-semibold text-[#111111] dark:text-white">
                  {data.event?.eventType || "Unknown"}
                </div>
                {data.event && (
                  <Link
                    href={`/dashboard/events/${data.event.id}`}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect event record</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Timeline
                </span>
                <div className="text-xs text-[#111111] dark:text-white">
                  Created {new Date(data.delivery.createdAt).toLocaleTimeString()}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {data.delivery.completedAt
                    ? `Completed ${new Date(data.delivery.completedAt).toLocaleTimeString()}`
                    : data.delivery.nextRetryAt
                      ? `Next retry scheduled`
                      : "Pending execution"}
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                  Dispatch Attempts ({data.attempts.length})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Chronological HTTP response log for this delivery
                </p>
              </div>

              {data.attempts.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                  Delivery is queued. No HTTP dispatch attempts executed yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    {data.attempts.map((att) => {
                      const isSelected = selectedAttempt?.id === att.id;
                      const isSuccess = att.statusCode && att.statusCode >= 200 && att.statusCode < 300;

                      return (
                        <button
                          key={att.id}
                          onClick={() => setSelectedAttemptId(att.id)}
                          type="button"
                          className={`w-full text-left p-3 rounded-md transition-colors flex items-center justify-between text-xs ${isSelected
                            ? "bg-zinc-200/70 dark:bg-white/[0.08] text-[#111111] dark:text-white font-medium"
                            : "hover:bg-zinc-100 dark:hover:bg-white/[0.03] text-zinc-600 dark:text-zinc-400"
                            }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span>Attempt #{att.attemptNumber}</span>
                              <span
                                className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${isSuccess
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                                  }`}
                              >
                                {att.statusCode ? `HTTP ${att.statusCode}` : "Network Error"}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
                              {new Date(att.attemptedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {att.responseTimeMs}ms
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    {selectedAttempt ? (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs">
                          <span className="font-semibold text-[#111111] dark:text-white">
                            Attempt #{selectedAttempt.attemptNumber} Breakdown
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Latency: <strong className="text-[#111111] dark:text-white font-medium">{selectedAttempt.responseTimeMs}ms</strong>
                          </span>
                        </div>

                        {selectedAttempt.errorMessage && (
                          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400">
                            <span className="font-semibold block mb-0.5">Failure Reason:</span>
                            <span>{selectedAttempt.errorMessage}</span>
                          </div>
                        )}

                        {selectedAttempt.responseHeaders && (
                          <div className="space-y-1.5">
                            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                              Response Headers
                            </span>
                            <CodeBlock
                              code={JSON.stringify(selectedAttempt.responseHeaders, null, 2)}
                              language="json"
                              maxHeight="max-h-36"
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                            Response Body
                          </span>
                          <CodeBlock
                            code={selectedAttempt.responseBody || "(Empty response body)"}
                            language="json"
                            maxHeight="max-h-48"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-zinc-500">Select an attempt to view payload</div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {data.event && (
              <section className="space-y-3 pt-4 border-t border-[#e7e7e5] dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                  Delivered Payload (JSON)
                </h2>
                <CodeBlock
                  code={JSON.stringify(data.event.payload, null, 2)}
                  language="json"
                  title="Original Payload"
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function DeliveryInspectorSkeleton() {
  return (
    <div className="flex-1 flex flex-col font-sans animate-pulse">
      <header className="sticky top-0 z-20 h-13 px-6 sm:px-8 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4 w-28 bg-zinc-200 dark:bg-white/[0.08] rounded" />
          <div className="h-3 w-40 bg-zinc-200 dark:bg-white/[0.05] rounded hidden md:block" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-zinc-200 dark:bg-white/[0.08] rounded-md" />
        </div>
      </header>

      <main className="p-6 sm:p-8 space-y-10 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-8 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-zinc-200 dark:bg-white/[0.05] rounded" />
              <div className="h-4 w-28 bg-zinc-200 dark:bg-white/[0.08] rounded" />
              <div className="h-3 w-32 bg-zinc-200 dark:bg-white/[0.04] rounded" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-4 w-36 bg-zinc-200 dark:bg-white/[0.08] rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-zinc-200/60 dark:bg-white/[0.04] rounded-md" />
              ))}
            </div>
            <div className="md:col-span-2 h-48 bg-zinc-200/60 dark:bg-white/[0.04] rounded-md" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DeliveryInspectorPage() {
  return (
    <Suspense fallback={<DeliveryInspectorSkeleton />}>
      <DeliveryInspectorContent />
    </Suspense>
  );
}
