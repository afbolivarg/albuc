import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOrUpdateUser } from "@/lib/auth/user"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/library"

  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
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
        await createOrUpdateUser(user)

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
