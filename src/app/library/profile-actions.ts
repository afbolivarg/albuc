"use server";

import { revalidatePath } from "next/cache";
import { getUser, updateUserProfile } from "@/lib/db/queries";
import { normalizeHandle, publicProfilePath } from "@/lib/sharing";

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,22}[a-z0-9])?$/;

export async function updatePublicProfileAction(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Please sign in again." };

  const handle = normalizeHandle(String(formData.get("handle") ?? ""));
  const publicProfile = formData.get("publicProfile") === "on";

  if (handle && !HANDLE_RE.test(handle)) {
    return { error: "Use 3–24 letters, numbers, or hyphens." };
  }
  if (publicProfile && !handle) {
    return { error: "Choose a handle before making your shelf public." };
  }

  try {
    await updateUserProfile(user.id, {
      handle: handle || null,
      publicProfile,
    });
    revalidatePath("/library");
    if (handle) revalidatePath(publicProfilePath(handle));
    return { success: true as const };
  } catch {
    return { error: "That handle is already taken." };
  }
}
