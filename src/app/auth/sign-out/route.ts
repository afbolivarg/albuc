import { NextResponse } from "next/server";
import { clearAuthSession } from "@/lib/auth/clear-session";

export async function GET(request: Request) {
  await clearAuthSession();
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
