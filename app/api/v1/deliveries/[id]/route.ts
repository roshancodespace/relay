import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deliveries, deliveryAttempts, endpoints, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/v1/deliveries/[id] - Inspect a delivery and its chronological attempts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deliveryId } = await params;

  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.id, deliveryId))
    .limit(1);

  if (!delivery) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Delivery not found." } },
      { status: 404 }
    );
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, delivery.eventId))
    .limit(1);

  const [endpoint] = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.id, delivery.endpointId))
    .limit(1);

  const attempts = await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.deliveryId, deliveryId))
    .orderBy(desc(deliveryAttempts.attemptNumber));

  return NextResponse.json({
    delivery,
    event,
    endpoint: endpoint ? { id: endpoint.id, url: endpoint.url, isEnabled: endpoint.isEnabled } : null,
    attempts,
  });
}
