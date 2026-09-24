import {
  displayName,
  nameInitial,
  needsOnboarding as onboardingIncomplete,
} from "@albuc/domain";
import type { User } from "@/lib/db/schema";

export function needsOnboarding(user: User): boolean {
  return onboardingIncomplete(user.onboardingCompletedAt);
}

export function userDisplayName(user: User): string {
  return displayName(user);
}

export function userInitial(user: User): string {
  return nameInitial(user);
}
