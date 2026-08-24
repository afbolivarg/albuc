"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicProfile } from "@/lib/cache-revalidate";
import { getUser, updateUserProfile } from "@/lib/db/queries";
import { HANDLE_RE, normalizeHandle, publicProfilePath } from "@/lib/sharing";

export async function updatePublicProfileAction(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "errors.signInAgain" };

  const handle = normalizeHandle(String(formData.get("handle") ?? ""));
  const publicProfile = formData.get("publicProfile") === "on";

  if (handle && !HANDLE_RE.test(handle)) {
    return { error: "errors.handleFormat" };
  }
  if (publicProfile && !handle) {
    return { error: "errors.handleRequired" };
  }

  try {
    await updateUserProfile(user.id, {
      handle: handle || null,
      publicProfile,
    });
    revalidatePath("/library");
    if (user.handle) revalidatePublicProfile(user.handle);
    if (handle) {
      revalidatePath(publicProfilePath(handle));
      revalidatePublicProfile(handle);
    }
    return { success: true as const };
  } catch {
    return { error: "errors.handleTaken" };
  }
}
