import { describe, it, expect } from "vitest";
import { matchesEventType } from "@/domain/events/matcher";

describe("Event Type Wildcard Matcher", () => {
  it("matches exact event types", () => {
    expect(matchesEventType("order.created", ["order.created"])).toBe(true);
    expect(matchesEventType("order.created", ["user.created"])).toBe(false);
  });

  it("matches global wildcard '*'", () => {
    expect(matchesEventType("order.created", ["*"])).toBe(true);
    expect(matchesEventType("invoice.paid", ["*"])).toBe(true);
  });

  it("matches prefix wildcards e.g. 'order.*'", () => {
    expect(matchesEventType("order.created", ["order.*"])).toBe(true);
    expect(matchesEventType("order.refunded", ["order.*"])).toBe(true);
    expect(matchesEventType("user.created", ["order.*"])).toBe(false);
  });

  it("handles multiple subscription patterns", () => {
    const patterns = ["customer.*", "invoice.paid"];
    expect(matchesEventType("customer.created", patterns)).toBe(true);
    expect(matchesEventType("customer.deleted", patterns)).toBe(true);
    expect(matchesEventType("invoice.paid", patterns)).toBe(true);
    expect(matchesEventType("invoice.voided", patterns)).toBe(false);
  });

  it("safely handles empty patterns", () => {
    expect(matchesEventType("order.created", [])).toBe(false);
  });
});
