import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthenticatedUser } from "@/domain/auth/current-user";
import { hashPassword, verifyPassword } from "@/domain/auth/passwords";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/auth/profile - Change user password
 */
export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json(
      { error: "Both current password and new password are required." },
      { status: 400 }
    );
  }

  if (body.newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const isValidCurrent = await verifyPassword(body.currentPassword, user.passwordHash);
  if (!isValidCurrent) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const newHash = await hashPassword(body.newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true, message: "Password updated successfully." });
}
