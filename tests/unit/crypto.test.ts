import { describe, it, expect } from "vitest";
import { generateApiKey, hashApiKey } from "@/domain/auth/keys";
import { generateSigningSecret, signPayload, verifySignature } from "@/domain/crypto/signatures";
import { createSessionToken, verifySessionToken } from "@/domain/auth/session";

describe("Cryptographic Services & Signatures", () => {
  describe("API Key Management", () => {
    it("generates API key with correct prefix and entropy", () => {
      const key = generateApiKey();
      expect(key.rawKey.startsWith("rel_live_")).toBe(true);
      expect(key.keyPrefix.startsWith("rel_live_")).toBe(true);
      expect(key.keyHash).toHaveLength(64); // SHA-256 hex string
    });

    it("consistently computes matching SHA-256 hash", () => {
      const raw = "rel_live_sample_key_1234567890abcdef";
      const hash1 = hashApiKey(raw);
      const hash2 = hashApiKey(raw);
      expect(hash1).toEqual(hash2);
    });
  });

  describe("HMAC Webhook Signatures", () => {
    const secret = generateSigningSecret();
    const payload = JSON.stringify({ event: "order.created", id: "evt_123" });

    it("generates valid HMAC signature header", () => {
      const { signatureHeader, timestamp, signature } = signPayload(payload, secret);
      expect(signatureHeader).toContain(`t=${timestamp}`);
      expect(signatureHeader).toContain(`v1=${signature}`);
      expect(signature).toHaveLength(64);
    });

    it("verifies valid signature successfully", () => {
      const { signatureHeader } = signPayload(payload, secret);
      const result = verifySignature(payload, signatureHeader, secret);
      expect(result.isValid).toBe(true);
    });

    it("rejects tampered payload", () => {
      const { signatureHeader } = signPayload(payload, secret);
      const tamperedPayload = JSON.stringify({ event: "order.created", id: "evt_999" });
      const result = verifySignature(tamperedPayload, signatureHeader, secret);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Signature mismatch");
    });

    it("rejects expired signature timestamp", () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const { signatureHeader } = signPayload(payload, secret, pastTimestamp);
      const result = verifySignature(payload, signatureHeader, secret, 300);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("expired");
    });
  });

  describe("Session Token Signing", () => {
    it("generates and verifies signed session token", () => {
      const token = createSessionToken("user_123", "dev@example.com");
      const session = verifySessionToken(token);

      expect(session).not.toBeNull();
      expect(session?.userId).toBe("user_123");
      expect(session?.email).toBe("dev@example.com");
    });

    it("rejects tampered session token", () => {
      const token = createSessionToken("user_123", "dev@example.com");
      const [payloadPart] = token.split(".");
      const tampered = `${payloadPart}.invalid_signature`;

      expect(verifySessionToken(tampered)).toBeNull();
    });
  });
});
