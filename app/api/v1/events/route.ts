import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/domain/auth/keys";
import { ingestEvent } from "@/domain/events/ingest";
import { db } from "@/db";
import { deliveries, events } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getAuthenticatedProject } from "@/domain/auth/current-user";

/**
 * POST /api/v1/events - Ingest a new webhook event
 */
export async function POST(request: NextRequest) {
  // Authenticate Bearer API Key
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Missing or invalid Bearer API key in Authorization header." } },
      { status: 401 }
    );
  }

  const rawApiKey = authHeader.slice(7).trim();
  const authContext = await authenticateApiKey(rawApiKey);

  if (!authContext) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Invalid or revoked API key." } },
      { status: 401 }
    );
  }

  // Extract Idempotency Key header if provided
  const idempotencyKey = request.headers.get("idempotency-key") || null;

  // Parse JSON body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  // Ingest and fan-out event
  const result = await ingestEvent(authContext.projectId, body, idempotencyKey);

  if (!result.success || !result.event) {
    if (result.error?.code === "payload_too_large") {
      return NextResponse.json({ error: result.error }, { status: 413 });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const responseHeaders: Record<string, string> = {};
  if (result.isIdempotentReplay) {
    responseHeaders["Idempotent-Replay"] = "true";
  }

  return NextResponse.json(
    {
      id: result.event.id,
      type: result.event.eventType,
      created_at: result.event.createdAt,
      deliveries: (result.deliveries || []).map((d) => ({
        id: d.id,
        endpoint_id: d.endpointId,
        status: d.status,
      })),
    },
    {
      status: 202,
      headers: responseHeaders,
    }
  );
}

/**
 * GET /api/v1/events - List recent events for the authenticated project (supports session or Bearer API key)
 */
export async function GET(request: NextRequest) {
  let projectId: string | null = null;

  // Try session auth
  const sessionAuth = await getAuthenticatedProject();
  if (sessionAuth) {
    projectId = sessionAuth.project.id;
  } else {
    // Try Bearer API key
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const rawApiKey = authHeader.slice(7).trim();
      const authContext = await authenticateApiKey(rawApiKey);
      if (authContext) {
        projectId = authContext.projectId;
      }
    }
  }

  if (!projectId) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const typeFilter = searchParams.get("type");

  const conditions = [eq(events.projectId, projectId)];
  if (typeFilter) {
    conditions.push(eq(events.eventType, typeFilter));
  }

  const eventList = await db
    .select({
      id: events.id,
      eventType: events.eventType,
      payload: events.payload,
      idempotencyKey: events.idempotencyKey,
      createdAt: events.createdAt,
      deliveriesCount: sql<number>`count(${deliveries.id})::int`,
    })
    .from(events)
    .leftJoin(deliveries, eq(events.id, deliveries.eventId))
    .where(and(...conditions))
    .groupBy(events.id)
    .orderBy(desc(events.createdAt))
    .limit(limit);

  return NextResponse.json({ events: eventList });
}
