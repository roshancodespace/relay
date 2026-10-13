import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import {
  getAuthenticatedUser,
  getAuthenticatedProject,
  ACTIVE_PROJECT_COOKIE_NAME,
} from "@/domain/auth/current-user";
import { eq, and, asc } from "drizzle-orm";

/**
 * GET /api/v1/projects - List all projects for authenticated user
 */
export async function GET() {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(eq(projects.userId, auth.user.id))
    .orderBy(asc(projects.createdAt));

  return NextResponse.json({
    projects: userProjects,
    activeProjectId: auth.project.id,
  });
}

/**
 * POST /api/v1/projects - Create a new project for authenticated user
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length === 0) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  if (name.length > 100) {
    return NextResponse.json({ error: "Project name must be 100 characters or fewer." }, { status: 400 });
  }

  const [newProject] = await db
    .insert(projects)
    .values({
      userId: user.id,
      name,
    })
    .returning();

  const response = NextResponse.json({ project: newProject }, { status: 201 });
  response.cookies.set(ACTIVE_PROJECT_COOKIE_NAME, newProject.id, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}

/**
 * PATCH /api/v1/projects - Update workspace/project settings
 */
export async function PATCH(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  let body: { id?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length === 0) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  const targetId = body.id || auth.project.id;

  const [updated] = await db
    .update(projects)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, targetId), eq(projects.userId, auth.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Project not found or unauthorized." }, { status: 404 });
  }

  return NextResponse.json({ project: updated });
}

/**
 * DELETE /api/v1/projects - Delete a project for authenticated user
 */
export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("id") || auth.project.id;

  const userProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, auth.user.id));

  if (userProjects.length <= 1) {
    return NextResponse.json(
      { error: "Cannot delete your only project. You must have at least one project." },
      { status: 400 }
    );
  }

  const [deleted] = await db
    .delete(projects)
    .where(and(eq(projects.id, targetId), eq(projects.userId, auth.user.id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const remaining = userProjects.filter((p) => p.id !== targetId);
  const nextActiveId = remaining[0]?.id;

  const response = NextResponse.json({ success: true, nextActiveId });
  if (nextActiveId) {
    response.cookies.set(ACTIVE_PROJECT_COOKIE_NAME, nextActiveId, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  return response;
}
