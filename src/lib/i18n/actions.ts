"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/supabase/user";
import { isLocale, LOCALE_COOKIE, LOCALE_LOCKED_COOKIE } from "./config";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

function cookieOptions() {
  return {
    path: "/",
    maxAge: TEN_YEARS,
    sameSite: "lax" as const,
  };
}

export async function setPreferredLocaleAction(locale: string) {
  if (!isLocale(locale)) return { error: "Invalid locale" };

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, cookieOptions());
  store.set(LOCALE_LOCKED_COOKIE, "1", cookieOptions());

  const supabaseUser = await getCurrentUser();
  if (supabaseUser) {
    await db
      .update(users)
      .set({ locale, localeLocked: true })
      .where(eq(users.supabaseUserId, supabaseUser.id));
  }

  revalidatePath("/", "layout");
  return { success: true as const };
}
