import { UserMenu } from "./user-menu"
import { SquareLibrary } from "lucide-react"
import { getUser } from "@/lib/db/queries"
import Link from "next/link"
import { redirect } from "next/navigation"

export async function LibraryHeader() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/library"
          className="flex items-center space-x-2 cursor-pointer select-auto"
          tabIndex={0}
          aria-label="Go to Library"
        >
          <span className="text-2xl font-serif font-bold text-foreground flex items-center gap-2 select-text">
            <SquareLibrary className="w-6 h-6" />
            Albuc
          </span>
        </Link>
        <UserMenu user={user} />
      </div>
    </header>
  )
}
