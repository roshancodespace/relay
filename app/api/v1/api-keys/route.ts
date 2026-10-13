import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { generateApiKey, revokeApiKey } from "@/domain/auth/keys";
import { getAuthenticatedProject } from "@/domain/auth/current-user";
import { and, desc, eq, isNull } from "drizzle-orm";

/**
 * GET /api/v1/api-keys - List active API keys for the authenticated project
 */
export async function GET() {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  const keyList = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.projectId, auth.project.id), isNull(apiKeys.revokedAt)))
    .orderBy(desc(apiKeys.createdAt));

  return NextResponse.json({ keys: keyList });
}

/**
 * POST /api/v1/api-keys - Generate and save a new API key for the authenticated project
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const generated = generateApiKey();

  const [savedKey] = await db
    .insert(apiKeys)
    .values({
      projectId: auth.project.id,
      name: body.name?.trim() || "API Key",
      keyPrefix: generated.keyPrefix,
      keyHash: generated.keyHash,
    })
    .returning();

  return NextResponse.json(
    {
      key: {
        id: savedKey.id,
        name: savedKey.name,
        keyPrefix: savedKey.keyPrefix,
        rawKey: generated.rawKey, // Returned ONLY ONCE upon creation
        createdAt: savedKey.createdAt,
      },
    },
    { status: 201 }
  );
}

/**
 * DELETE /api/v1/api-keys - Revoke an API key for the authenticated project
 */
export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");
  if (!keyId) {
    return NextResponse.json({ error: "Query parameter 'id' is required." }, { status: 400 });
  }

  const revoked = await revokeApiKey(auth.project.id, keyId);
  if (!revoked) {
    return NextResponse.json({ error: "Key not found or already revoked." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "API key revoked successfully." });
}
