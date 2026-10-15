"use server";

import { createMagicLink, sendMagicLinkEmail } from "@/lib/auth/magic-link";
import type { MessageKey } from "@/lib/i18n/en";
import { localeFromFormData } from "@/lib/i18n/server";
import { createLogger, toError } from "@/lib/logger";
import { getRequestOrigin } from "@/lib/request-origin";

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
    const origin = await getRequestOrigin();
    const token = await createMagicLink(email);
    const link = `${origin}/auth/confirm?token=${encodeURIComponent(token)}`;
    await sendMagicLinkEmail(email, link);
    return { message: "auth.checkEmail" };
  } catch (e) {
    log.error("signIn failed", toError(e), {
      email,
      locale: localeFromFormData(formData),
    });
    return { error: "auth.sendFailed" };
  }
}
