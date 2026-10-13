import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, projects } from "@/db/schema";
import { hashPassword } from "@/domain/auth/passwords";
import { createSessionToken } from "@/domain/auth/session";
import { SESSION_COOKIE_NAME } from "@/domain/auth/current-user";

const registerSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  projectName: z.string().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { email, password, projectName } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already registered
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  // Atomically create user and initial project
  const result = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
      })
      .returning();

    const [newProject] = await tx
      .insert(projects)
      .values({
        userId: newUser.id,
        name: projectName || "My Project",
      })
      .returning();

    return { user: newUser, project: newProject };
  });

  // Issue session cookie
  const sessionToken = createSessionToken(result.user.id, result.user.email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return NextResponse.json(
    {
      user: { id: result.user.id, email: result.user.email },
      project: { id: result.project.id, name: result.project.name },
    },
    { status: 201 }
  );
}
