import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "../actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>
        {params.message && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {params.message}
          </p>
        )}
        {params.error && (
          <p className="text-sm text-destructive">{params.error}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={forgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
