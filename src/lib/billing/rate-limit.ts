import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { usageCounters } from "@/lib/db/schema";

const WINDOW_MS = 10 * 60 * 1000;
export const ASK_RATE_LIMIT = 20;
export const EMBED_RATE_LIMIT = 30;

function windowKey(kind: "ask" | "embed") {
  const bucket = Math.floor(Date.now() / WINDOW_MS);
  return `rl:${kind}:${bucket}`;
}

async function bump(userId: string, kind: "ask" | "embed", limit: number) {
  const month = windowKey(kind);
  const existing = await db
    .select()
    .from(usageCounters)
    .where(
      and(eq(usageCounters.userId, userId), eq(usageCounters.month, month)),
    )
    .limit(1);

  if (existing[0]) {
    if (existing[0].queriesUsed >= limit) {
      return false;
    }
    await db
      .update(usageCounters)
      .set({
        queriesUsed: sql`${usageCounters.queriesUsed} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(usageCounters.id, existing[0].id));
    return true;
  }

  await db.insert(usageCounters).values({
    userId,
    month,
    queriesUsed: 1,
  });
  return true;
}

export async function consumeAskRateLimit(userId: string) {
  return bump(userId, "ask", ASK_RATE_LIMIT);
}

export async function consumeEmbedRateLimit(userId: string) {
  return bump(userId, "embed", EMBED_RATE_LIMIT);
}
