"use server";

import { checkAIUsageAllowed } from "@/lib/ai/usage";
import { authenticatedAction } from "@/lib/safe-action";

export const getAIUsageAction = authenticatedAction.action(
  async ({ ctx: { user } }) => {
    const usageCheck = await checkAIUsageAllowed(user.id);

    return {
      allowed: usageCheck.allowed,
      queriesUsed: usageCheck.queriesUsed,
      queryLimit: usageCheck.queryLimit,
      reason: usageCheck.reason,
    };
  },
);
