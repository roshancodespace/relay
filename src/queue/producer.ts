import { getDeliveryQueue } from "./client";

/**
 * Enqueues a delivery job into BullMQ.
 * Uses a unique jobId pattern to prevent duplicate active jobs for the same delivery attempt.
 *
 * @param deliveryId - The UUID of the delivery record in PostgreSQL
 * @param delayMs - Milliseconds to delay execution (used for exponential backoff)
 * @param attemptNumber - The current attempt number (used for unique job IDs)
 */
export async function enqueueDeliveryJob(
  deliveryId: string,
  delayMs: number = 0,
  attemptNumber: number = 1
): Promise<boolean> {
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  try {
    const queue = getDeliveryQueue();
    const jobId = `del_${deliveryId}_att_${attemptNumber}`;

    await queue.add(
      "dispatch-webhook",
      { deliveryId },
      {
        jobId,
        delay: delayMs,
      }
    );

    return true;
  } catch (error) {
    console.error(`❌ Failed to enqueue delivery job for ${deliveryId}:`, (error as Error).message);
    return false;
  }
}
