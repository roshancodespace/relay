import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { endpoints } from "@/db/schema";
import { createEndpoint, deleteEndpoint, updateEndpoint } from "@/domain/endpoints/manager";
import { getAuthenticatedProject } from "@/domain/auth/current-user";
import { desc, eq } from "drizzle-orm";

/**
 * GET /api/v1/endpoints - List registered webhook endpoints for the authenticated project
 */
export async function GET() {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  const endpointList = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.projectId, auth.project.id))
    .orderBy(desc(endpoints.createdAt));

  return NextResponse.json({ endpoints: endpointList, project: auth.project });
}

/**
 * POST /api/v1/endpoints - Register new webhook endpoint for the authenticated project
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  let body: { url?: string; description?: string; eventTypes?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.url) {
    return NextResponse.json({ error: "Field 'url' is required." }, { status: 400 });
  }

  const result = await createEndpoint({
    projectId: auth.project.id,
    url: body.url,
    description: body.description,
    eventTypes: body.eventTypes && body.eventTypes.length > 0 ? body.eventTypes : ["*"],
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ endpoint: result.endpoint }, { status: 201 });
}

/**
 * PATCH /api/v1/endpoints?id={id} - Update a webhook endpoint
 */
export async function PATCH(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpointId = searchParams.get("id");
  if (!endpointId) {
    return NextResponse.json({ error: "Query parameter 'id' is required." }, { status: 400 });
  }

  let body: { url?: string; description?: string; eventTypes?: string[]; isEnabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await updateEndpoint(auth.project.id, endpointId, body);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ endpoint: result.endpoint });
}

/**
 * DELETE /api/v1/endpoints?id={id} - Delete a webhook endpoint for the authenticated project
 */
export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpointId = searchParams.get("id");
  if (!endpointId) {
    return NextResponse.json({ error: "Query parameter 'id' is required." }, { status: 400 });
  }

  const deleted = await deleteEndpoint(auth.project.id, endpointId);
  if (!deleted) {
    return NextResponse.json({ error: "Endpoint not found or unauthorized." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Endpoint deleted successfully." });
}
