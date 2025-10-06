import { db } from "@/lib/db"
import { orders, subscriptions } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export type PlanType = "monthly" | "lifetime"

export const UNLIMITED = Number.POSITIVE_INFINITY
export const CURATOR_QUERY_LIMIT = 2000 // Monthly query limit for Curator plan

export async function getUserPlan(userId: string): Promise<{
  plan: PlanType
  bookLimit: number
} | null> {
  // DEV MODE: Skip payment checks if enabled
  if (process.env.SKIP_PAYMENT_CHECK === "true") {
    return { plan: "lifetime", bookLimit: UNLIMITED }
  }

  // Lifetime if there is a paid, non-refunded order for lifetime variant
  const lifetimeVariantId = process.env.LEMON_SQUEEZY_VARIANT_ID_LIFETIME

  if (lifetimeVariantId) {
    const lifetime = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.variantId, lifetimeVariantId),
          eq(orders.status, "paid")
        )
      )
      .limit(1)

    if (lifetime.length > 0) {
      return { plan: "lifetime", bookLimit: UNLIMITED }
    }
  }

  // Monthly if active subscription exists
  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  if (sub.length > 0 && ["active", "on_trial"].includes(sub[0].status)) {
    return { plan: "monthly", bookLimit: UNLIMITED }
  }

  // No active plan - user needs to subscribe
  return null
}

export async function canUserAccessCheckout(
  userId: string
): Promise<{ canAccess: boolean; reason?: string }> {
  const userPlan = await getUserPlan(userId)

  // No plan - user can access checkout
  if (!userPlan) {
    return { canAccess: true }
  }

  if (userPlan.plan === "lifetime") {
    return { canAccess: false, reason: "You already have lifetime access." }
  }

  if (userPlan.plan === "monthly") {
    return {
      canAccess: false,
      reason: "You already have an active subscription.",
    }
  }

  return { canAccess: true }
}
