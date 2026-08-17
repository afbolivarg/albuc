import type { User } from "@/lib/db/schema";

export function needsOnboarding(user: User): boolean {
  return user.onboardingCompletedAt == null;
}

export function userDisplayName(user: User): string {
  const name = [user.firstName, user.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .trim();
  return name || user.email;
}

export function userInitial(user: User): string {
  const source = user.firstName?.trim() || user.email;
  return source.charAt(0).toUpperCase() || "?";
}
