import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deliveries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { enqueueDeliveryJob } from "@/queue/producer";

/**
 * POST /api/v1/deliveries/[id]/retry - Trigger a manual retry for a delivery
 */
export async function POST(
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

  // Allow manual retries by increasing maxAttempts if already exhausted
  const newMaxAttempts = Math.max(delivery.maxAttempts, delivery.attemptsCount + 1);

  const [updated] = await db
    .update(deliveries)
    .set({
      status: "pending",
      maxAttempts: newMaxAttempts,
      nextRetryAt: null,
      updatedAt: new Date(),
    })
    .where(eq(deliveries.id, deliveryId))
    .returning();

  // Enqueue to BullMQ
  await enqueueDeliveryJob(deliveryId, 0, delivery.attemptsCount + 1);

  return NextResponse.json({
    message: "Manual retry scheduled successfully.",
    delivery: updated,
  });
}
