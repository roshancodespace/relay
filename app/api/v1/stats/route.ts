import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, deliveries, endpoints, deliveryAttempts } from "@/db/schema";
import { getAuthenticatedProject } from "@/domain/auth/current-user";
import { desc, eq, sql, and } from "drizzle-orm";

/**
 * GET /api/v1/stats - Aggregated metrics and recent deliveries feed for the authenticated project
 */
export async function GET() {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json({
      authenticated: false,
      metrics: {
        totalEvents: 0,
        delivered: 0,
        retrying: 0,
        failed: 0,
        pending: 0,
        avgLatencyMs: 0,
      },
      recentDeliveries: [],
    });
  }

  const projectId = auth.project.id;

  try {
    // Total Events count for this project
    const [eventsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(eq(events.projectId, projectId));

    // Delivery counts by status for this project
    const statusCounts = await db
      .select({
        status: deliveries.status,
        count: sql<number>`count(*)::int`,
      })
      .from(deliveries)
      .where(eq(deliveries.projectId, projectId))
      .groupBy(deliveries.status);

    const countsMap = {
      delivered: 0,
      retrying: 0,
      failed: 0,
      pending: 0,
    };

    statusCounts.forEach((sc) => {
      if (sc.status in countsMap) {
        countsMap[sc.status as keyof typeof countsMap] = sc.count;
      }
    });

    // Average response time across successful attempts for this project
    const [avgLatency] = await db
      .select({ avg: sql<number>`COALESCE(round(avg(${deliveryAttempts.responseTimeMs})), 0)::int` })
      .from(deliveryAttempts)
      .innerJoin(deliveries, eq(deliveryAttempts.deliveryId, deliveries.id))
      .where(
        and(
          eq(deliveries.projectId, projectId),
          sql`${deliveryAttempts.statusCode} >= 200 AND ${deliveryAttempts.statusCode} < 300`
        )
      );

    // Recent Deliveries list with event and endpoint joined
    const recentDeliveries = await db
      .select({
        id: deliveries.id,
        status: deliveries.status,
        attemptsCount: deliveries.attemptsCount,
        maxAttempts: deliveries.maxAttempts,
        createdAt: deliveries.createdAt,
        updatedAt: deliveries.updatedAt,
        eventType: events.eventType,
        eventId: events.id,
        endpointUrl: endpoints.url,
      })
      .from(deliveries)
      .innerJoin(events, eq(deliveries.eventId, events.id))
      .innerJoin(endpoints, eq(deliveries.endpointId, endpoints.id))
      .where(eq(deliveries.projectId, projectId))
      .orderBy(desc(deliveries.createdAt))
      .limit(20);

    return NextResponse.json({
      authenticated: true,
      project: auth.project,
      user: { id: auth.user.id, email: auth.user.email },
      metrics: {
        totalEvents: eventsCount?.count || 0,
        delivered: countsMap.delivered,
        retrying: countsMap.retrying,
        failed: countsMap.failed,
        pending: countsMap.pending,
        avgLatencyMs: avgLatency?.avg || 0,
      },
      recentDeliveries,
    });
  } catch (error) {
    console.warn("Error loading project stats:", (error as Error).message);
    return NextResponse.json({
      authenticated: true,
      project: auth.project,
      user: { id: auth.user.id, email: auth.user.email },
      metrics: {
        totalEvents: 0,
        delivered: 0,
        retrying: 0,
        failed: 0,
        pending: 0,
        avgLatencyMs: 0,
      },
      recentDeliveries: [],
    });
  }
}
