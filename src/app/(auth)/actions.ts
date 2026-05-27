"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createLogger, toError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const log = createLogger("auth.actions");

export async function signIn(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(
      "/sign-in?error=" +
        encodeURIComponent("Email and password are required."),
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const msg =
        error.message.includes("Invalid") ||
        error.message.toLowerCase().includes("invalid")
          ? "Invalid email or password."
          : error.message;
      redirect(`/sign-in?error=${encodeURIComponent(msg)}`);
    }

    redirect("/library");
  } catch (e) {
    if (e instanceof Error && "digest" in e && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    log.error("signIn failed", toError(e), { email });
    redirect(
      `/sign-in?error=${encodeURIComponent("Something went wrong. Please try again.")}`,
    );
  }
}

export async function signUp(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(
      "/sign-up?error=" +
        encodeURIComponent("Email and password are required."),
    );
  }

  if (password.length < 6) {
    redirect(
      "/sign-up?error=" +
        encodeURIComponent("Password must be at least 6 characters."),
    );
  }

  try {
    const supabase = await createClient();
    const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/library`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/sign-in?message=Check your email to confirm your account.");
  } catch (e) {
    if (e instanceof Error && "digest" in e && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    log.error("signUp failed", toError(e), { email });
    redirect(
      `/sign-up?error=${encodeURIComponent("Something went wrong. Please try again.")}`,
    );
  }
}

export async function forgotPassword(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("Email is required.")}`,
    );
  }

  try {
    const supabase = await createClient();
    const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/forgot-password?message=Check your email for the reset link.");
  } catch (e) {
    log.error("forgotPassword failed", toError(e), { email });
    redirect(
      `/forgot-password?error=${encodeURIComponent("Something went wrong. Please try again.")}`,
    );
  }
}

export async function updatePassword(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;

  if (!password || password.length < 6) {
    redirect(
      "/update-password?error=" +
        encodeURIComponent("Password must be at least 6 characters."),
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      redirect(`/update-password?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/library?message=Password updated.");
  } catch (e) {
    if (e instanceof Error && "digest" in e && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    log.error("updatePassword failed", toError(e));
    redirect(
      `/update-password?error=${encodeURIComponent("Something went wrong. Please try again.")}`,
    );
  }
}
