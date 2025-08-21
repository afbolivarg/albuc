import { createClient as createServerClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }
    return user
  } catch {
    return null
  }
}
