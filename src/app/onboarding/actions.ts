"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser, updateUserProfile } from "@/lib/db/queries";

const namePart = z
  .string()
  .trim()
  .min(1, "Required")
  .max(40, "Keep this under 40 characters");

const nameSchema = z.object({
  firstName: namePart,
  lastName: namePart,
});

export async function saveOnboardingNameAction(input: {
  firstName: string;
  lastName: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: "errors.signInAgain" };
  }

  const parsed = nameSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "errors.nameRequired" };
  }

  await updateUserProfile(user.id, parsed.data);
  return { success: true };
}

export async function completeOnboardingAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: "errors.signInAgain" };
  }

  if (!user.firstName?.trim() || !user.lastName?.trim()) {
    return { success: false, error: "errors.addNameFirst" };
  }

  await updateUserProfile(user.id, {
    onboardingCompletedAt: new Date(),
  });
  revalidatePath("/library");
  revalidatePath("/onboarding");
  return { success: true };
}
