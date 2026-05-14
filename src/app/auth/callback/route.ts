import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ensureAppUser } from "@/lib/db/queries"
import { logError } from "@/lib/logger"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  let next = searchParams.get("next") ?? "/library"

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
        await ensureAppUser(user)
        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        }
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        }
        return NextResponse.redirect(`${origin}${next}`)
      } catch (dbError) {
        logError(dbError, { operation: "auth/callback", userId: user.id })
        return NextResponse.redirect(`${origin}/?error=user_creation_failed`)
      }
    }

    logError(error ?? new Error("Code exchange failed"), {
      operation: "auth/callback",
    })
    return NextResponse.redirect(`${origin}/?error=code_exchange_failed`)
  }

  const errorMessage = searchParams.get("error")
  if (errorMessage) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(errorMessage)}`
    )
  }

  return NextResponse.redirect(`${origin}/?error=no_code`)
}
