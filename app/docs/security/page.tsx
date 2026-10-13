import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { Callout } from "@/components/docs/callout";

export default function SecurityPage() {
  return (
    <div className="space-y-10 font-sans">
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Infrastructure Security
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          SSRF Defenses &amp; Endpoint Protection
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Allowing users to configure custom webhook URLs creates critical Server-Side Request Forgery (SSRF) vulnerabilities. Relay enforces hardened network defenses before any TCP connection is established.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Why SSRF is Dangerous in Webhook Platforms
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          If a malicious actor registers a webhook URL targeting internal infrastructure (such as AWS/GCP instance metadata <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">http://169.254.169.254</code> or <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">http://localhost:5432</code>), a naive HTTP dispatcher would send internal credentials or manipulate internal services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Relay&apos;s Multi-Layered Defense Architecture
        </h2>

        <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <div className="p-4 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] space-y-1.5">
            <h3 className="font-semibold text-[#111111] dark:text-white text-xs">
              1. Static URL &amp; Syntax Verification
            </h3>
            <p>
              When an endpoint is registered, Relay checks protocol schemes, disallowing non-HTTP protocols (<code className="font-mono text-xs">file:</code>, <code className="font-mono text-xs">gopher:</code>, <code className="font-mono text-xs">ftp:</code>) and rejecting user credentials embedded in URLs (<code className="font-mono text-xs">user:pass@host</code>).
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] space-y-1.5">
            <h3 className="font-semibold text-[#111111] dark:text-white text-xs">
              2. Pre-Socket DNS Resolution &amp; Rebinding Mitigation
            </h3>
            <p>
              Attackers can use DNS rebinding (returning a public IP during registration, but returning <code className="font-mono text-xs">127.0.0.1</code> during delivery). Relay resolves both IPv4 (<code className="font-mono text-xs">A</code>) and IPv6 (<code className="font-mono text-xs">AAAA</code>) records <strong>immediately before creating the TCP socket</strong> on every single dispatch attempt.
            </p>
            <p>
              If <em>any</em> resolved IP address belongs to a non-public subnet, the request is immediately aborted before any packets leave the worker.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] space-y-1.5">
            <h3 className="font-semibold text-[#111111] dark:text-white text-xs">
              3. Redirect Hopping Protection
            </h3>
            <p>
              All HTTP requests are configured with <code className="font-mono text-xs">redirect: &quot;manual&quot;</code>. Even if a public webhook destination responds with an HTTP 301 or 302 redirecting to an internal IP, Relay will never follow the redirect.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Blocked Subnet Ranges
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[#e7e7e5] dark:border-white/[0.08]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbfbfa] dark:bg-[#18181c] border-b border-[#e7e7e5] dark:border-white/[0.08] text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Classification</th>
                <th className="p-3">Subnet / IP Range</th>
                <th className="p-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
              <tr>
                <td className="p-3 font-sans font-medium text-black dark:text-white">Loopback</td>
                <td className="p-3">127.0.0.0/8, ::1</td>
                <td className="p-3 font-sans">Localhost / host loopback interface</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-black dark:text-white">Private Networks</td>
                <td className="p-3">10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td>
                <td className="p-3 font-sans">RFC 1918 internal subnets & VPCs</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-black dark:text-white">Cloud Metadata</td>
                <td className="p-3">169.254.169.254, fd00::/8</td>
                <td className="p-3 font-sans">AWS, GCP, Azure, OpenStack instance IAM tokens</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-black dark:text-white">Link-Local &amp; Multicast</td>
                <td className="p-3">169.254.0.0/16, 224.0.0.0/4</td>
                <td className="p-3 font-sans">APIPA and multicast addresses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next steps */}
      <div className="pt-8 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/retries"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Retries & Backoff
        </Link>
        <Link
          href="/docs/api-reference"
          className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>Full REST API Reference</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
