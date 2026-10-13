import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import {
  getAuthenticatedUser,
  ACTIVE_PROJECT_COOKIE_NAME,
} from "@/domain/auth/current-user";
import { eq, and } from "drizzle-orm";
/**
 * POST /api/v1/projects/switch - Switch the active project cookie for authenticated user
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  let body: { projectId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const projectId = body.projectId;
  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
  }

  const [matched] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!matched) {
    return NextResponse.json({ error: "Project not found or unauthorized." }, { status: 404 });
  }

  const response = NextResponse.json({ success: true, project: matched });
  response.cookies.set(ACTIVE_PROJECT_COOKIE_NAME, matched.id, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
