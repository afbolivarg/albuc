import Link from "next/link";
import { signIn } from "../actions";
import {
  AuthField,
  AuthFooter,
  AuthForm,
  type AuthSearchParams,
} from "../auth-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<AuthSearchParams>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      title="Sign in"
      message={params.message}
      error={params.error}
      action={signIn}
      submitLabel="Sign in"
      footer={
        <AuthFooter>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
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
        autoComplete="current-password"
        required
        labelExtra={
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        }
      />
    </AuthForm>
  );
}
