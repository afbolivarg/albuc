import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { SESSION_COOKIE, verifySession } from "./session";

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = verifySession(token);
  if (!userId) {
    return null;
  }
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user ?? null;
});
