export const SOFT_MONTHLY_QUERY_LIMIT = 200;
export const SOFT_MONTHLY_TOKEN_LIMIT = 250_000;
export const HARD_MONTHLY_QUERY_LIMIT = 2_000;
export const HARD_MONTHLY_TOKEN_LIMIT = 2_000_000;

export const MONTHLY_BUDGET_MESSAGE =
  "You've used this month's Ask budget. Your notes still work.";

export type AIUsageSnapshot = {
  allowed: boolean;
  overSoftCap: boolean;
  queriesUsed: number;
  queryLimit: number;
  tokensUsed: number;
  tokenLimit: number;
  counterId: string;
  reason?: string;
};
