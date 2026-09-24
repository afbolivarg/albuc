import { apiError, readJson } from "@/lib/api/http";
import { supabaseAuth } from "@/lib/api/session";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const body = await readJson(request);
  const email =
    body && typeof body === "object" && "email" in body
      ? String(body.email ?? "").trim()
      : "";

  if (!email.includes("@")) {
    return apiError(400, "invalid_request", "Enter a valid email.");
  }

  const { error } = await supabaseAuth().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/app`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return apiError(400, "invalid_request", error.message);
  }

  return Response.json({ ok: true });
}
