import crypto from "node:crypto";

const SECRET_PREFIX = "whsec_";

/**
 * Generates a high-entropy signing secret for an endpoint.
 * Format: "whsec_" + 32 random bytes (64 hex characters)
 */
export function generateSigningSecret(): string {
  return `${SECRET_PREFIX}${crypto.randomBytes(32).toString("hex")}`;
}

/**
 * Signs an outgoing webhook payload using HMAC-SHA256.
 * Adheres to standard Stripe/Svix format:
 * Header: "t=1728800000,v1=9e8c3b..."
 *
 * @param payload - Raw JSON string of the event payload
 * @param secret - The endpoint's signing secret (e.g., "whsec_...")
 * @param timestamp - Optional Unix timestamp in seconds (defaults to now)
 */
export function signPayload(
  payload: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): { signatureHeader: string; timestamp: number; signature: string } {
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signaturePayload)
    .digest("hex");

  const signatureHeader = `t=${timestamp},v1=${signature}`;
  return { signatureHeader, timestamp, signature };
}

/**
 * Verifies an incoming Relay webhook signature header.
 * Designed to be used by webhook receivers (or in tests/documentation).
 *
 * @param payload - Raw string received in request body
 * @param signatureHeader - The "Relay-Signature" header string (e.g., "t=...,v1=...")
 * @param secret - The expected signing secret
 * @param toleranceSeconds - Maximum allowed clock skew in seconds (default: 300s / 5 minutes)
 */
export function verifySignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds: number = 300
): { isValid: boolean; error?: string } {
  if (!signatureHeader) {
    return { isValid: false, error: "Missing signature header" };
  }

  const parts = signatureHeader.split(",");
  let timestampStr: string | null = null;
  let signature: string | null = null;

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key === "t") timestampStr = value;
    if (key === "v1") signature = value;
  }

  if (!timestampStr || !signature) {
    return { isValid: false, error: "Malformed signature header format" };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { isValid: false, error: "Invalid timestamp in signature header" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { isValid: false, error: "Signature timestamp expired or out of tolerance window" };
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { isValid: false, error: "Signature mismatch" };
  }

  return { isValid: true };
}
