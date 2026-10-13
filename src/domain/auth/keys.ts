import crypto from "node:crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";

const KEY_PREFIX = "rel_live_";

export interface GeneratedApiKey {
  rawKey: string;     // Shown ONLY ONCE to user upon creation
  keyPrefix: string;  // Safe to display in UI (e.g., "rel_live_a1b2...")
  keyHash: string;    // SHA-256 hash stored in PostgreSQL
}

export interface AuthenticatedProjectContext {
  projectId: string;
  apiKeyId: string;
  keyName: string;
}

/**
 * Generates a cryptographically secure API key.
 * Format: "rel_live_" + 32 random bytes (64 hex characters)
 * Example: rel_live_7f8c12...
 */
export function generateApiKey(): GeneratedApiKey {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const rawKey = `${KEY_PREFIX}${randomBytes}`;
  const keyPrefix = `${KEY_PREFIX}${randomBytes.slice(0, 4)}...`;
  const keyHash = hashApiKey(rawKey);

  return {
    rawKey,
    keyPrefix,
    keyHash,
  };
}

/**
 * Computes the SHA-256 hash of an API key.
 * Storing hashes ensures that even if the database is leaked, raw API keys cannot be used.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Validates an incoming Bearer API key against the database.
 * If valid and not revoked, updates last_used_at timestamp.
 */
export async function authenticateApiKey(rawKey: string): Promise<AuthenticatedProjectContext | null> {
  if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) {
    return null;
  }

  const computedHash = hashApiKey(rawKey);

  const matchedKeys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, computedHash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (matchedKeys.length === 0) {
    return null;
  }

  const matched = matchedKeys[0];

  // Asynchronously record last_used_at without blocking the request path
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, matched.id))
    .catch((err) => console.error("Failed to update apiKey lastUsedAt:", err));

  return {
    projectId: matched.projectId,
    apiKeyId: matched.id,
    keyName: matched.name,
  };
}

/**
 * Revokes an existing API key.
 */
export async function revokeApiKey(projectId: string, keyId: string): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.projectId, projectId)))
    .returning({ id: apiKeys.id });

  return result.length > 0;
}
