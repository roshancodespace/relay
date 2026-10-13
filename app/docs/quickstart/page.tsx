import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CodeTabs } from "@/components/docs/code-tabs";
import { Callout } from "@/components/docs/callout";

export default function QuickstartPage() {
  const step3Curl = `curl -X POST http://localhost:3000/api/v1/events \\
  -H "Authorization: Bearer rel_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: evt_quickstart_001" \\
  -d '{
    "type": "customer.created",
    "data": {
      "customerId": "cus_9942",
      "email": "alex@example.com",
      "plan": "pro"
    }
  }'`;

  const receiverCode = `import http from "node:http";
import crypto from "node:crypto";

const SIGNING_SECRET = "whsec_your_endpoint_secret";

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/webhook") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      const sigHeader = req.headers["relay-signature"];
      console.log("Received webhook with signature:", sigHeader);
      
      // Return 200 OK to acknowledge delivery
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: true }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4000, () => {
  console.log("Webhook receiver listening on http://localhost:4000/webhook");
});`;

  return (
    <div className="space-y-10 font-sans">
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Getting Started
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          5-Minute Quickstart
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Learn how to generate an API key, register a destination webhook endpoint, ingest your first event, and observe live dispatch attempts.
        </p>
      </div>

      {/* Step 1 */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black text-xs font-bold">
            1
          </span>
          <h2 className="text-base font-semibold tracking-tight text-[#111111] dark:text-white">
            Generate an API Key
          </h2>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
          Log into your Relay Dashboard, navigate to <Link href="/dashboard/api-keys" className="underline underline-offset-2 font-medium text-black dark:text-white">API Keys</Link>, and click <strong>Create Key</strong>.
          Copy the generated key (formatted like <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">rel_live_...</code>).
        </p>
        <div className="pl-9">
          <Callout type="note" title="API Key Security">
            Relay stores only the cryptographic SHA-256 hash of your API keys. Make sure to copy the plaintext key immediately when generated, as it cannot be retrieved again.
          </Callout>
        </div>
      </section>

      {/* Step 2 */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black text-xs font-bold">
            2
          </span>
          <h2 className="text-base font-semibold tracking-tight text-[#111111] dark:text-white">
            Register a Destination Endpoint
          </h2>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
          In the dashboard, open <Link href="/dashboard/endpoints" className="underline underline-offset-2 font-medium text-black dark:text-white">Endpoints</Link> and click <strong>New Endpoint</strong>.
          Provide the HTTPS URL where your service will receive payloads, and specify which event types you want dispatched (e.g. <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">*</code> for all events, or <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">customer.*</code>).
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
          Relay will automatically generate a secure signing secret (e.g., <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">whsec_...</code>) used to sign all outgoing requests.
        </p>
      </section>

      {/* Step 3 */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black text-xs font-bold">
            3
          </span>
          <h2 className="text-base font-semibold tracking-tight text-[#111111] dark:text-white">
            Publish Your First Event
          </h2>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
          Make a POST request to <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">/api/v1/events</code> with your API key:
        </p>
        <div className="pl-9">
          <CodeTabs
            snippets={[{ label: "cURL", language: "curl", code: step3Curl }]}
            title="Ingest Event"
          />
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
          Relay will respond with HTTP <code className="font-mono text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded">202 Accepted</code> containing an event ID and the initial delivery records created for matching endpoints.
        </p>
      </section>

      {/* Step 4 */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black text-xs font-bold">
            4
          </span>
          <h2 className="text-base font-semibold tracking-tight text-[#111111] dark:text-white">
            Inspect the Delivery in Real Time
          </h2>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
          Open the <Link href="/dashboard/deliveries" className="underline underline-offset-2 font-medium text-black dark:text-white">Deliveries</Link> tab in your dashboard.
          Click into the delivery to see:
        </p>
        <ul className="list-disc pl-14 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
          <li>Exact HTTP status code received (e.g. 200, 404, 500)</li>
          <li>Round-trip response latency in milliseconds</li>
          <li>Outgoing request headers including HMAC signature</li>
          <li>Destination response headers and truncated body</li>
          <li>Manual &quot;Retry Delivery&quot; button to re-trigger failed attempts</li>
        </ul>
      </section>

      {/* Next steps */}
      <div className="pt-8 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Platform Overview
        </Link>
        <Link
          href="/docs/authentication"
          className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>Authentication Guide</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
