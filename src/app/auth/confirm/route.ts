import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ensureAppUser } from "@/lib/db/queries";
import { env } from "@/lib/env";
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
        await ensureAppUser(data.user);
        return NextResponse.redirect(buildRedirectUrl(request, next));
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
