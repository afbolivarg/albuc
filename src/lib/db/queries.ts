import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { and, eq, isNull } from "drizzle-orm"

export async function getUser() {
  const sessionCookie = (await cookies()).get("session")
  if (!sessionCookie || !sessionCookie.value) {
    return null
  }

  const sessionData = await verifyToken(sessionCookie.value)
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "string"
  ) {
    return null
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1)

  if (user.length === 0) {
    return null
  }

  return user[0]
}
