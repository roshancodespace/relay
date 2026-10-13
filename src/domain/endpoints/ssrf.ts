import dns from "node:dns/promises";
import net from "node:net";

export interface UrlValidationResult {
  isSafe: boolean;
  reason?: string;
  resolvedIps?: string[];
}

/**
 * Checks if an IPv4 address string falls within private, loopback, or reserved CIDR ranges.
 */
export function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP treated as unsafe
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (RFC 1918 Private)
  if (a === 10) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local / Cloud Metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (RFC 1918 Private)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol)
  if (a === 192 && b === 0 && c === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;

  // 192.168.0.0/16 (RFC 1918 Private)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address string falls within private, loopback, or reserved ranges.
 */
export function isPrivateOrReservedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback ::1
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;

  // Unspecified ::
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

  // Unique local addresses (fc00::/7) -> fc or fd
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-local unicast (fe80::/10) -> fe8, fe9, fea, feb
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  // IPv4-mapped IPv6 address (::ffff:192.0.2.128)
  if (normalized.startsWith("::ffff:") || normalized.startsWith("0:0:0:0:0:ffff:")) {
    const ipv4Part = normalized.split(":").pop();
    if (ipv4Part && net.isIPv4(ipv4Part)) {
      return isPrivateOrReservedIPv4(ipv4Part);
    }
    return true;
  }

  return false;
}

/**
 * Validates the syntactic and domain safety of a webhook endpoint URL at registration time.
 */
export function validateUrlSyntax(urlString: string): { isValid: boolean; error?: string; parsedUrl?: URL } {
  try {
    const url = new URL(urlString);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { isValid: false, error: "Only http and https protocols are supported." };
    }

    if (url.username || url.password) {
      return { isValid: false, error: "User credentials in URLs are not permitted." };
    }

    const hostname = url.hostname.toLowerCase();
    if (!hostname) {
      return { isValid: false, error: "URL hostname cannot be empty." };
    }

    // Check reserved / local TLDs and common localhost aliases
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".home") ||
      hostname.endsWith(".corp")
    ) {
      return { isValid: false, error: "Local and internal hostnames are prohibited." };
    }

    // Direct IP literal check
    if (net.isIPv4(hostname)) {
      if (isPrivateOrReservedIPv4(hostname)) {
        return { isValid: false, error: "Private, loopback, or reserved IP addresses are prohibited." };
      }
    } else if (net.isIPv6(hostname)) {
      if (isPrivateOrReservedIPv6(hostname)) {
        return { isValid: false, error: "Private, loopback, or reserved IPv6 addresses are prohibited." };
      }
    }

    return { isValid: true, parsedUrl: url };
  } catch {
    return { isValid: false, error: "Invalid URL format." };
  }
}

/**
 * Performs DNS resolution and validates that all returned IPs are public.
 * Mitigates DNS Rebinding attacks by resolving DNS directly before outbound HTTP dispatch.
 */
export async function resolveAndValidateDestination(urlString: string): Promise<UrlValidationResult> {
  const syntaxCheck = validateUrlSyntax(urlString);
  if (!syntaxCheck.isValid || !syntaxCheck.parsedUrl) {
    return { isSafe: false, reason: syntaxCheck.error };
  }

  const hostname = syntaxCheck.parsedUrl.hostname;

  // If already an IP literal and passed syntaxCheck, it's public
  if (net.isIP(hostname)) {
    return { isSafe: true, resolvedIps: [hostname] };
  }

  try {
    // Resolve both IPv4 and IPv6 addresses
    const records = await dns.lookup(hostname, { all: true });

    if (!records || records.length === 0) {
      return { isSafe: false, reason: `DNS lookup failed: No IP records found for host '${hostname}'.` };
    }

    const resolvedIps: string[] = [];

    for (const record of records) {
      resolvedIps.push(record.address);

      if (record.family === 4 && isPrivateOrReservedIPv4(record.address)) {
        return {
          isSafe: false,
          reason: `Security violation (SSRF): Host '${hostname}' resolved to restricted private IP '${record.address}'.`,
          resolvedIps,
        };
      }

      if (record.family === 6 && isPrivateOrReservedIPv6(record.address)) {
        return {
          isSafe: false,
          reason: `Security violation (SSRF): Host '${hostname}' resolved to restricted private IPv6 '${record.address}'.`,
          resolvedIps,
        };
      }
    }

    return { isSafe: true, resolvedIps };
  } catch (err) {
    return {
      isSafe: false,
      reason: `DNS lookup error: ${(err as Error).message}`,
    };
  }
}
