import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getAuthenticatedProject } from "@/domain/auth/current-user";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/v1/projects - Update workspace/project settings
 */
export async function PATCH(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.name || body.name.trim().length === 0) {
    return NextResponse.json({ error: "Workspace name is required." }, { status: 400 });
  }

  const [updated] = await db
    .update(projects)
    .set({
      name: body.name.trim(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, auth.project.id))
    .returning();

  return NextResponse.json({ project: updated });
}
