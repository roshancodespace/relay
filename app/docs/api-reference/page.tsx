"use client";

import { useState, useEffect } from "react";
import { CodeTabs } from "@/components/docs/code-tabs";
import { ParamTable } from "@/components/docs/param-table";
import { Layers, Webhook, Activity, KeyRound, BarChart3, Copy, Check } from "lucide-react";

type Category = "all" | "events" | "endpoints" | "deliveries" | "keys" | "stats";

export default function ApiReferencePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 60);
    }

    const sectionMap: { id: string; cat: Category }[] = [
      { id: "events", cat: "events" },
      { id: "endpoints", cat: "endpoints" },
      { id: "deliveries", cat: "deliveries" },
      { id: "api-keys", cat: "keys" },
      { id: "stats", cat: "stats" },
    ];

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 80;

          if (isBottom) {
            setSelectedCategory("stats");
          } else if (window.scrollY < 180) {
            setSelectedCategory("all");
          } else {
            const threshold = Math.max(260, window.innerHeight * 0.35);
            let current: Category = "all";
            for (const item of sectionMap) {
              const el = document.getElementById(item.id);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= threshold) {
                  current = item.cat;
                }
              }
            }
            setSelectedCategory(current);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handlePillClick = (id: string) => {
    if (id === "all") {
      setSelectedCategory("all");
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setSelectedCategory(id as Category);
      const targetId = id === "keys" ? "api-keys" : id;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", `#${targetId}`);
      }
    }
  };

  const copyUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="space-y-16 font-sans pb-44">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Reference
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          REST API Reference
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Complete specifications and interactive code snippets for all Relay REST endpoints. All requests require standard Bearer token authentication in the Authorization header.
        </p>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Endpoints" },
            { id: "events", label: "Events", icon: Layers },
            { id: "endpoints", label: "Endpoints", icon: Webhook },
            { id: "deliveries", label: "Deliveries", icon: Activity },
            { id: "keys", label: "API Keys", icon: KeyRound },
            { id: "stats", label: "Stats", icon: BarChart3 },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handlePillClick(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${isSelected
                  ? "bg-[#111111] dark:bg-white text-white dark:text-black"
                  : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
              >
                {Icon && <Icon className="h-3 w-3" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: EVENTS */}
      <section id="events" className="space-y-6 scroll-mt-24">
        <div className="pb-3 border-b border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#ff6600]" />
            <span>Events API</span>
          </h2>
        </div>

        <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.08]">
          {/* POST /api/v1/events */}
          <article className="pt-2 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                  POST
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/events
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("POST https://relay.dev/api/v1/events")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "POST https://relay.dev/api/v1/events" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Ingests an event, checks idempotency, persists to PostgreSQL, and schedules asynchronous delivery to matching endpoints.
            </p>

            <ParamTable
              title="Request Body Parameters"
              params={[
                {
                  name: "type",
                  type: "string",
                  required: true,
                  description: "Hierarchical event name (e.g. order.created, user.signup). Max 100 characters.",
                },
                {
                  name: "data",
                  type: "object",
                  required: true,
                  description: "Arbitrary JSON payload dispatched to webhook targets (max 256 KB).",
                },
              ]}
            />

            <ParamTable
              title="Headers"
              params={[
                {
                  name: "Authorization",
                  type: "string",
                  required: true,
                  description: "Bearer rel_live_...",
                },
                {
                  name: "Idempotency-Key",
                  type: "string",
                  required: false,
                  description: "Unique string to prevent duplicate processing on retries.",
                },
              ]}
            />

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X POST https://relay.dev/api/v1/events \\
  -H "Authorization: Bearer rel_live_..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: evt_ord_901" \\
  -d '{"type": "order.created", "data": {"orderId": "ord_901", "total": 9900}}'`,
                },
                {
                  label: "Response (202 Accepted)",
                  language: "json",
                  code: `{
  "id": "019283a1-7c42-7890-a1b2-c3d4e5f60001",
  "type": "order.created",
  "created_at": "2026-10-14T02:00:00.000Z",
  "deliveries": [
    {
      "id": "019283a1-7c42-7890-a1b2-c3d4e5f60002",
      "endpoint_id": "019283a1-7c42-7890-a1b2-c3d4e5f60003",
      "status": "pending"
    }
  ]
}`,
                },
              ]}
            />
          </article>

          {/* GET /api/v1/events */}
          <article className="pt-10 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20">
                  GET
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/events
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("GET https://relay.dev/api/v1/events")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "GET https://relay.dev/api/v1/events" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Returns a paginated list of ingested events for the active project.
            </p>

            <ParamTable
              title="Query Parameters"
              params={[
                {
                  name: "limit",
                  type: "number",
                  required: false,
                  defaultVal: "50",
                  description: "Number of events to retrieve (max 100).",
                },
                {
                  name: "offset",
                  type: "number",
                  required: false,
                  defaultVal: "0",
                  description: "Pagination offset.",
                },
                {
                  name: "search",
                  type: "string",
                  required: false,
                  description: "Filter events matching type name.",
                },
              ]}
            />

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X GET "https://relay.dev/api/v1/events?limit=20" \\
  -H "Authorization: Bearer rel_live_..."`,
                },
                {
                  label: "Response (200 OK)",
                  language: "json",
                  code: `{
  "events": [
    {
      "id": "019283a1-7c42-7890-a1b2-c3d4e5f60001",
      "type": "order.created",
      "created_at": "2026-10-14T02:00:00.000Z",
      "delivery_count": 2
    }
  ],
  "total": 1420
}`,
                },
              ]}
            />
          </article>
        </div>
      </section>

      {/* SECTION: ENDPOINTS */}
      <section id="endpoints" className="space-y-6 scroll-mt-24">
        <div className="pb-3 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white flex items-center gap-2">
            <Webhook className="h-4 w-4 text-[#ff6600]" />
            <span>Endpoints API</span>
          </h2>
        </div>

        <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.08]">
          {/* POST /api/v1/endpoints */}
          <article className="pt-2 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                  POST
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/endpoints
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("POST https://relay.dev/api/v1/endpoints")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "POST https://relay.dev/api/v1/endpoints" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Registers a new webhook destination endpoint. Automatically generates an HMAC signing secret.
            </p>

            <ParamTable
              title="Request Body Parameters"
              params={[
                {
                  name: "url",
                  type: "string",
                  required: true,
                  description: "Target HTTPS destination URL. Subjected to SSRF and private IP validation.",
                },
                {
                  name: "eventTypes",
                  type: "string[]",
                  required: true,
                  description: "Array of subscribed event types (e.g. ['*'] or ['order.*', 'customer.created']).",
                },
                {
                  name: "isEnabled",
                  type: "boolean",
                  required: false,
                  defaultVal: "true",
                  description: "Whether the endpoint should immediately receive dispatches.",
                },
              ]}
            />

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X POST https://relay.dev/api/v1/endpoints \\
  -H "Authorization: Bearer rel_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://api.acme.com/webhooks/relay",
    "eventTypes": ["order.*"]
  }'`,
                },
                {
                  label: "Response (201 Created)",
                  language: "json",
                  code: `{
  "endpoint": {
    "id": "end_019283a1",
    "url": "https://api.acme.com/webhooks/relay",
    "event_types": ["order.*"],
    "signing_secret": "whsec_b8f410c9...",
    "is_enabled": true,
    "created_at": "2026-10-14T02:00:00.000Z"
  }
}`,
                },
              ]}
            />
          </article>

          {/* DELETE /api/v1/endpoints/:id */}
          <article className="pt-10 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20">
                  DELETE
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/endpoints/:id
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("DELETE https://relay.dev/api/v1/endpoints/:id")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "DELETE https://relay.dev/api/v1/endpoints/:id" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Deletes an endpoint. Pending or historical deliveries retain audit logs, but future dispatches are stopped.
            </p>

            <ParamTable
              title="Path Parameters"
              params={[
                {
                  name: "id",
                  type: "string",
                  required: true,
                  description: "Unique endpoint identifier (e.g. end_019283a1).",
                },
              ]}
            />

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X DELETE https://relay.dev/api/v1/endpoints/end_019283a1 \\
  -H "Authorization: Bearer rel_live_..."`,
                },
                {
                  label: "Response (200 OK)",
                  language: "json",
                  code: `{
  "success": true,
  "message": "Endpoint successfully deleted."
}`,
                },
              ]}
            />
          </article>
        </div>
      </section>

      {/* SECTION: DELIVERIES */}
      <section id="deliveries" className="space-y-6 scroll-mt-24">
        <div className="pb-3 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#ff6600]" />
            <span>Deliveries API</span>
          </h2>
        </div>

        <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.08]">
          {/* GET /api/v1/deliveries */}
          <article className="pt-2 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20">
                  GET
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/deliveries
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("GET https://relay.dev/api/v1/deliveries")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "GET https://relay.dev/api/v1/deliveries" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Fetches all delivery records across endpoints, with filtering by status and search queries.
            </p>

            <ParamTable
              title="Query Parameters"
              params={[
                {
                  name: "status",
                  type: "string",
                  required: false,
                  description: "Filter by delivery status: pending | retrying | delivered | failed.",
                },
                {
                  name: "limit",
                  type: "number",
                  required: false,
                  defaultVal: "50",
                  description: "Pagination limit (max 100).",
                },
              ]}
            />

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X GET "https://relay.dev/api/v1/deliveries?status=failed&limit=10" \\
  -H "Authorization: Bearer rel_live_..."`,
                },
                {
                  label: "Response (200 OK)",
                  language: "json",
                  code: `{
  "deliveries": [
    {
      "id": "del_019283a1-7c42",
      "endpoint_id": "end_019283a1",
      "status": "failed",
      "status_code": 504,
      "attempt_count": 5,
      "next_retry_at": null,
      "created_at": "2026-10-14T02:05:00.000Z"
    }
  ]
}`,
                },
              ]}
            />
          </article>

          {/* POST /api/v1/deliveries/:id/retry */}
          <article className="pt-10 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                  POST
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/deliveries/:id/retry
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("POST https://relay.dev/api/v1/deliveries/:id/retry")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "POST https://relay.dev/api/v1/deliveries/:id/retry" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Triggers an immediate manual retry for a delivery, even if it reached max retry limits or failed permanently.
            </p>

            <ParamTable
              title="Path Parameters"
              params={[
                {
                  name: "id",
                  type: "string",
                  required: true,
                  description: "Unique delivery identifier (e.g. del_019283a1).",
                },
              ]}
            />

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X POST https://relay.dev/api/v1/deliveries/del_019283a1/retry \\
  -H "Authorization: Bearer rel_live_..."`,
                },
                {
                  label: "Response (200 OK)",
                  language: "json",
                  code: `{
  "success": true,
  "message": "Manual retry scheduled successfully."
}`,
                },
              ]}
            />
          </article>
        </div>
      </section>

      {/* SECTION: API KEYS */}
      <section id="api-keys" className="space-y-6 scroll-mt-24">
        <div className="pb-3 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#ff6600]" />
            <span>API Keys API</span>
          </h2>
        </div>

        <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.08]">
          <article className="pt-2 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                  POST
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/api-keys
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("POST https://relay.dev/api/v1/api-keys")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "POST https://relay.dev/api/v1/api-keys" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generates a new scoped API key for the current project. The plaintext token is returned only once.
            </p>

            <ParamTable
              title="Request Body Parameters"
              params={[
                {
                  name: "name",
                  type: "string",
                  required: true,
                  description: "Human-readable label for the key (e.g. Production Webhook Publisher).",
                },
              ]}
            />

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X POST https://relay.dev/api/v1/api-keys \\
  -H "Authorization: Bearer rel_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Production Ingestion Key"}'`,
                },
                {
                  label: "Response (201 Created)",
                  language: "json",
                  code: `{
  "id": "key_019283a1",
  "name": "Production Ingestion Key",
  "token": "rel_live_9f8a3b2c1d0e4f5a6b7c8d9e",
  "created_at": "2026-10-14T02:00:00.000Z"
}`,
                },
              ]}
            />
          </article>
        </div>
      </section>

      {/* SECTION: STATS */}
      <section id="stats" className="space-y-6 scroll-mt-24">
        <div className="pb-3 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#ff6600]" />
            <span>Stats API</span>
          </h2>
        </div>

        <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.08]">
          <article className="pt-2 pb-12 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20">
                  GET
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                  /api/v1/stats
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyUrl("GET https://relay.dev/api/v1/stats")}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint === "GET https://relay.dev/api/v1/stats" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Returns aggregated delivery health statistics, success ratios, and hourly delivery volume for the project.
            </p>

            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  language: "curl",
                  code: `curl -X GET https://relay.dev/api/v1/stats \\
  -H "Authorization: Bearer rel_live_..."`,
                },
                {
                  label: "Response (200 OK)",
                  language: "json",
                  code: `{
  "total_events": 24890,
  "total_deliveries": 31200,
  "delivered_count": 30890,
  "failed_count": 310,
  "success_rate": 99.01,
  "avg_latency_ms": 142
}`,
                },
              ]}
            />
          </article>
        </div>
      </section>
    </div>
  );
}
