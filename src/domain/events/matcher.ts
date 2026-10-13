/**
 * Checks if an event type matches any pattern in the endpoint's subscribed event types.
 * Supports:
 * - Exact match: "order.created" matches "order.created"
 * - Wildcard all: "*" matches anything
 * - Prefix wildcard: "order.*" matches "order.created", "order.refunded"
 */
export function matchesEventType(eventType: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) {
    return false;
  }

  for (const pattern of patterns) {
    if (pattern === "*") {
      return true;
    }

    if (pattern === eventType) {
      return true;
    }

    if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -2);
      if (eventType.startsWith(`${prefix}.`)) {
        return true;
      }
    }
  }

  return false;
}
