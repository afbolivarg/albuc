"use server"

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/user"
import { createCheckoutLink, getCustomerPortalUrl } from "@/lib/billing/ls"
import { db } from "@/lib/db"
import { subscriptions, orders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function subscribe(variantId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!
  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not configured")
  }

  const checkoutLink = await createCheckoutLink(
    variantId,
    storeId,
    user.id,
    user.email!
  )

  redirect(checkoutLink)
}

export async function openCustomerPortal() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  // Find LS customer id from latest subscription or order (subscriptions table stores customerId)
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1)

  let customerId = sub?.customerId
  if (!customerId) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .limit(1)
    customerId = order?.customerId ?? null
  }
  if (!customerId) {
    throw new Error("No customer found for portal")
  }

  const url = await getCustomerPortalUrl(customerId)
  if (!url) {
    throw new Error("Customer portal is not available")
  }
  redirect(url)
}
