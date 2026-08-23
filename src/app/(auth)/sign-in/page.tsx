import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";
import { t } from "@/lib/i18n/server";
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
      title={await t("auth.signInTitle")}
      description={await t("auth.signInDescription")}
      action={signIn}
      submitLabel={await t("auth.sendMagicLink")}
    >
      <AuthField
        id="email"
        name="email"
        label={await t("auth.email")}
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        validateEmailOnBlur
      />
    </AuthForm>
  );
}
