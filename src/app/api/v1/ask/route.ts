import { generateText } from "ai";
import { after } from "next/server";
import { generateEmbeddingResult } from "@/lib/ai/embedding";
import { buildSystemPrompt, formatCatalog } from "@/lib/ai/prompt";
import { getChatModel } from "@/lib/ai/provider";
import { selectContextChunks, toAskSources } from "@/lib/ai/retrieve";
import { checkAIUsageAllowed, recordAIUsage } from "@/lib/ai/usage";
import { apiError, readJson } from "@/lib/api/http";
import { appUserFromRequest } from "@/lib/api/session";
import { listUserBooksForAsk, semanticSearchNotes } from "@/lib/db/queries";

type Turn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return apiError(400, "invalid_request", "Ask a question.");
  }
  const input = body as { question?: unknown; history?: unknown };
  const question = String(input.question ?? "").trim();
  if (!question) return apiError(400, "invalid_request", "Ask a question.");

  const history: Turn[] = Array.isArray(input.history)
    ? input.history.flatMap((turn) => {
        if (!turn || typeof turn !== "object") return [];
        const role = "role" in turn ? turn.role : null;
        const content =
          "content" in turn ? String(turn.content ?? "").trim() : "";
        if ((role !== "user" && role !== "assistant") || !content) return [];
        return [{ role, content }];
      })
    : [];

  const usage = await checkAIUsageAllowed(user.id);
  if (!usage.allowed) {
    return apiError(
      402,
      "rate_limited",
      "You've used this month's Ask budget. Your notes still work.",
    );
  }

  const [queryEmbedding, library] = await Promise.all([
    generateEmbeddingResult(question),
    listUserBooksForAsk(user.id),
  ]);
  const chunks = selectContextChunks(
    await semanticSearchNotes(user.id, queryEmbedding.embedding, 16),
    10,
  );
  const sources = toAskSources(chunks);
  const context = chunks
    .map((chunk, index) => {
      const authors = chunk.authors?.join(", ") || "Unknown";
      const year = chunk.publish_year ? `, ${chunk.publish_year}` : "";
      return `[${index + 1}] "${chunk.title}" by ${authors}${year}\n${chunk.chunk}`;
    })
    .join("\n\n");

  after(() =>
    recordAIUsage({
      userId: user.id,
      counterId: usage.counterId,
      queries: 1,
      embeddingTokens: queryEmbedding.tokens,
    }),
  );

  const result = await generateText({
    model: getChatModel() as Parameters<typeof generateText>[0]["model"],
    system: buildSystemPrompt(
      formatCatalog(library),
      sources,
      context,
      user.locale,
    ),
    messages: [
      ...history.map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
      { role: "user" as const, content: question },
    ],
    maxRetries: 2,
  });

  after(() =>
    recordAIUsage({
      userId: user.id,
      counterId: usage.counterId,
      promptTokens: result.usage.inputTokens ?? 0,
      completionTokens: result.usage.outputTokens ?? 0,
    }),
  );

  return Response.json({
    answer: result.text,
    sources,
    overSoftCap: usage.overSoftCap,
  });
}
