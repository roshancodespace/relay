import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, projects } from "@/db/schema";
import { verifyPassword } from "@/domain/auth/passwords";
import { createSessionToken } from "@/domain/auth/session";
import { SESSION_COOKIE_NAME } from "@/domain/auth/current-user";

const loginSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

/**
 * POST /api/auth/login - Authenticate user and issue session cookie
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  // Fetch their primary project
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id));

  // Issue session cookie
  const sessionToken = createSessionToken(user.id, user.email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    projects: userProjects.map((p) => ({ id: p.id, name: p.name })),
  });
}
