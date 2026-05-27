import Link from "next/link";
import { forgotPassword } from "../actions";
import {
  AuthField,
  AuthFooter,
  AuthForm,
  type AuthSearchParams,
} from "../auth-form";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<AuthSearchParams>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      title="Reset password"
      description="Enter your email and we'll send you a link to reset your password."
      message={params.message}
      messageVariant={params.message ? "success" : "muted"}
      error={params.error}
      action={forgotPassword}
      submitLabel="Send reset link"
      footer={
        <AuthFooter>
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </AuthFooter>
      }
    >
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
    </AuthForm>
  );
}
