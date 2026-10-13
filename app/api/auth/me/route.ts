import { NextResponse } from "next/server";
import { getAuthenticatedProject } from "@/domain/auth/current-user";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * GET /api/auth/me - Retrieve authenticated session, active project, and workspace list
 */
export async function GET() {
  const auth = await getAuthenticatedProject();
  if (!auth) {
    return NextResponse.json({ user: null, project: null, projects: [] });
  }

  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.userId, auth.user.id))
    .orderBy(asc(projects.createdAt));

  return NextResponse.json({
    user: {
      id: auth.user.id,
      email: auth.user.email,
      createdAt: auth.user.createdAt,
    },
    project: {
      id: auth.project.id,
      name: auth.project.name,
    },
    projects: userProjects,
  });
}
