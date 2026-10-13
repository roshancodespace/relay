import Link from "next/link";
import { ArrowRight, Rocket, KeyRound, ShieldCheck, FileCode2 } from "lucide-react";
import { CodeTabs } from "@/components/docs/code-tabs";

export default function DocsOverviewPage() {
  const curlExample = `curl -X POST https://relay.dev/api/v1/events \\
  -H "Authorization: Bearer rel_live_8f3a9c72e1..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: evt_ord_90214" \\
  -d '{
    "type": "order.completed",
    "data": {
      "orderId": "ord_90214",
      "amount": 14900,
      "currency": "USD"
    }
  }'`;

  const nodeExample = `import { verifyWebhook } from "@relay/verify"; // or native crypto

export function handleIncomingWebhook(req) {
  const signature = req.headers["relay-signature"];
  const isValid = verifyWebhook(req.rawBody, signature, process.env.RELAY_SECRET);

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Safely process event
  return new Response("OK", { status: 200 });
}`;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Documentation
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          Relay Platform Overview
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Relay is a developer-first webhook delivery engine that accepts HTTP events from your application, persists them idempotently, and delivers them asynchronously with cryptographic HMAC signatures, automatic exponential backoff, and full SSRF prevention.
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/docs/quickstart"
          className="p-5 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:border-black dark:hover:border-white transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-black dark:text-white">
              <Rocket className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-black dark:group-hover:text-white transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-1">
            5-Minute Quickstart
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Set up an endpoint, ingest your first event, and inspect live deliveries.
          </p>
        </Link>

        <Link
          href="/docs/authentication"
          className="p-5 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:border-black dark:hover:border-white transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-black dark:text-white">
              <KeyRound className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-black dark:group-hover:text-white transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-1">
            Authentication
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Authenticate your ingestion requests with scoped API keys.
          </p>
        </Link>

        <Link
          href="/docs/signatures"
          className="p-5 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:border-black dark:hover:border-white transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-black dark:text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-black dark:group-hover:text-white transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-1">
            HMAC Signatures
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Verify outgoing payloads using standard HMAC-SHA256 signatures and timestamp checks.
          </p>
        </Link>

        <Link
          href="/docs/api-reference"
          className="p-5 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:border-black dark:hover:border-white transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-black dark:text-white">
              <FileCode2 className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-black dark:group-hover:text-white transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-1">
            REST API Reference
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Interactive schema reference for events, endpoints, deliveries, and keys.
          </p>
        </Link>
      </div>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          How Relay Works
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Traditional webhooks force your web servers to execute outbound HTTP calls synchronously, leaving you vulnerable to timeouts, slow third-party endpoints, and lost events. Relay isolates the entire lifecycle:
        </p>

        <ol className="list-decimal pl-5 space-y-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <li>
            <strong className="text-[#111111] dark:text-white">Ingestion (Fast ACK):</strong> Your application sends an event to <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">POST /api/v1/events</code>. Relay checks idempotency, persists the event to PostgreSQL, enqueues BullMQ delivery jobs, and returns an immediate <code className="font-mono text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded">202 Accepted</code>.
          </li>
          <li>
            <strong className="text-[#111111] dark:text-white">Fan-Out & Routing:</strong> Relay identifies matching enabled endpoints configured for the event type (e.g., <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">order.*</code> or <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">*</code>).
          </li>
          <li>
            <strong className="text-[#111111] dark:text-white">SSRF Verification:</strong> Before opening any socket, the worker resolves DNS and validates that the destination IP does not belong to private networks, loopbacks, or cloud metadata endpoints.
          </li>
          <li>
            <strong className="text-[#111111] dark:text-white">Signed HTTP Dispatch:</strong> Relay computes an HMAC-SHA256 signature using the endpoint&apos;s secret and issues an HTTP POST request with a 10-second timeout.
          </li>
          <li>
            <strong className="text-[#111111] dark:text-white">Smart Exponential Retries:</strong> If the destination responds with 5xx or times out, Relay applies exponential backoff with full jitter to retry safely up to your configured maximum attempts.
          </li>
        </ol>
      </section>

      {/* Code Example Preview */}
      <section className="space-y-4 pt-4 border-t border-[#e7e7e5] dark:border-white/[0.08]">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Event Ingestion Example
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Submit events using any standard HTTP client:
        </p>
        <CodeTabs
          snippets={[
            { label: "cURL", language: "curl", code: curlExample },
            { label: "Receiver Handler (Node.js)", language: "typescript", code: nodeExample },
          ]}
          title="POST /api/v1/events"
        />
      </section>

      {/* Core Guarantees */}
      <section className="space-y-4 pt-4 border-t border-[#e7e7e5] dark:border-white/[0.08]">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Core Guarantees
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] space-y-1.5">
            <span className="text-xs font-semibold text-[#111111] dark:text-white block">
              At-Least-Once Delivery
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Every delivery attempt is tracked in durable storage. Un-enqueued or stranded jobs are auto-recovered by background sweepers.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] space-y-1.5">
            <span className="text-xs font-semibold text-[#111111] dark:text-white block">
              SSRF Defenses
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Pre-socket DNS resolution rejects private IP ranges (RFC 1918), loopback, and cloud metadata services (169.254.169.254).
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] space-y-1.5">
            <span className="text-xs font-semibold text-[#111111] dark:text-white block">
              Idempotent Ingestion
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Pass an Idempotency-Key header on event submission to safely retry network failures without duplicating webhook dispatches.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
