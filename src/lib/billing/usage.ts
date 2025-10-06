import { db } from "@/lib/db"
import { usageCounters } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getUserPlan, CURATOR_QUERY_LIMIT } from "./plan"

/**
 * Get the current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/**
 * Get or create usage counter for a user in the current month
 */
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

  // Create new counter for this month
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
 * Check if user has queries remaining for AI usage
 * Returns { allowed: boolean, queriesUsed: number, queryLimit: number, reason?: string }
 */
export async function checkAIUsageAllowed(userId: string): Promise<{
  allowed: boolean
  queriesUsed: number
  queryLimit: number
  reason?: string
}> {
  const planInfo = await getUserPlan(userId)

  // No plan - user needs to subscribe
  if (!planInfo) {
    return {
      allowed: false,
      queriesUsed: 0,
      queryLimit: 0,
      reason: "No active subscription. Please subscribe to use AI features.",
    }
  }

  // Archivist (lifetime) plan has unlimited queries
  if (planInfo.plan === "lifetime") {
    // Still track usage for stats, but no limits
    const currentMonth = getCurrentMonth()
    const counter = await getOrCreateUsageCounter(userId, currentMonth)
    return {
      allowed: true,
      queriesUsed: counter.queriesUsed,
      queryLimit: Number.POSITIVE_INFINITY,
    }
  }

  // Curator (monthly) plan has query limit
  const currentMonth = getCurrentMonth()
  const counter = await getOrCreateUsageCounter(userId, currentMonth)

  const queryLimit = CURATOR_QUERY_LIMIT
  const queriesUsed = counter.queriesUsed

  if (queriesUsed >= queryLimit) {
    return {
      allowed: false,
      queriesUsed,
      queryLimit,
      reason: `Monthly query limit of ${queryLimit} reached. Upgrade to Archivist for unlimited queries.`,
    }
  }

  return {
    allowed: true,
    queriesUsed,
    queryLimit,
  }
}

/**
 * Increment the AI query counter for a user
 * Should be called after a successful AI query
 */
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

/**
 * Get current usage stats for a user
 */
export async function getUsageStats(userId: string): Promise<{
  queriesUsed: number
  queryLimit: number
  month: string
}> {
  const planInfo = await getUserPlan(userId)

  if (!planInfo) {
    return {
      queriesUsed: 0,
      queryLimit: 0,
      month: getCurrentMonth(),
    }
  }

  const currentMonth = getCurrentMonth()
  const counter = await getOrCreateUsageCounter(userId, currentMonth)

  if (planInfo.plan === "lifetime") {
    return {
      queriesUsed: counter.queriesUsed,
      queryLimit: Number.POSITIVE_INFINITY,
      month: currentMonth,
    }
  }

  return {
    queriesUsed: counter.queriesUsed,
    queryLimit: CURATOR_QUERY_LIMIT,
    month: currentMonth,
  }
}

/**
 * Reset usage counters for all users (to be run monthly via cron)
 * This should be called at the beginning of each month
 */
export async function resetMonthlyCounters(): Promise<void> {
  // This doesn't actually delete old records - it just creates new ones for the new month
  // Old records are kept for historical purposes
  // The getOrCreateUsageCounter function will automatically create new counters for the new month
}
