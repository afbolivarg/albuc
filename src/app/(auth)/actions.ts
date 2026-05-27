"use server";

import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { createLogger, toError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const log = createLogger("auth.actions");

export type SignInState = {
  message?: string;
  error?: string;
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Email is required." };
  }

  try {
    const supabase = createClient(await cookies());
    const emailRedirectTo = `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    if (error) {
      return { error: error.message };
    }

    return { message: "Check your email for the sign-in link." };
  } catch (e) {
    log.error("signIn failed", toError(e), { email });
    return { error: "Something went wrong. Please try again." };
  }
}
