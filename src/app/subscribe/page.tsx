import { getCurrentUser } from "@/lib/supabase/user"
import { getUserWithPlan } from "@/lib/db/queries"
import { redirect } from "next/navigation"
import { PricingSection } from "@/app/(landing)/pricing"
import { SquareLibrary, LogOut } from "lucide-react"
import { signOut } from "../library/actions"

export default async function SubscribePage() {
  const supabaseUser = await getCurrentUser()

  // If not logged in, redirect to home
  if (!supabaseUser) {
    redirect("/")
  }

  // If user already has a plan, redirect to library
  const userWithPlan = await getUserWithPlan()
  if (userWithPlan) {
    redirect("/library")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-serif font-bold text-foreground flex items-center gap-2 select-none">
            <SquareLibrary className="w-6 h-6" />
            Albuc
          </span>
          <div className="flex items-center gap-4">
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:outline-none px-3 py-2 rounded-md hover:bg-muted/50"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <PricingSection />
      </main>
    </div>
  )
}
