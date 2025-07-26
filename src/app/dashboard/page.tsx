import { getUser } from "@/lib/db/queries"
import SignOut from "./sign-out"

export default async function DashboardPage() {
  const user = await getUser()

  return (
    <div className="w-screen h-screen flex flex-col gap-4 items-center justify-center min-h-svh">
      <span className="text-2xl font-semibold">
        {user?.email ? `Hello, ${user.email}!` : "Error"}
      </span>
      <SignOut />
    </div>
  )
}
