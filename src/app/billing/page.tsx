import { getCurrentUser } from "@/lib/supabase/user"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getPlanDetail } from "@/lib/billing/ls"
import { subscribe, openCustomerPortal } from "@/app/actions/billing"
import Link from "next/link"

export default async function BillingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/")

  const [monthly, lifetime] = await Promise.all([
    getPlanDetail("monthly"),
    getPlanDetail("lifetime"),
  ])

  async function subscribeMonthly() {
    "use server"
    const id = monthly?.data?.id as string | undefined
    if (!id) throw new Error("Monthly variant not found")
    await subscribe(id)
  }

  async function subscribeLifetime() {
    "use server"
    const id = lifetime?.data?.id as string | undefined
    if (!id) throw new Error("Lifetime variant not found")
    await subscribe(id)
  }

  async function managePortal() {
    "use server"
    await openCustomerPortal()
  }

  const monthlyPrice = monthly?.data?.attributes?.name || "Monthly"
  const lifetimePrice = lifetime?.data?.attributes?.name || "Lifetime"

  return (
    <main className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif font-bold">Billing</h1>
        <Link href="/library">
          <Button variant="outline" size="sm">
            Back to Library
          </Button>
        </Link>
      </div>
      <div className="grid gap-4">
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">Curator (Monthly)</div>
            <div className="text-muted-foreground text-sm">{monthlyPrice}</div>
          </div>
          <form action={subscribeMonthly}>
            <Button type="submit">Subscribe to Curator</Button>
          </form>
        </div>

        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">Archivist (Lifetime)</div>
            <div className="text-muted-foreground text-sm">{lifetimePrice}</div>
          </div>
          <form action={subscribeLifetime}>
            <Button type="submit">Buy Archivist</Button>
          </form>
        </div>

        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">Manage Subscription</div>
            <div className="text-muted-foreground text-sm">
              Open the Lemon Squeezy customer portal
            </div>
          </div>
          <form action={managePortal}>
            <Button type="submit" variant="outline">
              Open Portal
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
