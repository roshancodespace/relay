import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { endpoints, type Endpoint, type NewEndpoint } from "@/db/schema";
import { validateUrlSyntax } from "./ssrf";
import { generateSigningSecret } from "../crypto/signatures";

export interface CreateEndpointInput {
  projectId: string;
  url: string;
  description?: string;
  eventTypes: string[];
}

export interface UpdateEndpointInput {
  url?: string;
  description?: string;
  eventTypes?: string[];
  isEnabled?: boolean;
}

/**
 * Creates a new webhook endpoint after validating URL safety and generating a signing secret.
 */
export async function createEndpoint(input: CreateEndpointInput): Promise<{ endpoint?: Endpoint; error?: string }> {
  const urlCheck = validateUrlSyntax(input.url);
  if (!urlCheck.isValid) {
    return { error: urlCheck.error || "Invalid endpoint URL." };
  }

  if (!input.eventTypes || input.eventTypes.length === 0) {
    return { error: "At least one subscribed event type is required." };
  }

  const signingSecret = generateSigningSecret();

  const [newEndpoint] = await db
    .insert(endpoints)
    .values({
      projectId: input.projectId,
      url: input.url,
      description: input.description,
      eventTypes: input.eventTypes,
      signingSecret,
      isEnabled: true,
    })
    .returning();

  return { endpoint: newEndpoint };
}

/**
 * Lists all endpoints belonging to a project.
 */
export async function listEndpointsByProject(projectId: string): Promise<Endpoint[]> {
  return db
    .select()
    .from(endpoints)
    .where(eq(endpoints.projectId, projectId));
}

/**
 * Updates an endpoint's configuration.
 */
export async function updateEndpoint(
  projectId: string,
  endpointId: string,
  input: UpdateEndpointInput
): Promise<{ endpoint?: Endpoint; error?: string }> {
  if (input.url) {
    const urlCheck = validateUrlSyntax(input.url);
    if (!urlCheck.isValid) {
      return { error: urlCheck.error || "Invalid endpoint URL." };
    }
  }

  const [updated] = await db
    .update(endpoints)
    .set({
      ...(input.url && { url: input.url }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.eventTypes && { eventTypes: input.eventTypes }),
      ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
      updatedAt: new Date(),
    })
    .where(and(eq(endpoints.id, endpointId), eq(endpoints.projectId, projectId)))
    .returning();

  if (!updated) {
    return { error: "Endpoint not found or unauthorized." };
  }

  return { endpoint: updated };
}

/**
 * Deletes an endpoint.
 */
export async function deleteEndpoint(projectId: string, endpointId: string): Promise<boolean> {
  const result = await db
    .delete(endpoints)
    .where(and(eq(endpoints.id, endpointId), eq(endpoints.projectId, projectId)))
    .returning({ id: endpoints.id });

  return result.length > 0;
}
