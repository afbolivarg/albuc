import { db } from "@/lib/db"
import { usageCounters } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

async function getOrCreateUsageCounter(userId: string, month: string) {
  const existing = await db
    .select()
    .from(usageCounters)
    .where(
      and(eq(usageCounters.userId, userId), eq(usageCounters.month, month))
    )
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  const newCounter = await db
    .insert(usageCounters)
    .values({
      userId,
      month,
      queriesUsed: 0,
    })
    .returning()

  return newCounter[0]
}

/**
 * Auth-based only: all authenticated users can use AI. Usage is tracked for optional analytics.
 */
export async function checkAIUsageAllowed(userId: string): Promise<{
  allowed: boolean
  queriesUsed: number
  queryLimit: number
  reason?: string
}> {
  const currentMonth = getCurrentMonth()
  const counter = await getOrCreateUsageCounter(userId, currentMonth)
  return {
    allowed: true,
    queriesUsed: counter.queriesUsed,
    queryLimit: Number.POSITIVE_INFINITY,
  }
}

export async function incrementAIUsage(userId: string): Promise<void> {
  const currentMonth = getCurrentMonth()
  const counter = await getOrCreateUsageCounter(userId, currentMonth)

  await db
    .update(usageCounters)
    .set({
      queriesUsed: counter.queriesUsed + 1,
      updatedAt: new Date(),
    })
    .where(eq(usageCounters.id, counter.id))
}

export async function getUsageStats(userId: string): Promise<{
  queriesUsed: number
  queryLimit: number
  month: string
}> {
  const currentMonth = getCurrentMonth()
  const counter = await getOrCreateUsageCounter(userId, currentMonth)
  return {
    queriesUsed: counter.queriesUsed,
    queryLimit: Number.POSITIVE_INFINITY,
    month: currentMonth,
  }
}
