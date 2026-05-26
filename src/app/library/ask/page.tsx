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
  };

  return (
    <div className="fixed inset-0 top-[65px] flex flex-col">
      <AskContainer initialUsage={initialUsage} />
    </div>
  );
}
