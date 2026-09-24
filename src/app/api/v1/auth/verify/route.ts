import type { EmailOtpType } from "@supabase/supabase-js";
import { apiError, readJson } from "@/lib/api/http";
import { presentProfile } from "@/lib/api/present";
import { supabaseAuth } from "@/lib/api/session";
import { ensureAppUser } from "@/lib/db/queries";

export async function POST(request: Request) {
  const body = await readJson(request);
  const tokenHash =
    body && typeof body === "object" && "tokenHash" in body
      ? String(body.tokenHash ?? "")
      : "";
  const type =
    body && typeof body === "object" && "type" in body
      ? String(body.type ?? "email")
      : "email";

  if (!tokenHash) {
    return apiError(400, "invalid_request", "That sign-in link is incomplete.");
  }

  const { data, error } = await supabaseAuth().auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });

  if (error || !data.session || !data.user) {
    return apiError(
      401,
      "auth_required",
      "That sign-in link is invalid or expired.",
    );
  }

  const appUser = await ensureAppUser(data.user);

  return Response.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    profile: presentProfile(appUser),
  });
}
