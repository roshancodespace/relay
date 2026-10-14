import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deliveries, deliveryAttempts, endpoints, events } from "@/db/schema";
import { dispatchWebhook } from "./dispatcher";
import { classifyDeliveryOutcome, computeBackoffDelayMs } from "@/domain/deliveries/policy";
import { enqueueDeliveryJob } from "@/queue/producer";
import { log } from "./logger";

export interface ProcessDeliveryOptions {
  deliveryId: string;
}

/**
 * Processes a single delivery job:
 * 1. Loads delivery, event, and endpoint from PostgreSQL.
 * 2. Checks endpoint state.
 * 3. Executes secure HTTP dispatch.
 * 4. Persists the attempt audit log in delivery_attempts.
 * 5. Transitions delivery status (delivered, retrying with backoff, or failed).
 */
export async function processDelivery(deliveryId: string): Promise<void> {
  // Fetch delivery row
  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.id, deliveryId))
    .limit(1);

  if (!delivery) {
    log.skip(deliveryId, "Record not found in database. Skipping.");
    return;
  }

  // If already delivered or terminal failed, do not re-process
  if (delivery.status === "delivered") {
    log.skip(deliveryId, "Already marked delivered. Skipping.");
    return;
  }

  // Fetch associated event and endpoint
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

  const attemptNumber = delivery.attemptsCount + 1;

  if (!endpoint || !endpoint.isEnabled) {
    const reason = endpoint ? "Endpoint was disabled" : "Endpoint was deleted";
    log.failed(deliveryId, reason);

    await db
      .update(deliveries)
      .set({
        status: "failed",
        attemptsCount: attemptNumber,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(deliveries.id, deliveryId));

    await db.insert(deliveryAttempts).values({
      deliveryId,
      attemptNumber,
      statusCode: null,
      responseTimeMs: 0,
      errorMessage: reason,
    });

    return;
  }

  if (!event) {
    log.error(`Event ${delivery.eventId} missing for delivery ${deliveryId}`);
    return;
  }

  log.dispatch(deliveryId, endpoint.url, attemptNumber, delivery.maxAttempts);

  // Dispatch HTTP request
  const dispatchResult = await dispatchWebhook({
    endpointUrl: endpoint.url,
    signingSecret: endpoint.signingSecret,
    event: {
      id: event.id,
      eventType: event.eventType,
      payload: event.payload as Record<string, unknown>,
      createdAt: event.createdAt,
    },
    deliveryId: delivery.id,
    attemptNumber,
  });

  // Record attempt in PostgreSQL
  await db.insert(deliveryAttempts).values({
    deliveryId: delivery.id,
    attemptNumber,
    statusCode: dispatchResult.statusCode,
    responseTimeMs: dispatchResult.responseTimeMs,
    responseBody: dispatchResult.responseBody,
    responseHeaders: dispatchResult.responseHeaders,
    errorMessage: dispatchResult.errorMessage,
  });

  // Evaluate outcome & update delivery state
  const outcome = classifyDeliveryOutcome(dispatchResult.statusCode, dispatchResult.errorMessage);

  if (outcome.isSuccess) {
    log.success(deliveryId, outcome.reason, dispatchResult.responseTimeMs);
    await db
      .update(deliveries)
      .set({
        status: "delivered",
        attemptsCount: attemptNumber,
        completedAt: new Date(),
        nextRetryAt: null,
        updatedAt: new Date(),
      })
      .where(eq(deliveries.id, deliveryId));
    return;
  }

  // Check if eligible for retry
  const canRetry = outcome.isRetryable && attemptNumber < delivery.maxAttempts;

  if (canRetry) {
    const nextAttempt = attemptNumber + 1;
    const delayMs = computeBackoffDelayMs(nextAttempt);
    const nextRetryDate = new Date(Date.now() + delayMs);

    log.retry(deliveryId, nextAttempt, delivery.maxAttempts, delayMs, outcome.reason);

    await db
      .update(deliveries)
      .set({
        status: "retrying",
        attemptsCount: attemptNumber,
        nextRetryAt: nextRetryDate,
        updatedAt: new Date(),
      })
      .where(eq(deliveries.id, deliveryId));

    await enqueueDeliveryJob(deliveryId, delayMs, nextAttempt);
  } else {
    log.failed(deliveryId, `${outcome.reason} (terminal)`);

    await db
      .update(deliveries)
      .set({
        status: "failed",
        attemptsCount: attemptNumber,
        completedAt: new Date(),
        nextRetryAt: null,
        updatedAt: new Date(),
      })
      .where(eq(deliveries.id, deliveryId));
  }
}
