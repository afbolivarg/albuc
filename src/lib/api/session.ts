import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { ensureAppUser } from "@/lib/db/queries";
import type { User } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/user";

export function supabaseAuth() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export async function appUserFromAccessToken(
  accessToken: string,
): Promise<{ appUser: User; authUser: SupabaseUser } | null> {
  const { data, error } = await supabaseAuth().auth.getUser(accessToken);
  if (error || !data.user) return null;
  const appUser = await ensureAppUser(data.user);
  return { appUser, authUser: data.user };
}

export async function appUserFromRequest(
  request: Request,
): Promise<User | null> {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();
    if (!token) return null;
    const session = await appUserFromAccessToken(token);
    return session?.appUser ?? null;
  }

  const supabaseUser = await getCurrentUser();
  if (!supabaseUser) return null;
  return ensureAppUser(supabaseUser);
}
