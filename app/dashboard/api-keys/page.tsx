"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button, IconButton } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  X,
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
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [createdKeyData, setCreatedKeyData] = useState<{
    rawKey: string;
    name: string;
    keyPrefix: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPrefixId, setCopiedPrefixId] = useState<string | null>(null);

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
    if (!keyName.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error || "Failed to generate key");
        return;
      }

      const rawKey = data.rawKey || data.key?.rawKey;
      if (rawKey) {
        setCreatedKeyData({
          rawKey,
          name: data.key?.name || keyName.trim(),
          keyPrefix: data.key?.keyPrefix || `${rawKey.slice(0, 13)}...`,
        });
        setKeyName("");
        fetchKeys();
      } else {
        setGenerateError("Failed to retrieve generated key");
      }
    } catch (err) {
      setGenerateError((err as Error).message || "Network error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Requests using it will be rejected.")) {
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
    if (!createdKeyData) return;
    try {
      await navigator.clipboard.writeText(createdKeyData.rawKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
    }
  };


  const handleDismissCreatedKey = () => {
    if (!copiedKey && !confirm("You haven't copied this key yet. Once dismissed, it cannot be recovered. Dismiss anyway?")) {
      return;
    }
    setCreatedKeyData(null);
  };

  const handleCopyPrefix = async (id: string, prefix: string) => {
    try {
      await navigator.clipboard.writeText(prefix);
      setCopiedPrefixId(id);
      setTimeout(() => setCopiedPrefixId(null), 2000);
    } catch {
    }
  };

  const formatKeyPrefix = (prefix: string) => {
    if (!prefix) return "";
    return prefix.endsWith("...") ? prefix : `${prefix}...`;
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
          API keys are hashed with <strong>SHA-256</strong> before storage. Secret keys are displayed only once upon creation and cannot be recovered.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Active Keys Column */}
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

            {/* One-time key display */}
            {createdKeyData && (
              <div className="flex items-center justify-between gap-3 py-2 text-xs font-mono border-b border-emerald-500/30 dark:border-emerald-500/20">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-emerald-600 dark:text-emerald-400 font-sans text-xs font-medium shrink-0">
                    Shown only once:
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate select-all">
                    {createdKeyData.rawKey}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <IconButton
                    variant={copiedKey ? "success" : "primary"}
                    size="sm"
                    icon={copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    onClick={handleCopyRawKey}
                    title={copiedKey ? "Copied!" : "Copy secret key"}
                    aria-label="Copy secret key"
                  />

                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<X className="h-3.5 w-3.5" />}
                    onClick={handleDismissCreatedKey}
                    title="Dismiss"
                    aria-label="Dismiss"
                  />
                </div>
              </div>
            )}

            {keys.length === 0 && !isLoading ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
                <p className="text-sm font-medium text-[#111111] dark:text-white">No active API keys found</p>
                <p className="text-xs max-w-sm mx-auto text-zinc-500 dark:text-zinc-400">
                  Generate an API key on the right to authenticate programmatic requests to Relay.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06]">
                {keys.map((k) => {
                  const displayPrefix = formatKeyPrefix(k.keyPrefix);
                  const isCopied = copiedPrefixId === k.id;

                  return (
                    <div key={k.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-semibold text-[#111111] dark:text-white">
                            {k.name}
                          </span>
                          <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                              {displayPrefix}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopyPrefix(k.id, displayPrefix)}
                              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-0.5"
                              title="Copy prefix"
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
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

                      <IconButton
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => handleRevoke(k.id)}
                        title="Revoke key"
                        aria-label="Revoke key"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Create Key Column */}
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
                  disabled={isGenerating}
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 disabled:opacity-50"
                />
              </div>

              {generateError && (
                <div className="p-2 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  {generateError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isGenerating}
                icon={<Plus className="h-3.5 w-3.5" />}
                disabled={isGenerating || !keyName.trim()}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Key"}
              </Button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
