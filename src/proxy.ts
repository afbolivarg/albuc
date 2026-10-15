import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/proxy";
import { applyInferredLocaleCookie } from "@/lib/i18n/cookie";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  return applyInferredLocaleCookie(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|serwist/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};
