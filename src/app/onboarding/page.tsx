import { redirect } from "next/navigation";
import {
  hasFullAccess,
  hasGivenName,
  signedInPath,
} from "@/lib/billing/entitlement";
import { getUser } from "@/lib/db/queries";
import { needsOnboarding } from "@/lib/user-profile";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!needsOnboarding(user)) {
    redirect(signedInPath(user));
  }

  if (hasGivenName(user) && !hasFullAccess(user)) {
    redirect("/subscribe");
  }

  return (
    <OnboardingFlow user={user} requiresSubscribe={!hasFullAccess(user)} />
  );
}
