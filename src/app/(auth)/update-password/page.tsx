import Link from "next/link";
import { updatePassword } from "../actions";
import {
  AuthField,
  AuthFooter,
  AuthForm,
  type AuthSearchParams,
} from "../auth-form";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<AuthSearchParams>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      title="Set new password"
      description="Enter your new password below."
      error={params.error}
      action={updatePassword}
      submitLabel="Update password"
      footer={
        <AuthFooter>
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </AuthFooter>
      }
    >
      <AuthField
        id="password"
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        hint="At least 6 characters"
      />
    </AuthForm>
  );
}
