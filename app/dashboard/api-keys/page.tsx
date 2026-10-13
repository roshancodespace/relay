"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCw,
  CheckCircle2,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [keyName, setKeyName] = useState("Production Ingest Key");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/api-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() || "API Key" }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedRawKey(data.rawKey);
        setKeyName("");
        fetchKeys();
      }
    } catch {
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? External requests using this key will be rejected.")) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/api-keys?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch {
    }
  };

  const handleCopyRawKey = async () => {
    if (!generatedRawKey) return;
    try {
      await navigator.clipboard.writeText(generatedRawKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="API Keys"
        description="Authenticate event ingestion via Bearer token"
        onRefresh={fetchKeys}
        isRefreshing={isLoading}
      />

      <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 pb-4 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          API keys are hashed with <strong>SHA-256</strong> before storage. Raw secret keys are displayed only once at creation and cannot be recovered.
        </div>

        {generatedRawKey && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>New Secret API Key Generated</span>
              </div>
              <button
                type="button"
                onClick={handleCopyRawKey}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium transition-colors"
              >
                {copiedKey ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Secret Key</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white dark:bg-[#09090b] border border-emerald-200 dark:border-emerald-500/20 p-2.5 rounded font-mono text-xs text-emerald-700 dark:text-emerald-400 select-all break-all">
              {generatedRawKey}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Save this secret key securely in your environment variables. Relay never stores the unhashed token.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                  Active Keys
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Tokens authorized for webhook ingestion
                </p>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {keys.length} active
              </span>
            </div>

            {keys.length === 0 && !isLoading ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
                <p className="text-sm font-medium text-[#111111] dark:text-white">No active API keys found</p>
                <p className="text-xs max-w-sm mx-auto text-zinc-500 dark:text-zinc-400">
                  Generate an API key on the right to authenticate programmatic requests to Relay.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06]">
                {keys.map((k) => (
                  <div key={k.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-[#111111] dark:text-white">
                          {k.name}
                        </span>
                        <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                          {k.keyPrefix}...
                        </code>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                        <span>Created {new Date(k.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>
                          {k.lastUsedAt
                            ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                            : "Never used"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Revoke key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Create API Key
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Generate a new Bearer authentication credential
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Key Label
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production Backend"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full h-8 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>Generate Key</span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
