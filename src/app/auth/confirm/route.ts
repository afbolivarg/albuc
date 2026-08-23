import type { EmailOtpType } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAppUser } from "@/lib/db/queries";
import { users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import {
  isLocale,
  LOCALE_COOKIE,
  LOCALE_LOCKED_COOKIE,
} from "@/lib/i18n/config";
import { setLocaleOnResponse } from "@/lib/i18n/cookie";
import { createLogger, toError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

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
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  let next = searchParams.get("next") ?? "/library";

  if (!next.startsWith("/")) {
    next = "/library";
  }

  if (token_hash && type) {
    const supabase = createClient(await cookies());
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data.user) {
      try {
        const appUser = await ensureAppUser(data.user);
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
          ? next
          : "/onboarding";
        const redirectResponse = NextResponse.redirect(
          buildRedirectUrl(request, destination),
        );
        if (appUser.localeLocked && isLocale(appUser.locale)) {
          setLocaleOnResponse(redirectResponse, appUser.locale, true);
        } else if (cookieLocked && isLocale(cookieLocale)) {
          setLocaleOnResponse(redirectResponse, cookieLocale, true);
        }
        return redirectResponse;
      } catch (dbError) {
        log.error("user creation failed", toError(dbError), {
          userId: data.user.id,
        });
        return NextResponse.redirect(
          buildRedirectUrl(request, "/?error=user_creation_failed"),
        );
      }
    }

    log.error(
      "verify otp failed",
      toError(error ?? new Error("Verify OTP failed")),
    );
  }

  return NextResponse.redirect(
    buildRedirectUrl(
      request,
      `/sign-in?error=${encodeURIComponent("Invalid or expired sign-in link. Please try again.")}`,
    ),
  );
}
