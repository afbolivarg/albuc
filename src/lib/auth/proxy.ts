import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./session";

export async function updateSession(request: NextRequest) {
  const userId = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const pathname = request.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/library") || pathname.startsWith("/onboarding");

  if (!userId && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (userId && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/library";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
