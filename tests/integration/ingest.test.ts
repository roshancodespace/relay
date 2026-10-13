import { describe, it, expect } from "vitest";
import { ingestEventSchema, MAX_PAYLOAD_BYTES } from "@/domain/events/ingest";

describe("Event Ingestion Schema & Boundaries", () => {
  it("accepts a well-formed event payload", () => {
    const valid = {
      type: "order.created",
      data: {
        orderId: "123",
        amount: 4999,
        customer: { email: "alice@example.com" },
      },
    };

    const result = ingestEventSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects missing event type or empty string", () => {
    const invalid = {
      type: "",
      data: { key: "value" },
    };

    const result = ingestEventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects non-object data payload", () => {
    const invalid = {
      type: "order.created",
      data: "not-an-object",
    };

    const result = ingestEventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("verifies 256 KB payload boundary constant", () => {
    expect(MAX_PAYLOAD_BYTES).toBe(262144);

    const oversizedString = "x".repeat(MAX_PAYLOAD_BYTES + 10);
    expect(Buffer.byteLength(oversizedString)).toBeGreaterThan(MAX_PAYLOAD_BYTES);
  });
});
