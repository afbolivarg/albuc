"use client";

import { useChat } from "@ai-sdk/react";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const [usage, setUsage] = useState(initialUsage); // used for display and increment
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track the last completed assistant message to avoid multiple increments
  const lastAssistantMessageIdRef = useRef<string | null>(null);

  // Auto-resize textarea on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 200;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  // Update usage when a new assistant message is completed (not during streaming)
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // Only increment when:
    // 1. Last message is from assistant
    // 2. Not currently streaming (status is not 'streaming' or 'submitted')
    // 3. We haven't already counted this message
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");

    // Reset textarea height after submit
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Main Canvas Area - scrollable messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto h-full">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          {/* Messages Display */}
          {hasMessages ? (
            <div className="space-y-6 px-4 md:px-0">
              {messages.map((message) => {
                // For user messages, show chat-like bubble (constrained)
                if (message.role === "user") {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="rounded-lg p-3 max-w-[80%] bg-secondary">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            {message.parts.map((part) => {
                              if (part.type === "text") {
                                return (
                                  <div key={`${message.id}-${part.text}`}>
                                    {part.text}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // For assistant messages, show full-width without box (unconstrained)
                return (
                  <div
                    key={message.id}
                    className="w-full flex items-start gap-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      {message.parts.map((part) => {
                        if (part.type === "text") {
                          return (
                            <Response
                              key={`${message.id}-${part.text}`}
                              className="prose prose-sm prose-invert max-w-none"
                            >
                              {part.text}
                            </Response>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Loading State - only show when submitted but no assistant message yet */}
              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="w-full flex items-start gap-3 py-2">
                    <div className="flex items-center gap-2 pt-0.5">
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      <span className="text-sm">Searching your library...</span>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="font-serif text-2xl font-medium text-muted-foreground select-none">
                Ask me anything about your library and notes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input Section - Sticky to bottom */}
      <div>
        <div className="max-w-4xl mx-auto pb-4 px-4 md:px-0">
          {usage.queryLimit !== Infinity && (
            <p className="text-xs text-muted-foreground mb-2">
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
                  className="min-h-[60px] max-h-[200px] resize-none border-0 shadow-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground overflow-y-auto"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0"
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
