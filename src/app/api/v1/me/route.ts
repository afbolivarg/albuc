import { isLocale, isValidHandle, normalizeHandle } from "@albuc/domain";
import { revalidatePath } from "next/cache";
import { apiError, readJson } from "@/lib/api/http";
import { presentProfile } from "@/lib/api/present";
import { appUserFromRequest } from "@/lib/api/session";
import { updateUserProfile } from "@/lib/db/queries";
import { publicProfilePath } from "@/lib/sharing";

export async function GET(request: Request) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");
  return Response.json(presentProfile(user));
}

export async function PATCH(request: Request) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return apiError(400, "invalid_request", "Missing profile.");
  }

  const input = body as Record<string, unknown>;
  const patch: {
    firstName?: string;
    lastName?: string;
    handle?: string | null;
    publicProfile?: boolean;
    locale?: string;
    localeLocked?: boolean;
    onboardingCompletedAt?: Date;
  } = {};

  if ("firstName" in input || "lastName" in input) {
    const firstName = String(input.firstName ?? "").trim();
    const lastName = String(input.lastName ?? "").trim();
    if (
      !firstName ||
      !lastName ||
      firstName.length > 40 ||
      lastName.length > 40
    ) {
      return apiError(
        400,
        "invalid_request",
        "Enter your first and last name.",
      );
    }
    patch.firstName = firstName;
    patch.lastName = lastName;
  }

  if ("handle" in input) {
    const handle = normalizeHandle(String(input.handle ?? ""));
    if (handle && !isValidHandle(handle)) {
      return apiError(
        400,
        "invalid_request",
        "Use 3–24 letters, numbers, or hyphens.",
      );
    }
    patch.handle = handle || null;
  }

  if ("publicProfile" in input) {
    patch.publicProfile = input.publicProfile === true;
  }

  if (patch.publicProfile && !(patch.handle ?? user.handle)) {
    return apiError(400, "invalid_request", "Choose a username first.");
  }

  if ("locale" in input) {
    const locale = String(input.locale ?? "");
    if (!isLocale(locale)) {
      return apiError(400, "invalid_request", "Unsupported language.");
    }
    patch.locale = locale;
    patch.localeLocked = true;
  }

  if (input.completeOnboarding === true) {
    const firstName = patch.firstName ?? user.firstName;
    const lastName = patch.lastName ?? user.lastName;
    const handle = patch.handle === undefined ? user.handle : patch.handle;
    if (!firstName?.trim() || !lastName?.trim() || !handle?.trim()) {
      return apiError(
        400,
        "invalid_request",
        "Add your name and username first.",
      );
    }
    patch.onboardingCompletedAt = new Date();
  }

  try {
    const updated = await updateUserProfile(user.id, patch);
    if (!updated)
      return apiError(500, "internal", "Could not save your profile.");
    revalidatePath("/library");
    revalidatePath("/onboarding");
    if (updated.handle) revalidatePath(publicProfilePath(updated.handle));
    return Response.json(presentProfile(updated));
  } catch {
    return apiError(409, "conflict", "That username is taken.");
  }
}
