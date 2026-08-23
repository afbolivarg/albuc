"use server";

import { checkAIUsageAllowed } from "@/lib/ai/usage";
import { authenticatedAction } from "@/lib/safe-action";

export const getAIUsageAction = authenticatedAction.action(
  async ({ ctx: { user } }) => {
    const usageCheck = await checkAIUsageAllowed(user.id);

    return {
      allowed: usageCheck.allowed,
      overSoftCap: usageCheck.overSoftCap,
      queriesUsed: usageCheck.queriesUsed,
      queryLimit: usageCheck.queryLimit,
      tokensUsed: usageCheck.tokensUsed,
      tokenLimit: usageCheck.tokenLimit,
      reason: usageCheck.reason,
    };
  },
);
