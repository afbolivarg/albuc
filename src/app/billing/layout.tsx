import { getCurrentUser } from "@/lib/supabase/user"
import { redirect } from "next/navigation"
// import { LibraryHeader } from "../library/library-header"
// import { getUserUsageAndPlan } from "@/lib/db/queries"

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  // const usage = await getUserUsageAndPlan(user.id)

  return (
    <div className="min-h-screen bg-background">
      {/* <LibraryHeader user={user} usage={usage} /> */}
      {children}
    </div>
  )
}
