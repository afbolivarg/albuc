"use server"

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/user"
import { createCheckoutLink } from "@/lib/billing/ls"

export async function subscribe(variantId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!
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
  redirect("https://billing.albuc.com/billing")
}
