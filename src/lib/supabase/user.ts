import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  try {
    const supabase = createServerClient(await cookies());
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
