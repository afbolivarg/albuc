import { UserMenu } from "./user-menu"
import { SquareLibrary, MessageSquare } from "lucide-react"
import { getUserWithPlan } from "@/lib/db/queries"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export async function LibraryHeader() {
  const user = await getUserWithPlan()

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
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/library/ask" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask
            </Link>
          </Button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
