import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createLogger } from "@/lib/logger";
import { createClient as createServerClient } from "@/lib/supabase/server";

const log = createLogger("auth.signOut");

export async function clearAuthSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { error } = await supabase.auth.signOut();

  if (error) {
    log.warn("supabase signOut failed", { message: error.message });
  }

  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      cookieStore.delete(cookie.name);
    }
  }

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/subscribe");
  revalidatePath("/onboarding");
  revalidatePath("/sign-in");
}
