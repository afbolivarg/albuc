import { Suspense } from "react"
import { Login } from "../login"

export default function SignInPage() {
  return (
    <Suspense>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Login mode="signin" />
        </div>
      </div>
    </Suspense>
  )
}
