export interface DeliveryOutcome {
  isSuccess: boolean;
  isRetryable: boolean;
  classification: "success" | "permanent_failure" | "transient_failure";
  reason: string;
}

const BASE_DELAY_MS = 15 * 1000; // 15 seconds
const MAX_DELAY_MS = 60 * 60 * 1000; // 1 hour cap

/**
 * Classifies an HTTP status code or network error into a retryable vs permanent outcome.
 */
export function classifyDeliveryOutcome(
  statusCode: number | null,
  errorMessage: string | null
): DeliveryOutcome {
  if (statusCode !== null) {
    // 2xx Success
    if (statusCode >= 200 && statusCode < 300) {
      return {
        isSuccess: true,
        isRetryable: false,
        classification: "success",
        reason: `HTTP ${statusCode} Success`,
      };
    }

    // 408 (Request Timeout) and 429 (Too Many Requests) are retryable
    if (statusCode === 408 || statusCode === 429) {
      return {
        isSuccess: false,
        isRetryable: true,
        classification: "transient_failure",
        reason: statusCode === 429 ? "HTTP 429 Rate Limited" : "HTTP 408 Request Timeout",
      };
    }

    // Standard 4xx client errors are permanent
    if (statusCode >= 400 && statusCode < 500) {
      return {
        isSuccess: false,
        isRetryable: false,
        classification: "permanent_failure",
        reason: `HTTP ${statusCode} Permanent Client Error`,
      };
    }

    // 5xx server errors are transient / retryable
    if (statusCode >= 500) {
      return {
        isSuccess: false,
        isRetryable: true,
        classification: "transient_failure",
        reason: `HTTP ${statusCode} Server Error`,
      };
    }
  }

  // Network / timeout errors without HTTP response
  return {
    isSuccess: false,
    isRetryable: true,
    classification: "transient_failure",
    reason: errorMessage || "Network connectivity or timeout failure",
  };
}

/**
 * Computes an exponential backoff delay with Full Jitter.
 * Jitter spreads retries across the window to prevent hammering recovering endpoints.
 *
 * Formula: random(0, min(max_cap, base * 2^(attempt - 1)))
 */
export function computeBackoffDelayMs(
  attemptNumber: number,
  baseMs: number = BASE_DELAY_MS,
  maxMs: number = MAX_DELAY_MS
): number {
  if (attemptNumber <= 1) {
    return 0; // Immediate first attempt
  }

  const exponentialMax = Math.min(maxMs, baseMs * Math.pow(2, attemptNumber - 2));
  // Random integer between 0 and exponentialMax (Full Jitter)
  return Math.floor(Math.random() * exponentialMax);
}
