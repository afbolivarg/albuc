import { getUser } from "@/lib/db/queries";
import { hasFullAccess } from "./entitlement";

export async function requireWritableUser() {
  const user = await getUser();
  if (!user) return { error: "errors.authRequired" as const };
  if (!hasFullAccess(user))
    return { error: "errors.subscribeRequired" as const };
  return { user };
}
