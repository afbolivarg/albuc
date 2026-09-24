import { apiError, readJson } from "@/lib/api/http";
import { presentProfile } from "@/lib/api/present";
import { appUserFromAccessToken } from "@/lib/api/session";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const body = await readJson(request);
  const refreshToken =
    body && typeof body === "object" && "refreshToken" in body
      ? String(body.refreshToken ?? "")
      : "";

  if (!refreshToken) {
    return apiError(400, "invalid_request", "Missing refresh token.");
  }

  const response = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );

  const payload = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    return apiError(
      401,
      "auth_required",
      payload.error_description || "Sign in again.",
    );
  }

  const session = await appUserFromAccessToken(payload.access_token);
  if (!session) {
    return apiError(401, "auth_required", "Sign in again.");
  }

  return Response.json({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_at ?? null,
    profile: presentProfile(session.appUser),
  });
}
