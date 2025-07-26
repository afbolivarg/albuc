import { createClient as createServerClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { User as SupabaseUser } from "@supabase/supabase-js"

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

    // Get user from our database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.googleSub, user.id))
      .limit(1)

    if (dbUser.length === 0) {
      return null
    }

    return {
      ...dbUser[0],
      supabaseUser: user,
    }
  } catch {
    return null
  }
}

export async function createOrUpdateUser(supabaseUser: SupabaseUser) {
  try {
    // Extract profile picture URL from various possible locations
    const profilePicture =
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      supabaseUser.identities?.[0]?.identity_data?.avatar_url ||
      supabaseUser.identities?.[0]?.identity_data?.picture ||
      null

    // Extract name from various possible locations
    const displayName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.identities?.[0]?.identity_data?.full_name ||
      supabaseUser.identities?.[0]?.identity_data?.name ||
      null

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.googleSub, supabaseUser.id))
      .limit(1)

    if (existingUser.length > 0) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          email: supabaseUser.email,
          name: displayName,
          imageUrl: profilePicture,
        })
        .where(eq(users.googleSub, supabaseUser.id))
        .returning()

      return updatedUser
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          googleSub: supabaseUser.id,
          email: supabaseUser.email!,
          name: displayName,
          imageUrl: profilePicture,
        })
        .returning()

      return newUser
    }
  } catch (error) {
    throw error
  }
}
