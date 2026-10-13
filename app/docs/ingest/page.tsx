import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeTabs } from "@/components/docs/code-tabs";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function EventIngestionPage() {
  const curlExample = `curl -X POST https://relay.dev/api/v1/events \\
  -H "Authorization: Bearer rel_live_..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: ord_checkout_991823" \\
  -d '{
    "type": "order.completed",
    "data": {
      "orderId": "ord_991823",
      "customer": {
        "id": "cus_401",
        "email": "sarah@acme.com"
      },
      "amount": 8900,
      "currency": "USD",
      "items": [
        { "sku": "PLAN_PRO_ANNUAL", "qty": 1 }
      ]
    }
  }'`;

  const responseJson = `{
  "id": "019283a1-7c42-7890-a1b2-c3d4e5f60001",
  "type": "order.completed",
  "created_at": "2026-10-14T02:30:00.000Z",
  "deliveries": [
    {
      "id": "019283a1-7c42-7890-a1b2-c3d4e5f60002",
      "endpoint_id": "019283a1-7c42-7890-a1b2-c3d4e5f60003",
      "status": "pending"
    }
  ]
}`;

  return (
    <div className="space-y-10 font-sans">
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Core Guides
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          Event Ingestion & Idempotency
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Submit events through Relay&apos;s high-throughput ingestion API. Relay persists the event record and schedules asynchronous dispatches to all matching registered endpoints.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Ingestion Endpoint
        </h2>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            POST
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">/api/v1/events</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The ingestion endpoint validates authorization, enforces payload schema, registers the event in PostgreSQL, and enqueues BullMQ jobs in Redis before returning a fast 202 Accepted response.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Request Headers
        </h2>
        <ParamTable
          params={[
            {
              name: "Authorization",
              type: "string",
              required: true,
              description: "Bearer token formatted as Bearer rel_live_...",
            },
            {
              name: "Content-Type",
              type: "string",
              required: true,
              description: "Must be application/json",
            },
            {
              name: "Idempotency-Key",
              type: "string",
              required: false,
              description:
                "Unique client key to prevent duplicate processing if your network request drops and you retry submission.",
            },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Request Body Parameters
        </h2>
        <ParamTable
          params={[
            {
              name: "type",
              type: "string",
              required: true,
              description:
                "Event type name. Follows dot-notation convention (e.g. order.created, user.signup, invoice.payment_succeeded). Maximum 100 characters.",
            },
            {
              name: "data",
              type: "object (JSON)",
              required: true,
              description:
                "Arbitrary JSON payload dispatched to destination webhooks. Maximum size: 256 KB.",
            },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Example Ingestion
        </h2>
        <CodeTabs
          snippets={[
            { label: "Request (cURL)", language: "curl", code: curlExample },
            { label: "Response (202 Accepted)", language: "json", code: responseJson },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          How Idempotency Works
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          If your client submits an event with an <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">Idempotency-Key</code> header:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <li>Relay checks if an event with this key was already ingested for this project.</li>
          <li>If an existing event is found, Relay skips database insertion and re-queuing, returning the existing event ID and delivery status immediately.</li>
          <li>No duplicate webhooks are dispatched to your destination endpoints.</li>
        </ol>

        <Callout type="tip" title="Idempotency Strategy">
          Use natural business entity IDs as your idempotency keys, such as <code className="font-mono text-xs">evt_order_{"{order_id}"}</code> or <code className="font-mono text-xs">evt_invoice_{"{invoice_number}"}</code>.
        </Callout>
      </section>

      {/* Next steps */}
      <div className="pt-8 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/authentication"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Authentication
        </Link>
        <Link
          href="/docs/signatures"
          className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>HMAC Signatures Guide</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
