"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  RotateCw,
  Layers,
  Send,
  ArrowRight,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { ThemeToggle } from "@/components/theme-toggle";

const CURL_EXAMPLE = `curl -X POST https://relay.dev/api/v1/events \\
  -H "Authorization: Bearer rel_live_8f3a9c72e1..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: evt_ord_90214" \\
  -d '{
    "type": "order.completed",
    "data": {
      "orderId": "ord_90214",
      "customer": "alice@acme.inc",
      "amount": 14900,
      "currency": "USD"
    }
  }'`;

const VERIFY_EXAMPLE = `import crypto from "node:crypto";

export function verifyWebhook(rawBody, signatureHeader, secret) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map(p => p.split("="))
  );
  
  const signed = \`\${parts.t}.\${rawBody}\`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signed)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(parts.v1, "hex"),
    Buffer.from(expected, "hex")
  );
}`;

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "verify">("curl");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setIsAuthenticated(true);
      })
      .catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#09090b] text-[#111111] dark:text-[#f4f4f5] flex flex-col font-sans">
      <header className="h-13 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/90 dark:bg-[#09090b]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm text-[#111111] dark:text-white">
            <div className="h-5 w-5 rounded bg-[#ff6600] text-white flex items-center justify-center">
              <Zap className="h-3 w-3 fill-current" />
            </div>
            <span className="tracking-tight text-sm font-semibold">Relay</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
            <a href="#pipeline" className="hover:text-black dark:hover:text-white transition-colors">
              Pipeline
            </a>
            <a href="#guarantees" className="hover:text-black dark:hover:text-white transition-colors">
              Guarantees
            </a>
            <a href="#code" className="hover:text-black dark:hover:text-white transition-colors">
              Quickstart
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md bg-[#ff6600] hover:bg-[#e65c00] text-white font-medium text-xs transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-md bg-[#ff6600] hover:bg-[#e65c00] text-white font-medium text-xs transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 space-y-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
              <span>RELAY // RELIABLE WEBHOOK DELIVERY PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] dark:text-white leading-[1.2]">
              At-least-once webhook delivery for developer backends.
            </h1>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Register HTTP endpoints, ingest events via Bearer authentication, and let Relay handle reliable asynchronous dispatch, cryptographic HMAC-SHA256 signatures, exponential backoff with full jitter, and SSRF defenses.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="px-4 py-2 rounded-md bg-[#ff6600] hover:bg-[#e65c00] text-white font-medium text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>{isAuthenticated ? "Open Workspace" : "Create Account"}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-[#18181c] text-[#111111] dark:text-white text-xs transition-colors"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>

          <div id="pipeline" className="pt-8">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Delivery Pipeline Architecture
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#111111] dark:text-white font-semibold">01. Ingestion</span>
                  <Send className="h-3.5 w-3.5 text-[#ff6600]" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  256KB payload limit, SHA-256 API key verification, and transactional idempotency deduplication.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#111111] dark:text-white font-semibold">02. SSRF Defense</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-[#ff6600]" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Pre-flight DNS check blocks RFC 1918 subnets, IPv6 private, and cloud metadata <code>169.254.169.254</code>.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#111111] dark:text-white font-semibold">03. Queue & Retry</span>
                  <RotateCw className="h-3.5 w-3.5 text-[#ff6600]" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Exponential backoff with full jitter preventing thundering herd spikes.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#111111] dark:text-white font-semibold">04. Audit Log</span>
                  <Layers className="h-3.5 w-3.5 text-[#ff6600]" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Chronological recording of every attempt with response status code, roundtrip latency, and body snippet.
                </p>
              </div>
            </div>
          </div>

          <div id="code" className="pt-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Developer Interface
              </span>
              <div className="flex items-center gap-1 bg-[#fafaf9] dark:bg-[#121215] p-0.5 rounded-md border border-[#e7e7e5] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("curl")}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors ${activeCodeTab === "curl"
                    ? "bg-white dark:bg-white/[0.1] text-[#111111] dark:text-white font-medium shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                >
                  cURL Ingestion
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("verify")}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors ${activeCodeTab === "verify"
                    ? "bg-white dark:bg-white/[0.1] text-[#111111] dark:text-white font-medium shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                >
                  Verify Signature
                </button>
              </div>
            </div>

            <CodeBlock
              code={activeCodeTab === "curl" ? CURL_EXAMPLE : VERIFY_EXAMPLE}
              language={activeCodeTab === "curl" ? "bash" : "javascript"}
              title={activeCodeTab === "curl" ? "POST /api/v1/events" : "Recipient Verification"}
            />
          </div>

          <div id="guarantees" className="pt-8 space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Core Technical Guarantees
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold font-mono text-[#111111] dark:text-white">
                  At-Least-Once Delivery
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Deliveries are tracked through finite state machine transitions. Transient HTTP errors automatically schedule retries.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold font-mono text-[#111111] dark:text-white">
                  DNS Rebinding Protection
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Resolves host IP addresses before opening sockets. Explicitly drops private RFC 1918 subnets, loopbacks, and cloud metadata.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold font-mono text-[#111111] dark:text-white">
                  HMAC-SHA256 Signatures
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Every outbound request includes a <code>Relay-Signature</code> header generated from a 64-hex-character secret, timestamp, and raw JSON body.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold font-mono text-[#111111] dark:text-white">
                  Idempotency De-duplication
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Client-specified <code>Idempotency-Key</code> headers ensure network replays safely return the original event without generating duplicate outbound deliveries.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold font-mono text-[#111111] dark:text-white">
                  SHA-256 Key Storage
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Raw Bearer API keys are only disclosed upon creation. The database persists only cryptographically salted SHA-256 hashes.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold font-mono text-[#111111] dark:text-white">
                  Manual Replay Engine
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Deliveries with exhausted retry limits or server outages can be re-triggered manually from the dashboard with a single click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e7e7e5] dark:border-white/[0.08] bg-[#fafaf9] dark:bg-[#09090b] py-8 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="h-4 w-4 rounded bg-[#ff6600] text-white flex items-center justify-center">
              <Zap className="h-2.5 w-2.5 fill-current" />
            </div>
            <span className="text-[#111111] dark:text-white font-semibold">Relay</span>
            <span>—</span>
            <span>Reliable Webhook Delivery Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link href="/login" className="hover:text-black dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-black dark:hover:text-white transition-colors">
              Register
            </Link>
            <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
