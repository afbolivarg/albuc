import { redirect } from "next/navigation";
import { getAIUsageAction } from "../ai-actions";
import { AskContainer } from "./ask-container";

export default async function AskPage() {
  // Fetch initial usage data on the server
  const usageResult = await getAIUsageAction();

  // If no usage data (not authenticated), redirect to login
  if (!usageResult?.data) {
    redirect("/sign-in");
  }

  const initialUsage = {
    queriesUsed: usageResult.data.queriesUsed,
    queryLimit: usageResult.data.queryLimit,
    allowed: usageResult.data.allowed,
    overSoftCap: usageResult.data.overSoftCap,
    tokensUsed: usageResult.data.tokensUsed,
  };

  return (
    <div className="flex h-full flex-col">
      <AskContainer initialUsage={initialUsage} />
    </div>
  );
}
