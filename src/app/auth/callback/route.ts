import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createUser, getUserByGoogleSub, updateUser } from "@/lib/db/queries"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  let next = searchParams.get("next") ?? "/library" // if "next" is in param, use it as the redirect URL

  // if "next" is not a relative URL, use the default
  if (!next.startsWith("/")) {
    next = "/library"
  }

  if (code) {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      try {
        // Create or update user in our database
        // Extract profile picture URL from various possible locations
        const profilePicture =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          user.identities?.[0]?.identity_data?.avatar_url ||
          user.identities?.[0]?.identity_data?.picture ||
          null

        // Extract name from various possible locations
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.identities?.[0]?.identity_data?.full_name ||
          user.identities?.[0]?.identity_data?.name ||
          null

        const existingUser = await getUserByGoogleSub(user.id)

        if (existingUser) {
          // Update existing user
          await updateUser({
            ...existingUser,
            email: user.email || existingUser.email,
            name: displayName,
            imageUrl: profilePicture,
          })
        } else {
          // Create new user
          await createUser({
            googleSub: user.id,
            email: user.email!,
            name: displayName,
            imageUrl: profilePicture,
          })
        }

        const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === "development"

        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } catch (dbError) {
        console.error("Error creating/updating user:", dbError)
        return NextResponse.redirect(`${origin}/?error=user_creation_failed`)
      }
    } else {
      console.error("Code exchange error:", error)
      return NextResponse.redirect(`${origin}/?error=code_exchange_failed`)
    }
  }

  // return the user to an error page with instructions
  const errorMessage = searchParams.get("error")
  if (errorMessage) {
    console.error("OAuth error:", errorMessage)
    return NextResponse.redirect(`${origin}/?error=oauth_error`)
  }

  console.error("No authorization code provided")
  return NextResponse.redirect(`${origin}/?error=no_code`)
}
