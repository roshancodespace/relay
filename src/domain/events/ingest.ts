import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { events, deliveries, endpoints, type Event, type Delivery } from "@/db/schema";
import { matchesEventType } from "./matcher";
import { enqueueDeliveryJob } from "@/queue/producer";

export const MAX_PAYLOAD_BYTES = 256 * 1024; // 256 KB

export const ingestEventSchema = z.object({
  type: z
    .string()
    .min(1, "Event type is required.")
    .max(100, "Event type must be 100 characters or fewer."),
  data: z.record(z.string(), z.unknown(), {
    message: "Field 'data' must be a valid JSON object.",
  }),
});

export type IngestEventInput = z.infer<typeof ingestEventSchema>;

export interface IngestionResult {
  success: boolean;
  event?: Event;
  deliveries?: Delivery[];
  isIdempotentReplay?: boolean;
  error?: {
    code: "validation_error" | "payload_too_large" | "internal_error";
    message: string;
    details?: unknown;
  };
}

/**
 * Validates, persists, and fans out an ingested event to all matching project endpoints.
 * Handles idempotency deduplication and transaction atomicity.
 */
export async function ingestEvent(
  projectId: string,
  rawBody: unknown,
  idempotencyKey?: string | null
): Promise<IngestionResult> {
  // Payload size check
  const jsonString = JSON.stringify(rawBody);
  if (Buffer.byteLength(jsonString, "utf-8") > MAX_PAYLOAD_BYTES) {
    return {
      success: false,
      error: {
        code: "payload_too_large",
        message: `Payload exceeds maximum limit of ${MAX_PAYLOAD_BYTES / 1024} KB.`,
      },
    };
  }

  // Schema validation
  const parseResult = ingestEventSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return {
      success: false,
      error: {
        code: "validation_error",
        message: "Invalid event payload.",
        details: z.treeifyError(parseResult.error),
      },
    };
  }

  const { type: eventType, data } = parseResult.data;

  // Return existing event if already processed
  if (idempotencyKey) {
    const existingEvents = await db
      .select()
      .from(events)
      .where(and(eq(events.projectId, projectId), eq(events.idempotencyKey, idempotencyKey)))
      .limit(1);

    if (existingEvents.length > 0) {
      const existing = existingEvents[0];
      const existingDeliveries = await db
        .select()
        .from(deliveries)
        .where(eq(deliveries.eventId, existing.id));

      return {
        success: true,
        event: existing,
        deliveries: existingDeliveries,
        isIdempotentReplay: true,
      };
    }
  }

  // Find all active endpoints for this project that subscribe to this event type
  const activeEndpoints = await db
    .select()
    .from(endpoints)
    .where(and(eq(endpoints.projectId, projectId), eq(endpoints.isEnabled, true)));

  const matchedEndpoints = activeEndpoints.filter((ep) =>
    matchesEventType(eventType, ep.eventTypes)
  );

  // Transactionally insert event and its delivery rows
  const result = await db.transaction(async (tx) => {
    const [insertedEvent] = await tx
      .insert(events)
      .values({
        projectId,
        eventType,
        payload: data,
        idempotencyKey: idempotencyKey || null,
      })
      .returning();

    const createdDeliveries: Delivery[] = [];

    for (const endpoint of matchedEndpoints) {
      const [newDelivery] = await tx
        .insert(deliveries)
        .values({
          projectId,
          eventId: insertedEvent.id,
          endpointId: endpoint.id,
          status: "pending",
          attemptsCount: 0,
          maxAttempts: 5,
        })
        .returning();

      createdDeliveries.push(newDelivery);
    }

    return {
      insertedEvent,
      createdDeliveries,
    };
  });

  // Enqueue BullMQ jobs for each delivery
  for (const delivery of result.createdDeliveries) {
    enqueueDeliveryJob(delivery.id, 0, 1).catch((err) => {
      console.warn(`Could not enqueue delivery ${delivery.id} via BullMQ:`, err);
    });
  }

  return {
    success: true,
    event: result.insertedEvent,
    deliveries: result.createdDeliveries,
    isIdempotentReplay: false,
  };
}
