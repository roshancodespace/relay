import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/domain/auth/current-user";

/**
 * POST /api/auth/logout - Clear session cookie and sign out
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ success: true, message: "Logged out successfully." });
}
