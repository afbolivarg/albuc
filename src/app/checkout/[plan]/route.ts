import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/user"
import { createCheckoutLink } from "@/lib/billing/ls"
import { canUserAccessCheckout } from "@/lib/billing/plan"
import { getUser } from "@/lib/db/queries"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ plan: string }> }
) {
  const { plan } = await params
  const user = await getCurrentUser()

  // If user is not logged in, redirect to home (shouldn't happen)
  if (!user) {
    redirect("/?error=authentication_required")
  }

  // Check if user can access checkout
  const dbUser = await getUser()
  if (!dbUser) {
    redirect("/?error=user_not_found")
  }

  const checkoutAccess = await canUserAccessCheckout(dbUser.id)
  if (!checkoutAccess.canAccess) {
    redirect(
      `/library?error=${encodeURIComponent(checkoutAccess.reason || "Cannot access checkout")}`
    )
  }

  // Validate plan type
  if (!["monthly", "yearly", "lifetime"].includes(plan)) {
    redirect("/?error=invalid_plan")
  }

  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!
  if (!storeId) {
    redirect("/?error=configuration_error")
  }

  // Map plan types to variant IDs
  let variantId: string
  switch (plan) {
    case "monthly":
      variantId = process.env.LEMON_SQUEEZY_VARIANT_ID_MONTHLY!
      break
    case "yearly":
      // Fallback to monthly if yearly variant not configured
      variantId =
        process.env.LEMON_SQUEEZY_VARIANT_ID_YEARLY ||
        process.env.LEMON_SQUEEZY_VARIANT_ID_MONTHLY!
      break
    case "lifetime":
      variantId = process.env.LEMON_SQUEEZY_VARIANT_ID_LIFETIME!
      break
    default:
      redirect("/?error=invalid_plan")
  }

  if (!variantId) {
    redirect(`/?error=variant_not_configured_${plan}`)
  }

  let checkoutLink: string
  try {
    checkoutLink = await createCheckoutLink(
      variantId,
      storeId,
      user.id,
      user.email!
    )
  } catch (error) {
    console.error("Checkout creation error:", error)
    redirect("/?error=checkout_creation_failed")
  }

  // Redirect happens outside try-catch to avoid catching NEXT_REDIRECT
  redirect(checkoutLink)
}
