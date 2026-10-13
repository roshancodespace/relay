import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeTabs } from "@/components/docs/code-tabs";
import { Callout } from "@/components/docs/callout";

export default function AuthenticationPage() {
  const curlAuth = `curl -X POST https://relay.dev/api/v1/events \\
  -H "Authorization: Bearer rel_live_a89f3bc1940e72..." \\
  -H "Content-Type: application/json" \\
  -d '{"type": "invoice.paid", "data": {"id": "inv_123"}}'`;

  const nodeAuth = `const response = await fetch("https://relay.dev/api/v1/events", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.RELAY_API_KEY}\`,
    "Content-Type": "application/json",
    "Idempotency-Key": "evt_inv_123",
  },
  body: JSON.stringify({
    type: "invoice.paid",
    data: { id: "inv_123", total: 12000 },
  }),
});`;

  const pythonAuth = `import os
import requests

headers = {
    "Authorization": f"Bearer {os.getenv('RELAY_API_KEY')}",
    "Content-Type": "application/json",
    "Idempotency-Key": "evt_inv_123"
}

payload = {
    "type": "invoice.paid",
    "data": {"id": "inv_123", "total": 12000}
}

response = requests.post("https://relay.dev/api/v1/events", json=payload, headers=headers)`;

  return (
    <div className="space-y-10 font-sans">
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Security & Access
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          API Authentication
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          All Relay REST API requests must be authenticated using project-scoped Bearer tokens.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Header Format
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Provide your API key in the standard <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">Authorization</code> header:
        </p>
        <div className="p-3 bg-zinc-100 dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md font-mono text-xs text-[#111111] dark:text-zinc-200">
          Authorization: Bearer rel_live_&lt;YOUR_API_KEY&gt;
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Requests missing this header or providing an invalid/revoked key will be rejected with <code className="font-mono text-xs bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-1 py-0.5 rounded">401 Unauthorized</code>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Code Examples
        </h2>
        <CodeTabs
          snippets={[
            { label: "cURL", language: "curl", code: curlAuth },
            { label: "Node.js", language: "typescript", code: nodeAuth },
            { label: "Python", language: "python", code: pythonAuth },
          ]}
          title="Authenticated Request"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Key Format & Storage Architecture
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <li>
            <strong>Prefix:</strong> All live keys begin with <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">rel_live_</code> followed by 48 cryptographic random hexadecimal characters.
          </li>
          <li>
            <strong>One-Way Hashing:</strong> Plaintext keys are never written to the Relay database. Relay computes a cryptographic SHA-256 hash upon creation and validates tokens via constant-time database index lookups.
          </li>
          <li>
            <strong>Scoping:</strong> Each API key belongs strictly to a specific Project. Webhooks, endpoints, and event quotas are completely isolated between projects.
          </li>
        </ul>

        <Callout type="security" title="Best Practices">
          Always store your API keys in environment variables (<code className="font-mono text-xs">RELAY_API_KEY</code>) and never commit them to public version control. If an API key is accidentally exposed, immediately revoke it from the <Link href="/dashboard/api-keys" className="underline font-medium text-[#ff6600]">API Keys</Link> dashboard.
        </Callout>
      </section>

      {/* Next steps */}
      <div className="pt-8 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/quickstart"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          ← 5-Minute Quickstart
        </Link>
        <Link
          href="/docs/ingest"
          className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>Event Ingestion & Idempotency</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
