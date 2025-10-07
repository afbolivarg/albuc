import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type PlanType = "monthly" | "yearly"

export const UNLIMITED = Number.POSITIVE_INFINITY

export async function getUserPlan(userId: string): Promise<{
  plan: PlanType
  bookLimit: number
} | null> {
  // DEV MODE: Skip payment checks if enabled
  if (process.env.SKIP_PAYMENT_CHECK === "true") {
    return { plan: "yearly", bookLimit: UNLIMITED }
  }

  // Check for active subscription (monthly or yearly)
  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  if (sub.length > 0 && ["active", "on_trial"].includes(sub[0].status)) {
    // Determine if it's monthly or yearly based on variant ID
    const yearlyVariantId = process.env.LEMON_SQUEEZY_VARIANT_ID_YEARLY

    if (sub[0].variantId === yearlyVariantId) {
      return { plan: "yearly", bookLimit: UNLIMITED }
    }

    // Default to monthly for any active subscription
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

  // User with any active plan can still access checkout to change plans
  return { canAccess: true }
}
