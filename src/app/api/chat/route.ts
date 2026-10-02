import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { after } from "next/server";
import { createChatErrorResponse } from "@/lib/ai/chat-errors";
import { generateEmbeddingResult } from "@/lib/ai/embedding";
import { joinTextParts } from "@/lib/ai/message-text";
import { buildSystemPrompt, formatCatalog } from "@/lib/ai/prompt";
import { getChatModel } from "@/lib/ai/provider";
import { selectContextChunks, toAskSources } from "@/lib/ai/retrieve";
import { checkAIUsageAllowed, recordAIUsage } from "@/lib/ai/usage";
import {
  getUser,
  listUserBooksForAsk,
  semanticSearchNotes,
} from "@/lib/db/queries";
import { createLogger, toError } from "@/lib/logger";

const log = createLogger("api.chat");

const STREAM_HEADERS = {
  "X-Accel-Buffering": "no",
  "Cache-Control": "no-cache, no-transform",
} as const;

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return createChatErrorResponse(401);
    }

    const { messages }: { messages: UIMessage[] } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return createChatErrorResponse(400);
    }

    const lastMessage = messages[messages.length - 1];
    const question = joinTextParts(lastMessage.parts, " ").trim();

    if (!question) {
      return createChatErrorResponse(400);
    }

    const usageCheck = await checkAIUsageAllowed(user.id);
    if (!usageCheck.allowed) {
      return createChatErrorResponse(402, "ask.hardCap");
    }

    const [queryEmbedding, library] = await Promise.all([
      generateEmbeddingResult(question),
      listUserBooksForAsk(user.id),
    ]);

    const rawChunks = await semanticSearchNotes(
      user.id,
      queryEmbedding.embedding,
      16,
    );
    const relevantChunks = selectContextChunks(rawChunks, 10);
    const sources = toAskSources(relevantChunks);
    const context = relevantChunks
      .map((chunk, index) => {
        const authors = chunk.authors?.join(", ") || "Unknown";
        const year = chunk.publish_year ? `, ${chunk.publish_year}` : "";
        return `[${index + 1}] "${chunk.title}" by ${authors}${year}\n${chunk.chunk}`;
      })
      .join("\n\n");

    after(() =>
      recordAIUsage({
        userId: user.id,
        counterId: usageCheck.counterId,
        queries: 1,
        embeddingTokens: queryEmbedding.tokens,
      }),
    );

    const result = streamText({
      model: getChatModel() as Parameters<typeof streamText>[0]["model"],
      system: buildSystemPrompt(
        formatCatalog(library),
        sources,
        context,
        user.locale,
      ),
      messages: convertToModelMessages(messages),
      maxRetries: 2,
      onFinish: ({ usage }) => {
        void recordAIUsage({
          userId: user.id,
          counterId: usageCheck.counterId,
          promptTokens: usage.inputTokens ?? 0,
          completionTokens: usage.outputTokens ?? 0,
        });
      },
    });

    return result.toUIMessageStreamResponse({
      headers: STREAM_HEADERS,
      originalMessages: messages,
      messageMetadata: ({ part }) => {
        if (part.type === "start" || part.type === "finish") {
          return { sources };
        }
      },
    });
  } catch (error) {
    log.error("request failed", toError(error));
    return createChatErrorResponse(500);
  }
}
