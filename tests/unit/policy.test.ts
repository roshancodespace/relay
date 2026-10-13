import { describe, it, expect } from "vitest";
import { classifyDeliveryOutcome, computeBackoffDelayMs } from "@/domain/deliveries/policy";

describe("Delivery Policy & Backoff Engine", () => {
  describe("Outcome Classification", () => {
    it("classifies HTTP 2xx as success", () => {
      expect(classifyDeliveryOutcome(200, null).isSuccess).toBe(true);
      expect(classifyDeliveryOutcome(201, null).isSuccess).toBe(true);
      expect(classifyDeliveryOutcome(204, null).isSuccess).toBe(true);
    });

    it("classifies permanent 4xx errors as non-retryable failures", () => {
      const statuses = [400, 401, 403, 404, 405, 410, 422];
      for (const status of statuses) {
        const outcome = classifyDeliveryOutcome(status, null);
        expect(outcome.isSuccess).toBe(false);
        expect(outcome.isRetryable).toBe(false);
        expect(outcome.classification).toBe("permanent_failure");
      }
    });

    it("classifies 408 and 429 as retryable transient failures", () => {
      const outcome408 = classifyDeliveryOutcome(408, null);
      expect(outcome408.isRetryable).toBe(true);

      const outcome429 = classifyDeliveryOutcome(429, null);
      expect(outcome429.isRetryable).toBe(true);
    });

    it("classifies 5xx server errors as retryable transient failures", () => {
      const statuses = [500, 502, 503, 504];
      for (const status of statuses) {
        const outcome = classifyDeliveryOutcome(status, null);
        expect(outcome.isRetryable).toBe(true);
        expect(outcome.classification).toBe("transient_failure");
      }
    });

    it("classifies network exceptions and timeouts as retryable", () => {
      const outcome = classifyDeliveryOutcome(null, "ETIMEDOUT: Connection timed out");
      expect(outcome.isRetryable).toBe(true);
      expect(outcome.classification).toBe("transient_failure");
    });
  });

  describe("Exponential Backoff with Full Jitter", () => {
    it("returns immediate delay 0 for first attempt", () => {
      expect(computeBackoffDelayMs(1)).toBe(0);
    });

    it("generates positive delay bounded by exponential ceiling for retries", () => {
      const baseMs = 15000;

      // Attempt 2: max 15s (15000ms)
      for (let i = 0; i < 20; i++) {
        const delay = computeBackoffDelayMs(2, baseMs);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(15000);
      }

      // Attempt 3: max 30s (30000ms)
      for (let i = 0; i < 20; i++) {
        const delay = computeBackoffDelayMs(3, baseMs);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(30000);
      }
    });

    it("respects max cap constraint", () => {
      const maxCap = 60000; // 1 minute
      for (let i = 0; i < 20; i++) {
        const delay = computeBackoffDelayMs(10, 15000, maxCap);
        expect(delay).toBeLessThanOrEqual(maxCap);
      }
    });
  });
});
