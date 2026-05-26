import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "../actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        {params.message && (
          <p className="text-sm text-muted-foreground">{params.message}</p>
        )}
        {params.error && (
          <p className="text-sm text-destructive">{params.error}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={signIn} className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <div className="text-center text-sm space-y-1">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot password?
          </Link>
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
