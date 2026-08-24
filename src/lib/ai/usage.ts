import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { usageCounters } from "@/lib/db/schema";
import {
  type AIUsageSnapshot,
  HARD_MONTHLY_QUERY_LIMIT,
  HARD_MONTHLY_TOKEN_LIMIT,
  MONTHLY_BUDGET_MESSAGE,
  SOFT_MONTHLY_QUERY_LIMIT,
  SOFT_MONTHLY_TOKEN_LIMIT,
} from "./usage.shared";

export type { AIUsageSnapshot } from "./usage.shared";
export {
  HARD_MONTHLY_QUERY_LIMIT,
  HARD_MONTHLY_TOKEN_LIMIT,
  MONTHLY_BUDGET_MESSAGE,
  SOFT_MONTHLY_QUERY_LIMIT,
  SOFT_MONTHLY_TOKEN_LIMIT,
} from "./usage.shared";

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function totalTokens(counter: {
  promptTokens: number;
  completionTokens: number;
  embeddingTokens: number;
}): number {
  return (
    counter.promptTokens + counter.completionTokens + counter.embeddingTokens
  );
}

async function getOrCreateUsageCounter(userId: string, month: string) {
  const existing = await db
    .select()
    .from(usageCounters)
    .where(
      and(eq(usageCounters.userId, userId), eq(usageCounters.month, month)),
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const newCounter = await db
    .insert(usageCounters)
    .values({
      userId,
      month,
      queriesUsed: 0,
      promptTokens: 0,
      completionTokens: 0,
      embeddingTokens: 0,
    })
    .returning();

  return newCounter[0];
}

function toSnapshot(
  counter: Awaited<ReturnType<typeof getOrCreateUsageCounter>>,
): AIUsageSnapshot {
  const tokensUsed = totalTokens(counter);
  const overHard =
    counter.queriesUsed >= HARD_MONTHLY_QUERY_LIMIT ||
    tokensUsed >= HARD_MONTHLY_TOKEN_LIMIT;
  const overSoftCap =
    overHard ||
    counter.queriesUsed >= SOFT_MONTHLY_QUERY_LIMIT ||
    tokensUsed >= SOFT_MONTHLY_TOKEN_LIMIT;

  return {
    allowed: !overHard,
    overSoftCap,
    queriesUsed: counter.queriesUsed,
    queryLimit: HARD_MONTHLY_QUERY_LIMIT,
    tokensUsed,
    tokenLimit: HARD_MONTHLY_TOKEN_LIMIT,
    counterId: counter.id,
    reason: overHard ? MONTHLY_BUDGET_MESSAGE : undefined,
  };
}

export async function checkAIUsageAllowed(
  userId: string,
): Promise<AIUsageSnapshot> {
  const currentMonth = getCurrentMonth();
  const counter = await getOrCreateUsageCounter(userId, currentMonth);
  return toSnapshot(counter);
}

export async function recordAIUsage(options: {
  userId: string;
  counterId?: string;
  queries?: number;
  promptTokens?: number;
  completionTokens?: number;
  embeddingTokens?: number;
}): Promise<void> {
  const queries = options.queries ?? 0;
  const promptTokens = options.promptTokens ?? 0;
  const completionTokens = options.completionTokens ?? 0;
  const embeddingTokens = options.embeddingTokens ?? 0;

  if (
    queries === 0 &&
    promptTokens === 0 &&
    completionTokens === 0 &&
    embeddingTokens === 0
  ) {
    return;
  }

  const currentMonth = getCurrentMonth();
  let counterId = options.counterId;

  if (counterId) {
    const counter = await db
      .select({ id: usageCounters.id, userId: usageCounters.userId })
      .from(usageCounters)
      .where(eq(usageCounters.id, counterId))
      .limit(1);

    if (counter.length === 0 || counter[0].userId !== options.userId) {
      counterId = undefined;
    }
  }

  if (!counterId) {
    const counter = await getOrCreateUsageCounter(options.userId, currentMonth);
    counterId = counter.id;
  }

  await db
    .update(usageCounters)
    .set({
      queriesUsed: sql`${usageCounters.queriesUsed} + ${queries}`,
      promptTokens: sql`${usageCounters.promptTokens} + ${promptTokens}`,
      completionTokens: sql`${usageCounters.completionTokens} + ${completionTokens}`,
      embeddingTokens: sql`${usageCounters.embeddingTokens} + ${embeddingTokens}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(usageCounters.id, counterId),
        eq(usageCounters.userId, options.userId),
      ),
    );
}
