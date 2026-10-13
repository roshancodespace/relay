import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, deliveries, endpoints } from "@/db/schema";
import { getAuthenticatedProject } from "@/domain/auth/current-user";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/v1/events/[id] - Inspect single event and all its fan-out deliveries
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  const { id: eventId } = await params;

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.projectId, auth.project.id)))
    .limit(1);

  if (!event) {
    return NextResponse.json(
      { error: "Event not found." },
      { status: 404 }
    );
  }

  const eventDeliveries = await db
    .select({
      id: deliveries.id,
      status: deliveries.status,
      attemptsCount: deliveries.attemptsCount,
      maxAttempts: deliveries.maxAttempts,
      nextRetryAt: deliveries.nextRetryAt,
      completedAt: deliveries.completedAt,
      createdAt: deliveries.createdAt,
      updatedAt: deliveries.updatedAt,
      endpointId: endpoints.id,
      endpointUrl: endpoints.url,
    })
    .from(deliveries)
    .innerJoin(endpoints, eq(deliveries.endpointId, endpoints.id))
    .where(eq(deliveries.eventId, eventId));

  return NextResponse.json({
    event,
    deliveries: eventDeliveries,
  });
}
