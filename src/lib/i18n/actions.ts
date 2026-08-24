"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/supabase/user";
import { isLocale } from "./config";

export async function setPreferredLocaleAction(locale: string) {
  if (!isLocale(locale)) return { error: "errors.localeInvalid" };

  const supabaseUser = await getCurrentUser();
  if (!supabaseUser) return { error: "errors.authRequired" };

  await db.execute(
    sql`UPDATE users SET locale = ${locale}, locale_locked = true WHERE supabase_user_id = ${supabaseUser.id}`,
  );

  revalidatePath("/", "layout");
  return { success: true as const };
}
