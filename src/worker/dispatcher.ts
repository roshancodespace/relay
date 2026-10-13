import { resolveAndValidateDestination } from "@/domain/endpoints/ssrf";
import { signPayload } from "@/domain/crypto/signatures";

const REQUEST_TIMEOUT_MS = 10 * 1000; // 10 seconds timeout
const MAX_SAVED_BODY_BYTES = 4096; // Truncate stored response to 4 KB

export interface DispatchResult {
  statusCode: number | null;
  responseTimeMs: number;
  responseBody: string | null;
  responseHeaders: Record<string, string> | null;
  errorMessage: string | null;
}

export interface DispatchParams {
  endpointUrl: string;
  signingSecret: string;
  event: {
    id: string;
    eventType: string;
    payload: Record<string, unknown>;
    createdAt: Date;
  };
  deliveryId: string;
  attemptNumber: number;
}

/**
 * Dispatches a webhook HTTP POST to a destination endpoint with SSRF protection,
 * HMAC signing, strict timeouts, and safe response body truncation.
 */
export async function dispatchWebhook(params: DispatchParams): Promise<DispatchResult> {
  const { endpointUrl, signingSecret, event, deliveryId, attemptNumber } = params;

  // SSRF and DNS Rebinding Guard
  const ssrfCheck = await resolveAndValidateDestination(endpointUrl);
  if (!ssrfCheck.isSafe) {
    return {
      statusCode: null,
      responseTimeMs: 0,
      responseBody: null,
      responseHeaders: null,
      errorMessage: ssrfCheck.reason || "Security policy violation: Destination blocked by SSRF guard.",
    };
  }

  // Prepare payload and HMAC signature
  const outgoingBody = JSON.stringify({
    id: event.id,
    type: event.eventType,
    data: event.payload,
    created_at: event.createdAt.toISOString(),
  });

  const { signatureHeader, timestamp } = signPayload(outgoingBody, signingSecret);

  // Prepare HTTP headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Relay-Webhook-Delivery/1.0",
    "Relay-Delivery-Id": deliveryId,
    "Relay-Event-Id": event.id,
    "Relay-Attempt-Number": String(attemptNumber),
    "Relay-Timestamp": String(timestamp),
    "Relay-Signature": signatureHeader,
  };

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startTime = performance.now();

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers,
      body: outgoingBody,
      signal: controller.signal,
      redirect: "manual", // Prevent redirect bypass
    });

    const durationMs = Math.round(performance.now() - startTime);

    // Read response text safely with length truncation
    let responseText: string | null = null;
    try {
      const rawText = await response.text();
      responseText = rawText ? rawText.slice(0, MAX_SAVED_BODY_BYTES) : null;
    } catch {
      responseText = null;
    }

    // Extract headers for diagnostic viewing
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      // Store common diagnostic headers
      if (["content-type", "server", "retry-after", "cf-ray"].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    return {
      statusCode: response.status,
      responseTimeMs: durationMs,
      responseBody: responseText,
      responseHeaders: Object.keys(responseHeaders).length > 0 ? responseHeaders : null,
      errorMessage: null,
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    const err = error as Error;

    let errorMessage = err.message;
    if (err.name === "AbortError") {
      errorMessage = `Request timed out after ${REQUEST_TIMEOUT_MS}ms.`;
    }

    return {
      statusCode: null,
      responseTimeMs: durationMs,
      responseBody: null,
      responseHeaders: null,
      errorMessage,
    };
  } finally {
    clearTimeout(timeoutTimer);
  }
}
