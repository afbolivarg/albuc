import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";
import { needsOnboarding } from "@/lib/user-profile";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!needsOnboarding(user)) {
    redirect("/library");
  }

  return <OnboardingFlow user={user} />;
}
