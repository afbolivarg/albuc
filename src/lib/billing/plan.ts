import { db } from "@/lib/db"
import { orders, subscriptions } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export type PlanType = "free" | "monthly" | "lifetime"

export const FREE_LIMIT = 10
export const UNLIMITED = Number.POSITIVE_INFINITY

export async function getUserPlan(userId: string): Promise<{
  plan: PlanType
  bookLimit: number
}> {
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

  return { plan: "free", bookLimit: FREE_LIMIT }
}

export async function canUserAccessCheckout(
  userId: string
): Promise<{ canAccess: boolean; reason?: string }> {
  const userPlan = await getUserPlan(userId)

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
