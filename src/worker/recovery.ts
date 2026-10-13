import { sql, or, and, lt, eq } from "drizzle-orm";
import { db } from "@/db";
import { deliveries } from "@/db/schema";
import { enqueueDeliveryJob } from "@/queue/producer";

/**
 * Sweeps PostgreSQL for deliveries that were persisted but never enqueued or missed their retry window.
 * Ensures zero lost deliveries even if Redis is restarted or temporarily unreachable.
 */
export async function recoverPendingDeliveries(): Promise<number> {
  try {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const now = new Date();

    // Find deliveries that are stuck in 'pending' or 'retrying' whose scheduled time has passed
    const stuckDeliveries = await db
      .select({ id: deliveries.id, attemptsCount: deliveries.attemptsCount, status: deliveries.status })
      .from(deliveries)
      .where(
        or(
          and(eq(deliveries.status, "pending"), lt(deliveries.createdAt, thirtySecondsAgo)),
          and(eq(deliveries.status, "retrying"), lt(deliveries.nextRetryAt, now))
        )
      )
      .limit(50);

    if (stuckDeliveries.length === 0) {
      return 0;
    }

    console.log(`[Recovery] Found ${stuckDeliveries.length} un-enqueued or overdue deliveries. Re-enqueuing...`);

    let enqueuedCount = 0;
    for (const d of stuckDeliveries) {
      const success = await enqueueDeliveryJob(d.id, 0, d.attemptsCount + 1);
      if (success) {
        enqueuedCount++;
      }
    }

    return enqueuedCount;
  } catch (error) {
    console.warn("[Recovery] Error running recovery sweep:", (error as Error).message);
    return 0;
  }
}
