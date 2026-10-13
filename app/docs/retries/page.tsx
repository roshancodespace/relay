import Link from "next/link";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { CodeTabs } from "@/components/docs/code-tabs";

export default function RetriesPage() {
  const manualRetryCurl = `curl -X POST https://relay.dev/api/v1/deliveries/del_019283a1/retry \\
  -H "Authorization: Bearer rel_live_..." \\
  -H "Content-Type: application/json"`;

  return (
    <div className="space-y-10 font-sans">
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Reliability & Fault Tolerance
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          Retries & Exponential Backoff
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Learn how Relay distinguishes between transient network failures and permanent client errors, and how full-jitter exponential backoff prevents thundering herds.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          HTTP Status Code Classification
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Not all HTTP errors should be retried. Blindly retrying 404s or 401s consumes server resources without resolving errors. Relay classifies outcomes into three categories:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold text-xs">
              <CheckCircle className="h-4 w-4" />
              <span>Delivered (2xx)</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              HTTP 200–299 indicates successful acknowledgment. Delivery is marked <code className="font-mono text-emerald-700 dark:text-emerald-400">delivered</code> and closed.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold text-xs">
              <RefreshCw className="h-4 w-4" />
              <span>Retryable (5xx, 429, Timeout)</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Transient errors like 500, 502, 503, 504, 429 rate limits, and 10s socket timeouts are re-enqueued with exponential backoff.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50/40 dark:bg-red-500/5 space-y-2">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-semibold text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Permanent Fail (4xx)</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable are marked <code className="font-mono text-red-700 dark:text-red-400">failed</code> immediately.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Backoff Algorithm &amp; Jitter
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          When an endpoint goes down, hundreds of webhooks might fail simultaneously. If retried on rigid schedules, they hit the recovering server at the exact same second, causing another crash (the &quot;thundering herd&quot;).
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Relay solves this using <strong>Full Jitter Exponential Backoff</strong>:
        </p>

        <div className="p-4 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa] dark:bg-[#121215] font-mono text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <div>base_delay = 15 seconds</div>
          <div>max_cap = 3600 seconds (1 hour)</div>
          <div>max_delay = min(max_cap, base_delay * 2^(attempt - 1))</div>
          <div className="text-[#ff6600] font-semibold">actual_delay = random_between(0, max_delay)</div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          This spreads outgoing retries evenly over time, smoothing the load curve while guaranteeing eventual delivery.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Manual Retries
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          If an endpoint exceeded its maximum attempts or experienced a temporary bug that you have now resolved, you can trigger a manual retry at any time:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <li>
            <strong>From Developer Dashboard:</strong> Navigate to <Link href="/dashboard/deliveries" className="underline font-medium text-black dark:text-white">Deliveries</Link>, select the failed delivery, and click <strong>Retry Delivery</strong>.
          </li>
          <li>
            <strong>Via REST API:</strong> POST directly to the retry endpoint:
          </li>
        </ol>

        <CodeTabs
          snippets={[{ label: "cURL", language: "curl", code: manualRetryCurl }]}
          title="POST /api/v1/deliveries/:id/retry"
        />
      </section>

      {/* Next steps */}
      <div className="pt-8 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/signatures"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          ← HMAC Signatures
        </Link>
        <Link
          href="/docs/security"
          className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>SSRF & Security Guide</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
