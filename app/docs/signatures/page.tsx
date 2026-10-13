import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeTabs } from "@/components/docs/code-tabs";
import { Callout } from "@/components/docs/callout";

export default function SignaturesPage() {
  const nodeVerify = `import crypto from "node:crypto";

export function verifyRelayWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300 // 5 minutes
): boolean {
  // 1. Parse t and v1 components
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("="))
  );

  const timestamp = parseInt(parts.t, 10);
  const signature = parts.v1;

  if (isNaN(timestamp) || !signature) {
    return false;
  }

  // 2. Prevent replay attacks (enforce 5-minute clock drift window)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > toleranceSeconds) {
    return false; // Timestamp too old or in future
  }

  // 3. Recompute expected HMAC-SHA256
  const payloadToSign = \`\${parts.t}.\${rawBody}\`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadToSign)
    .digest("hex");

  // 4. Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}`;

  const pythonVerify = `import hmac
import hashlib
import time

def verify_relay_webhook(raw_body: bytes, signature_header: str, secret: str, tolerance_seconds=300) -> bool:
    try:
        parts = dict(item.split("=") for item in signature_header.split(","))
        timestamp = int(parts["t"])
        signature = parts["v1"]
    except (ValueError, KeyError):
        return False

    # Check timestamp drift
    current_time = int(time.time())
    if abs(current_time - timestamp) > tolerance_seconds:
        return False

    # Recreate signed payload
    payload_to_sign = f"{timestamp}.".encode("utf-8") + raw_body
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        payload_to_sign,
        hashlib.sha256
    ).hexdigest()

    # Constant time comparison
    return hmac.compare_digest(signature, expected_signature)`;

  const goVerify = `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

func VerifyWebhook(rawBody []byte, header string, secret string) bool {
	parts := make(map[string]string)
	for _, pair := range strings.Split(header, ",") {
		kv := strings.SplitN(pair, "=", 2)
		if len(kv) == 2 {
			parts[kv[0]] = kv[1]
		}
	}

	timestampStr, ok1 := parts["t"]
	sigHex, ok2 := parts["v1"]
	if !ok1 || !ok2 {
		return false
	}

	timestamp, err := strconv.ParseInt(timestampStr, 10, 64)
	if err != nil {
		return false
	}

	// 5-minute replay tolerance
	if math.Abs(float64(time.Now().Unix()-timestamp)) > 300 {
		return false
	}

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(fmt.Sprintf("%s.", timestampStr)))
	mac.Write(rawBody)
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(sigHex), []byte(expectedSig))
}`;

  return (
    <div className="space-y-10 font-sans">
      <div className="space-y-3 pb-6 border-b border-[#e7e7e5] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff6600]">
          Security & Cryptography
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] dark:text-white">
          HMAC-SHA256 Webhook Signatures
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Relay signs all outgoing webhook HTTP dispatches with a cryptographic HMAC-SHA256 signature, allowing your servers to verify authenticity, integrity, and defend against replay attacks.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Header Structure
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Every HTTP POST request sent by Relay includes the <code className="font-mono text-xs bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 rounded">Relay-Signature</code> header:
        </p>
        <div className="p-3 bg-zinc-100 dark:bg-[#121215] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md font-mono text-xs text-[#111111] dark:text-zinc-200">
          Relay-Signature: t=1728876400,v1=5d9a24e1837f48b9...
        </div>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <li>
            <code className="font-mono text-xs text-black dark:text-white">t</code>: Unix epoch timestamp in seconds when the signature was minted.
          </li>
          <li>
            <code className="font-mono text-xs text-black dark:text-white">v1</code>: Hex-encoded HMAC-SHA256 digest of <code className="font-mono text-xs text-black dark:text-white">{"${t}.${rawBody}"}</code>.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Verification Implementation
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300">
          Choose your programming language to copy a production-ready verification helper:
        </p>
        <CodeTabs
          snippets={[
            { label: "Node.js (TypeScript)", language: "typescript", code: nodeVerify },
            { label: "Python", language: "python", code: pythonVerify },
            { label: "Go", language: "go", code: goVerify },
          ]}
          title="verifyRelayWebhook"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white">
          Essential Security Defenses
        </h2>

        <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            <strong className="text-black dark:text-white">1. Always use raw bytes:</strong> Calculate HMAC over the exact untouched raw HTTP body buffer. Never parse JSON and re-stringify it before verification, because key reordering and whitespace variances will cause signature mismatch.
          </p>
          <p>
            <strong className="text-black dark:text-white">2. Check timestamp tolerance:</strong> Validate that <code className="font-mono text-xs">Math.abs(now - t) &lt;= 300</code> (5 minutes). This prevents attackers from capturing intercepted valid webhooks and replaying them hours later.
          </p>
          <p>
            <strong className="text-black dark:text-white">3. Constant-time comparison:</strong> Use <code className="font-mono text-xs">crypto.timingSafeEqual</code> or <code className="font-mono text-xs">hmac.compare_digest</code> rather than regular string equality (<code className="font-mono text-xs">===</code>) to protect against timing attack side-channels.
          </p>
        </div>

        <Callout type="security" title="Signing Secret Rotation">
          If your endpoint secret is compromised, you can generate a new secret immediately in <Link href="/dashboard/endpoints" className="underline font-medium text-[#ff6600]">Endpoints</Link>. Relay signs outgoing dispatches using the newest active secret.
        </Callout>
      </section>

      {/* Next steps */}
      <div className="pt-8 border-t border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/ingest"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Event Ingestion
        </Link>
        <Link
          href="/docs/retries"
          className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>Retries & Backoff Guide</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
