import type { EmailOtpType } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { signedInPath } from "@/lib/billing/entitlement";
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

function confirmParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let token_hash = searchParams.get("token_hash");
  let type = searchParams.get("type") as EmailOtpType | null;

  // Chat and some clients encode the whole query as one blob:
  // /auth/confirm?token_hash%3D...%26type%3Dmagiclink
  if (!token_hash) {
    const decoded = decodeURIComponent(
      request.nextUrl.search.replace(/^\?/, ""),
    );
    const fallback = new URLSearchParams(decoded);
    token_hash = fallback.get("token_hash");
    type = (fallback.get("type") as EmailOtpType | null) ?? type;
  }

  return { token_hash, type };
}

export async function GET(request: NextRequest) {
  const { token_hash, type } = confirmParams(request);

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
        const destination = signedInPath(appUser);
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
          buildRedirectUrl(request, "/sign-in?error=auth.userCreateFailed"),
        );
      }
    }

    log.error(
      "verify otp failed",
      toError(error ?? new Error("Verify OTP failed")),
    );
  }

  return NextResponse.redirect(
    buildRedirectUrl(request, "/sign-in?error=auth.linkInvalid"),
  );
}
