"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isLocale } from "./config";

export async function setPreferredLocaleAction(locale: string) {
  if (!isLocale(locale)) return { error: "errors.localeInvalid" };

  const user = await getCurrentUser();
  if (!user) return { error: "errors.authRequired" };

  await db
    .update(users)
    .set({ locale, localeLocked: true })
    .where(eq(users.id, user.id));

  revalidatePath("/", "layout");
  return { success: true as const };
}
