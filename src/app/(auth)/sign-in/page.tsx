import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";
import { needsOnboarding } from "@/lib/user-profile";
import { signIn } from "../actions";
import { AuthField, AuthForm } from "../auth-form";

export default async function SignInPage() {
  const user = await getUser();

  if (user) {
    redirect(needsOnboarding(user) ? "/onboarding" : "/library");
  }

  return (
    <AuthForm
      title="Sign in"
      description="Enter your email and we'll send you a magic link."
      action={signIn}
      submitLabel="Send magic link"
    >
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        validateEmailOnBlur
      />
    </AuthForm>
  );
}
