import crypto from "node:crypto";
import { env } from "@/lib/env";

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: number; // timestamp in milliseconds
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Creates a tamper-proof signed session token using HMAC-SHA256.
 * Format: base64url(payload).hex(signature)
 */
export function createSessionToken(userId: string, email: string): string {
  const payload: SessionPayload = {
    userId,
    email,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  const payloadString = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", env.AUTH_SECRET)
    .update(payloadString)
    .digest("hex");

  return `${payloadString}.${signature}`;
}

/**
 * Verifies a session token, ensures it is not tampered with, and checks expiry.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payloadString, signature] = token.split(".");
  if (!payloadString || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.AUTH_SECRET)
    .update(payloadString)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadString, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }
    return payload;
  } catch {
    return null;
  }
}
