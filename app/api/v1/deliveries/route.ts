import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deliveries, events, endpoints } from "@/db/schema";
import { getAuthenticatedProject } from "@/domain/auth/current-user";
import { desc, eq, and, sql } from "drizzle-orm";

/**
 * GET /api/v1/deliveries - List deliveries with optional status filter for the authenticated project
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const offset = (page - 1) * limit;

  const conditions = [eq(deliveries.projectId, auth.project.id)];

  if (
    statusFilter &&
    ["pending", "retrying", "delivered", "failed"].includes(statusFilter)
  ) {
    conditions.push(
      eq(
        deliveries.status,
        statusFilter as "pending" | "retrying" | "delivered" | "failed"
      )
    );
  }

  const deliveryList = await db
    .select({
      id: deliveries.id,
      status: deliveries.status,
      attemptsCount: deliveries.attemptsCount,
      maxAttempts: deliveries.maxAttempts,
      nextRetryAt: deliveries.nextRetryAt,
      completedAt: deliveries.completedAt,
      createdAt: deliveries.createdAt,
      updatedAt: deliveries.updatedAt,
      eventType: events.eventType,
      eventId: events.id,
      endpointId: endpoints.id,
      endpointUrl: endpoints.url,
    })
    .from(deliveries)
    .innerJoin(events, eq(deliveries.eventId, events.id))
    .innerJoin(endpoints, eq(deliveries.endpointId, endpoints.id))
    .where(and(...conditions))
    .orderBy(desc(deliveries.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deliveries)
    .where(and(...conditions));

  return NextResponse.json({
    deliveries: deliveryList,
    total: totalCount?.count || 0,
    page,
    limit,
  });
}
