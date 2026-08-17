"use client";

import { useChat } from "@ai-sdk/react";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getChatErrorMessage } from "@/lib/ai/chat-errors";
import type { AskMessage, AskSource } from "@/lib/ai/citations";
import { CitedResponse } from "./cited-response";

function messageSources(message: AskMessage): AskSource[] {
  return message.metadata?.sources ?? [];
}

function messageText(message: AskMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

interface ChatInterfaceProps {
  initialUsage: {
    queriesUsed: number;
    queryLimit: number;
    allowed: boolean;
  };
  onQueryComplete?: () => void;
}

export function ChatInterface({
  initialUsage,
  onQueryComplete,
}: ChatInterfaceProps) {
  const { messages, sendMessage, status, error } = useChat<AskMessage>();
  const [input, setInput] = useState("");
  const [usage, setUsage] = useState(initialUsage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.role === "assistant" &&
      status !== "streaming" &&
      status !== "submitted" &&
      lastMessage.id !== lastAssistantMessageIdRef.current
    ) {
      lastAssistantMessageIdRef.current = lastMessage.id;
      setUsage((prev) => ({
        ...prev,
        queriesUsed: prev.queriesUsed + 1,
      }));
      onQueryComplete?.();
    }
  }, [messages, status, onQueryComplete]);

  const hasMessages = messages.length > 0;
  const isLoading = status === "streaming" || status === "submitted";
  const displayError = error ? getChatErrorMessage(error) : undefined;
  const showChat = hasMessages || Boolean(displayError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-16">
        <div className="mx-auto h-full max-w-4xl">
          {showChat ? (
            <div className="space-y-6 px-4 pb-8 md:px-0">
              {messages.map((message, index) => {
                if (message.role === "user") {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-lg bg-secondary p-3">
                        <div className="text-[15px] leading-relaxed">
                          {messageText(message)}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className="flex w-full items-start py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <CitedResponse
                        text={messageText(message)}
                        sources={messageSources(message)}
                        showSources={
                          !(isLoading && index === messages.length - 1)
                        }
                      />
                    </div>
                  </div>
                );
              })}

              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="flex w-full items-start py-2">
                    <div className="flex items-center gap-2 pt-0.5">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span className="text-sm">Searching your library…</span>
                    </div>
                  </div>
                )}

              {displayError && (
                <div className="flex w-full items-start py-2">
                  <div className="max-w-[80%] rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                    <p className="text-sm">{displayError}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-8 sm:px-12">
              <p className="max-w-md text-center select-none font-serif text-2xl font-medium text-muted-foreground">
                Ask me anything about your library and notes
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mx-auto max-w-4xl px-4 pb-4 md:px-0">
          {usage.queryLimit !== Infinity && (
            <p className="mb-2 text-xs text-muted-foreground">
              Queries this month: {usage.queriesUsed}
            </p>
          )}
          <form onSubmit={handleSubmit} className="w-full">
            <Card className="p-4">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask a question about your library..."
                  disabled={isLoading}
                  className="max-h-[200px] min-h-[60px] resize-none overflow-y-auto border-0 bg-transparent p-0 text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
