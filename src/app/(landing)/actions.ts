"use server"

import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not set")
}

export async function signInWithGoogle() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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
