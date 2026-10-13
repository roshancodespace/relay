import { describe, it, expect } from "vitest";
import {
  isPrivateOrReservedIPv4,
  isPrivateOrReservedIPv6,
  validateUrlSyntax,
} from "@/domain/endpoints/ssrf";

describe("SSRF Protection & URL Validation", () => {
  describe("IPv4 Address Filtering", () => {
    it("flags loopback 127.0.0.1 as private", () => {
      expect(isPrivateOrReservedIPv4("127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIPv4("127.255.255.255")).toBe(true);
    });

    it("flags RFC 1918 private ranges as private", () => {
      expect(isPrivateOrReservedIPv4("10.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIPv4("10.254.1.9")).toBe(true);
      expect(isPrivateOrReservedIPv4("172.16.0.1")).toBe(true);
      expect(isPrivateOrReservedIPv4("172.31.255.255")).toBe(true);
      expect(isPrivateOrReservedIPv4("192.168.1.1")).toBe(true);
    });

    it("flags cloud metadata IP (169.254.169.254) as private", () => {
      expect(isPrivateOrReservedIPv4("169.254.169.254")).toBe(true);
    });

    it("allows valid public IPv4 addresses", () => {
      expect(isPrivateOrReservedIPv4("93.184.216.34")).toBe(false); // example.com
      expect(isPrivateOrReservedIPv4("8.8.8.8")).toBe(false);        // Google DNS
      expect(isPrivateOrReservedIPv4("1.1.1.1")).toBe(false);        // Cloudflare
    });
  });

  describe("IPv6 Address Filtering", () => {
    it("flags loopback ::1 as private", () => {
      expect(isPrivateOrReservedIPv6("::1")).toBe(true);
    });

    it("flags unique local fc00:: and fe80:: as private", () => {
      expect(isPrivateOrReservedIPv6("fc00::1")).toBe(true);
      expect(isPrivateOrReservedIPv6("fe80::1")).toBe(true);
    });
  });

  describe("URL Syntax & Safety Validation", () => {
    it("accepts valid public HTTPS endpoints", () => {
      const res = validateUrlSyntax("https://api.customer.com/webhooks/relay");
      expect(res.isValid).toBe(true);
    });

    it("rejects non-HTTP protocols", () => {
      expect(validateUrlSyntax("ftp://api.customer.com/webhook").isValid).toBe(false);
      expect(validateUrlSyntax("gopher://api.customer.com/webhook").isValid).toBe(false);
      expect(validateUrlSyntax("file:///etc/passwd").isValid).toBe(false);
    });

    it("rejects localhost and reserved hostnames", () => {
      expect(validateUrlSyntax("http://localhost:8080/hook").isValid).toBe(false);
      expect(validateUrlSyntax("http://internal.corp/hook").isValid).toBe(false);
      expect(validateUrlSyntax("http://router.local/hook").isValid).toBe(false);
    });

    it("rejects embedded user credentials", () => {
      expect(validateUrlSyntax("https://admin:password@api.customer.com/hook").isValid).toBe(false);
    });

    it("rejects direct private IP literals in URL", () => {
      expect(validateUrlSyntax("http://127.0.0.1:3000/hook").isValid).toBe(false);
      expect(validateUrlSyntax("http://169.254.169.254/latest/meta-data").isValid).toBe(false);
      expect(validateUrlSyntax("http://192.168.1.1/admin").isValid).toBe(false);
    });
  });
});
