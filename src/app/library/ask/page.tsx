import { getAIUsageAction } from "../ai-actions"
import { AskContainer } from "./ask-container"
import { redirect } from "next/navigation"

export default async function AskPage() {
  // Fetch initial usage data on the server
  const usageResult = await getAIUsageAction()

  // If no usage data (not authenticated), redirect to login
  if (!usageResult?.data) {
    redirect("/auth/callback")
  }

  const initialUsage = {
    queriesUsed: usageResult.data.queriesUsed,
    queryLimit: usageResult.data.queryLimit,
    allowed: usageResult.data.allowed,
  }

  return (
    <div className="fixed inset-0 top-[65px] flex flex-col">
      <AskContainer initialUsage={initialUsage} />
    </div>
  )
}
