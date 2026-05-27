import Link from "next/link";
import { signUp } from "../actions";
import {
  AuthField,
  AuthFooter,
  AuthForm,
  type AuthSearchParams,
} from "../auth-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<AuthSearchParams>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      title="Create an account"
      message={params.message}
      error={params.error}
      action={signUp}
      submitLabel="Sign up"
      footer={
        <AuthFooter>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
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
      <AuthField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        hint="At least 6 characters"
      />
    </AuthForm>
  );
}
