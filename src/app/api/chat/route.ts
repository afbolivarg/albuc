import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createChatErrorResponse } from "@/lib/ai/chat-errors";
import { generateEmbedding } from "@/lib/ai/embedding";
import { getChatModel } from "@/lib/ai/provider";
import { checkAIUsageAllowed, incrementAIUsage } from "@/lib/ai/usage";
import { getUser, semanticSearchNotes } from "@/lib/db/queries";
import { createLogger, toError } from "@/lib/logger";

const log = createLogger("api.chat");

export async function POST(req: Request) {
  try {
    // 1. Authenticate user and get database user
    const user = await getUser();
    if (!user) {
      return createChatErrorResponse(401);
    }

    // 2. Parse request body
    const { messages }: { messages: UIMessage[] } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return createChatErrorResponse(400);
    }

    // Get the last user message and extract text from parts
    const lastMessage = messages[messages.length - 1];
    const textParts = lastMessage.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ");

    if (!textParts.trim()) {
      return createChatErrorResponse(400);
    }

    const question = textParts;

    // 3. Check AI usage (auth-based; always allowed for authenticated users)
    const usageCheck = await checkAIUsageAllowed(user.id);

    if (!usageCheck.allowed) {
      return createChatErrorResponse(402);
    }

    // 4. Generate query embedding
    const queryEmbedding = await generateEmbedding(question);

    // 5. Perform semantic search
    const relevantChunks = await semanticSearchNotes(
      user.id,
      queryEmbedding,
      8,
    );

    // 6. Build context with citations
    let systemPrompt: string;

    if (relevantChunks.length === 0) {
      systemPrompt = `You are a reading copilot. The user has asked a question but you couldn't find any relevant information in their library. Politely let them know that you need relevant notes or books in their library to answer this question.`;
    } else {
      const contextParts = relevantChunks.map((chunk, index) => {
        const citation = chunk.publish_year
          ? `"${chunk.title}" by ${chunk.authors?.join(", ") || "Unknown"}, ${chunk.publish_year}`
          : `"${chunk.title}" by ${chunk.authors?.join(", ") || "Unknown"}`;

        return `[${index + 1}] From ${citation}:\n${chunk.chunk}`;
      });

      const context = contextParts.join("\n\n");

      // Extract unique books for sources metadata
      const uniqueBooks = new Map<
        string,
        {
          bookId: string;
          title: string;
          authors: string[];
          publishYear: number | null;
        }
      >();

      for (const chunk of relevantChunks) {
        if (!uniqueBooks.has(chunk.book_id)) {
          uniqueBooks.set(chunk.book_id, {
            bookId: chunk.book_id,
            title: chunk.title,
            authors: chunk.authors || [],
            publishYear: chunk.publish_year,
          });
        }
      }

      systemPrompt = `You are a reading copilot from the app Albuc helping the user understand and recall information from their personal library.

CRITICAL RULES:
1. Answer ONLY based on the provided context from the user's notes
2. Do NOT use external knowledge or information not in the context
3. If the context doesn't contain enough information, say so clearly
4. When citing sources, use the book title and author inline (e.g., "According to 'Atomic Habits' by James Clear..." or "As mentioned in 'Deep Work' by Cal Newport...")
5. DO NOT use numbered citations like [1], [2], etc. - always use the full book title and author name
6. Be concise but thorough
7. If multiple sources have relevant info, synthesize them together and mention each source by title and author
8. Respond in the same language as the question
9. Do not use emojis
10. If the question has nothing to do with the user's library (like "Hello" or "Thank you"), just respond with a polite message and tell ask them how can you help them with their notes.

Context from the user's library:

${context}`;
    }

    // 7. Increment usage counter
    await incrementAIUsage(user.id);

    // 8. Stream the response
    const result = streamText({
      model: getChatModel() as Parameters<typeof streamText>[0]["model"],
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      temperature: 0.3,
      maxRetries: 2,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    log.error("request failed", toError(error));
    return createChatErrorResponse(500);
  }
}
