import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "../actions"

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
        {params.error && (
          <p className="text-sm text-destructive">{params.error}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={updatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              At least 6 characters
            </p>
          </div>
          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
