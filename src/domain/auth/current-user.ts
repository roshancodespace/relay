import { cookies } from "next/headers";
import { db } from "@/db";
import { users, projects, type User, type Project } from "@/db/schema";
import { verifySessionToken } from "./session";
import { eq, and } from "drizzle-orm";

export const SESSION_COOKIE_NAME = "relay_session";
export const ACTIVE_PROJECT_COOKIE_NAME = "relay_active_project";

/**
 * Retrieves the currently authenticated user based on the signed session cookie.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return null;
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return null;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    return user || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the authenticated user and verifies they own the requested project.
 * If no projectId is passed, defaults to the user's primary project.
 */
export async function getAuthenticatedProject(projectId?: string): Promise<{ user: User; project: Project } | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const targetId = projectId || cookieStore.get(ACTIVE_PROJECT_COOKIE_NAME)?.value;

  let project: Project | undefined;

  if (targetId) {
    const [matched] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, targetId), eq(projects.userId, user.id)))
      .limit(1);
    project = matched;
  }

  if (!project) {
    const [firstProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(projects.createdAt)
      .limit(1);
    project = firstProject;
  }

  if (!project) {
    return null;
  }

  return { user, project };
}
