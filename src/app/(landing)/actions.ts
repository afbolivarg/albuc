"use server"

import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/supabase/user"
import { createCheckoutLink } from "@/lib/billing/ls"
import { canUserAccessCheckout } from "@/lib/billing/plan"
import { getUser } from "@/lib/db/queries"

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not set")
}

export async function signInWithGoogle() {
  const supabase = await createServerClient()

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    throw new Error("Failed to sign in with Google")
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function subscribeOrSignIn(
  planType: "monthly" | "yearly" | "lifetime"
) {
  const user = await getCurrentUser()

  // If user is not logged in, redirect to Google sign-in with checkout redirect
  if (!user) {
    const checkoutUrl = `/checkout/${planType}`
    const supabase = await createServerClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(checkoutUrl)}`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      throw new Error("Failed to sign in with Google")
    }

    if (data.url) {
      redirect(data.url)
    }
    return
  }

  // User is logged in, check if they can access checkout
  const dbUser = await getUser()
  if (!dbUser) {
    throw new Error("Database user not found")
  }

  const checkoutAccess = await canUserAccessCheckout(dbUser.id)
  if (!checkoutAccess.canAccess) {
    redirect(
      `/library?error=${encodeURIComponent(checkoutAccess.reason || "Cannot access checkout")}`
    )
  }

  // User is logged in and can access checkout, proceed
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!
  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not configured")
  }

  // Map plan types to variant IDs
  let variantId: string
  switch (planType) {
    case "monthly":
      variantId = process.env.LEMON_SQUEEZY_VARIANT_ID_MONTHLY!
      break
    case "yearly":
      variantId = process.env.LEMON_SQUEEZY_VARIANT_ID_YEARLY!
      break
    case "lifetime":
      variantId = process.env.LEMON_SQUEEZY_VARIANT_ID_LIFETIME!
      break
    default:
      throw new Error("Invalid plan type")
  }

  if (!variantId) {
    throw new Error(`Variant ID not configured for ${planType} plan`)
  }

  const checkoutLink = await createCheckoutLink(
    variantId,
    storeId,
    user.id,
    user.email!
  )

  redirect(checkoutLink)
}

export async function subscribeMonthly() {
  return subscribeOrSignIn("monthly")
}

export async function subscribeYearly() {
  return subscribeOrSignIn("yearly")
}

export async function subscribeLifetime() {
  return subscribeOrSignIn("lifetime")
}
