"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

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
      <ProgressiveBlur />
      <header className="h-13 sticky top-0 z-50 bg-transparent">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
            Relay
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <a href="#pipeline" className="hover:text-black dark:hover:text-white transition-colors">
              Pipeline
            </a>
            <a href="#code" className="hover:text-black dark:hover:text-white transition-colors">
              Interface
            </a>
            <a href="#guarantees" className="hover:text-black dark:hover:text-white transition-colors">
              Guarantees
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-medium text-xs transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-medium text-xs transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 space-y-12">
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
              <span>Reliable Webhook Delivery Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111111] dark:text-white leading-[1.15]">
              At-least-once webhook delivery for developer backends.
            </h1>

            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl font-normal">
              Register HTTP endpoints, submit events through Relay&apos;s API, and let Relay handle asynchronous fan-out, cryptographic HMAC-SHA256 signatures, exponential backoff with full jitter, and SSRF defenses.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="h-9 px-4 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-medium text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>{isAuthenticated ? "Open Dashboard" : "Create Account"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/login"
                className="h-9 px-4 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-[#111111] dark:text-white text-xs transition-colors inline-flex items-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div id="pipeline" className="pt-8">
            <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-4">
              Architecture Pipeline
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-y border-[#e7e7e5] dark:border-white/[0.08]">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#ff6600] block">01. Ingestion</span>
                <h2 className="text-sm font-semibold text-[#111111] dark:text-white">API Authentication</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  256KB payload limit, SHA-256 API key verification, and transactional idempotency deduplication.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#ff6600] block">02. Security</span>
                <h2 className="text-sm font-semibold text-[#111111] dark:text-white">SSRF Defense</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Pre-flight DNS check blocks RFC 1918 subnets, IPv6 loopbacks, and cloud metadata <code className="font-mono text-[11px]">169.254.169.254</code>.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#ff6600] block">03. Reliability</span>
                <h2 className="text-sm font-semibold text-[#111111] dark:text-white">Exponential Jitter</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Configurable backoff with full jitter preventing thundering herd spikes during downstream outages.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#ff6600] block">04. Auditability</span>
                <h2 className="text-sm font-semibold text-[#111111] dark:text-white">Delivery Timeline</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Chronological recording of every HTTP attempt with status codes, roundtrip latency, and body snippet.
                </p>
              </div>
            </div>
          </div>

          <div id="code" className="pt-4 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  Developer Interface
                </div>
                <h2 className="text-sm font-semibold text-[#111111] dark:text-white mt-1">
                  Ingestion & Recipient Verification
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("curl")}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeCodeTab === "curl"
                    ? "bg-[#111111] dark:bg-white text-white dark:text-black font-medium"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                >
                  cURL Ingest
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("verify")}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeCodeTab === "verify"
                    ? "bg-[#111111] dark:bg-white text-white dark:text-black font-medium"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                >
                  Signature Verification
                </button>
              </div>
            </div>

            <CodeBlock
              code={activeCodeTab === "curl" ? CURL_EXAMPLE : VERIFY_EXAMPLE}
              language={activeCodeTab === "curl" ? "bash" : "javascript"}
              title={activeCodeTab === "curl" ? "POST /api/v1/events" : "Recipient HMAC-SHA256 Check"}
            />
          </div>

          <div id="guarantees" className="pt-8 space-y-6">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                System Guarantees
              </div>
              <h2 className="text-sm font-semibold text-[#111111] dark:text-white mt-1">
                Engineered for backend reliability
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#111111] dark:text-white uppercase tracking-wider">
                  At-Least-Once Delivery
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Deliveries transition through a finite state machine. Transient errors trigger automatic exponential retries.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#111111] dark:text-white uppercase tracking-wider">
                  DNS Rebinding Protection
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Resolves host IP addresses before opening sockets. Explicitly blocks private RFC 1918 subnets and cloud metadata.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#111111] dark:text-white uppercase tracking-wider">
                  HMAC-SHA256 Signatures
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Every outbound request includes a timestamped signature header verified against a 64-hex signing secret.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#111111] dark:text-white uppercase tracking-wider">
                  Idempotency De-duplication
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Client-specified idempotency keys prevent network replays from creating duplicate outbound webhook deliveries.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#111111] dark:text-white uppercase tracking-wider">
                  SHA-256 Key Storage
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Raw Bearer API keys are only disclosed upon creation. The database persists only cryptographically salted hashes.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-[#111111] dark:text-white uppercase tracking-wider">
                  Manual Replay Engine
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Deliveries with exhausted retry limits or destination server outages can be re-triggered manually from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa] dark:bg-[#09090b] py-8 text-xs text-zinc-500 dark:text-zinc-400 font-sans">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#111111] dark:text-white font-semibold">Relay</span>
            <span>—</span>
            <span>Reliable Webhook Delivery Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
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
