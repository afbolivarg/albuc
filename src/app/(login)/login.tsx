"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signIn, signUp } from "./actions"
import { useAction } from "next-safe-action/hooks"

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  const { execute: executeSignIn, isExecuting: isSigningIn } = useAction(signIn)
  const { execute: executeSignUp, isExecuting: isSigningUp } = useAction(signUp)
  const isPending = mode === "signin" ? isSigningIn : isSigningUp

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    if (mode === "signin") {
      await executeSignIn({ email, password })
    } else {
      await executeSignUp({ email, password })
    }
  }

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-md mx-auto py-12", "")}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "signin"
              ? "Login to your account"
              : "Create your account"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Enter your email below to login to your account"
              : "Enter your email below to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" action={handleSubmit}>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                autoComplete="email"
                maxLength={50}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? mode === "signin"
                  ? "Signing in..."
                  : "Signing up..."
                : mode === "signin"
                  ? "Login"
                  : "Sign up"}
            </Button>
            <div className="mt-4 text-center text-sm">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/sign-up${redirect ? `?redirect=${redirect}` : ""}`}
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href={`/sign-in${redirect ? `?redirect=${redirect}` : ""}`}
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
