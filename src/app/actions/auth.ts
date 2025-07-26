"use server"

import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function signInWithGoogle() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
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

export async function signOut() {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error("Failed to sign out")
  }

  redirect("/")
}
