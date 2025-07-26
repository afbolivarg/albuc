import { getCurrentUser } from "@/lib/auth/user"
import { redirect } from "next/navigation"
import { LibraryHeader } from "./library-header"

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <LibraryHeader user={user} />
      {children}
    </div>
  )
}
