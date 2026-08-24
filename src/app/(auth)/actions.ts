"use server";

import { cookies } from "next/headers";
import type { MessageKey } from "@/lib/i18n/en";
import { localeFromFormData } from "@/lib/i18n/server";
import { createLogger, toError } from "@/lib/logger";
import { getRequestOrigin } from "@/lib/request-origin";
import { createClient } from "@/lib/supabase/server";

const log = createLogger("auth.actions");

export type SignInState = {
  message?: MessageKey;
  error?: MessageKey;
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "auth.emailRequired" };
  }

  try {
    const supabase = createClient(await cookies());
    const origin = await getRequestOrigin();
    const emailRedirectTo = `${origin}/auth/confirm`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    if (error) {
      log.error("signInWithOtp failed", toError(error), {
        email,
        emailRedirectTo,
        locale: localeFromFormData(formData),
      });
      return { error: "auth.sendFailed" };
    }

    return { message: "auth.checkEmail" };
  } catch (e) {
    log.error("signIn failed", toError(e), { email });
    return { error: "auth.genericError" };
  }
}
