import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth/magic-link";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import {
  isLocale,
  LOCALE_COOKIE,
  LOCALE_LOCKED_COOKIE,
} from "@/lib/i18n/config";
import { setLocaleOnResponse } from "@/lib/i18n/cookie";
import { createLogger, toError } from "@/lib/logger";

const log = createLogger("auth.confirm");

function buildRedirectUrl(request: NextRequest, path: string): string {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = env.NODE_ENV === "development";

  if (isLocalEnv) {
    return `${origin}${path}`;
  }
  if (forwardedHost) {
    return `https://${forwardedHost}${path}`;
  }
  return `${origin}${path}`;
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");

  if (token) {
    try {
      const appUser = await consumeMagicLink(token);
      if (!appUser) {
        return NextResponse.redirect(
          buildRedirectUrl(request, "/sign-in?error=auth.linkInvalid"),
        );
      }

      const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
      const cookieLocked =
        request.cookies.get(LOCALE_LOCKED_COOKIE)?.value === "1";
      if (!appUser.localeLocked && isLocale(cookieLocale) && cookieLocked) {
        await db
          .update(users)
          .set({ locale: cookieLocale, localeLocked: true })
          .where(eq(users.id, appUser.id));
      }
      const destination = appUser.onboardingCompletedAt
        ? "/library"
        : "/onboarding";
      const redirectResponse = NextResponse.redirect(
        buildRedirectUrl(request, destination),
      );
      redirectResponse.cookies.set(
        SESSION_COOKIE,
        signSession(appUser.id),
        sessionCookieOptions,
      );
      if (appUser.localeLocked && isLocale(appUser.locale)) {
        setLocaleOnResponse(redirectResponse, appUser.locale, true);
      } else if (cookieLocked && isLocale(cookieLocale)) {
        setLocaleOnResponse(redirectResponse, cookieLocale, true);
      }
      return redirectResponse;
    } catch (dbError) {
      log.error("user creation failed", toError(dbError));
      return NextResponse.redirect(
        buildRedirectUrl(request, "/sign-in?error=auth.userCreateFailed"),
      );
    }
  }

  return NextResponse.redirect(
    buildRedirectUrl(request, "/sign-in?error=auth.linkInvalid"),
  );
}
