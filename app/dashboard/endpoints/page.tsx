"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCw,
  Power,
  Eye,
  EyeOff,
} from "lucide-react";

interface EndpointItem {
  id: string;
  url: string;
  description: string | null;
  eventTypes: string[];
  signingSecret: string;
  isEnabled: boolean;
  createdAt: string;
}

export default function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<EndpointItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newUrl, setNewUrl] = useState("https://httpbin.org/post");
  const [newDesc, setNewDesc] = useState("Production webhook target");
  const [newEventTypes, setNewEventTypes] = useState("order.created, payment.succeeded");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEndpoints = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/endpoints");
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const types = newEventTypes
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/v1/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newUrl.trim(),
          description: newDesc.trim() || undefined,
          eventTypes: types.length > 0 ? types : ["*"],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create endpoint.");
      } else {
        setNewUrl("");
        setNewDesc("");
        setNewEventTypes("*");
        fetchEndpoints();
      }
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (ep: EndpointItem) => {
    try {
      const res = await fetch(`/api/v1/endpoints?id=${ep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !ep.isEnabled }),
      });
      if (res.ok) {
        fetchEndpoints();
      }
    } catch {
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this endpoint? Undelivered events will no longer reach it.")) return;
    try {
      const res = await fetch(`/api/v1/endpoints?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEndpoints();
      }
    } catch {
    }
  };

  const handleCopySecret = async (id: string, secret: string) => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Endpoints"
        description="Destinations receiving signed event deliveries"
        onRefresh={fetchEndpoints}
        isRefreshing={isLoading}
      />

      <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                  Registered Endpoints
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Pre-flight DNS and SSRF protected destinations
                </p>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {endpoints.length} active
              </span>
            </div>

            {endpoints.length === 0 && !isLoading ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
                <p className="text-sm font-medium text-[#111111] dark:text-white">No endpoints registered yet</p>
                <p className="text-xs max-w-sm mx-auto text-zinc-500 dark:text-zinc-400">
                  Register a destination URL on the right. Each endpoint is assigned a dedicated HMAC-SHA256 signing secret.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06]">
                {endpoints.map((ep) => {
                  const isRevealed = revealedSecrets[ep.id];
                  const isCopied = copiedId === ep.id;

                  return (
                    <div key={ep.id} className="py-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#111111] dark:text-white font-medium truncate">
                              {ep.url}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${ep.isEnabled
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                }`}
                            >
                              {ep.isEnabled ? "Active" : "Disabled"}
                            </span>
                          </div>
                          {ep.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {ep.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(ep)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                            title={ep.isEnabled ? "Disable endpoint" : "Enable endpoint"}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ep.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete endpoint"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">Subscribed:</span>
                        {ep.eventTypes.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">Secret:</span>
                        <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                          {isRevealed
                            ? ep.signingSecret
                            : `${ep.signingSecret.slice(0, 10)}••••••••••••••••••••••••`}
                        </code>
                        <button
                          type="button"
                          onClick={() => toggleReveal(ep.id)}
                          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                          title={isRevealed ? "Hide secret" : "Reveal secret"}
                        >
                          {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopySecret(ep.id, ep.signingSecret)}
                          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                          title="Copy secret"
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Add Endpoint
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Register a new HTTPS delivery recipient
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs font-mono text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Primary Billing Webhook"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Event Types (comma separated, * for all)
                </label>
                <input
                  type="text"
                  value={newEventTypes}
                  onChange={(e) => setNewEventTypes(e.target.value)}
                  placeholder="order.created, payment.succeeded"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-8 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>Register Endpoint</span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
