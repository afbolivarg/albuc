"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { AlbucLogo } from "@/components/albuc-logo";
import { getChatErrorKey } from "@/lib/ai/chat-errors";
import type { AskMessage, AskSource } from "@/lib/ai/citations";
import { joinTextParts } from "@/lib/ai/message-text";
import {
  type AIUsageSnapshot,
  SOFT_MONTHLY_QUERY_LIMIT,
} from "@/lib/ai/usage.shared";
import { useT } from "@/lib/i18n/client";
import { CitedResponse } from "./cited-response";

function messageSources(message: AskMessage): AskSource[] {
  return message.metadata?.sources ?? [];
}

function messageText(message: AskMessage): string {
  return joinTextParts(message.parts);
}

interface ChatInterfaceProps {
  initialUsage: Pick<
    AIUsageSnapshot,
    "queriesUsed" | "queryLimit" | "allowed" | "overSoftCap" | "tokensUsed"
  >;
  onQueryComplete?: () => void;
}

export function ChatInterface({
  initialUsage,
  onQueryComplete,
}: ChatInterfaceProps) {
  const t = useT();
  const { messages, sendMessage, status, error, stop } = useChat<AskMessage>();
  const [usage, setUsage] = useState(initialUsage);
  const lastAssistantMessageIdRef = useRef<string | null>(null);

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
        overSoftCap:
          prev.overSoftCap || prev.queriesUsed + 1 >= SOFT_MONTHLY_QUERY_LIMIT,
      }));
      onQueryComplete?.();
    }
  }, [messages, status, onQueryComplete]);

  const isLoading = status === "streaming" || status === "submitted";
  const displayError = error ? t(getChatErrorKey(error)) : undefined;
  const inputDisabled = isLoading || !usage.allowed;

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text || inputDisabled) return;
    sendMessage({ text });
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <Conversation className="min-h-0">
        <ConversationContent
          className={
            messages.length === 0 && !displayError
              ? "mx-auto flex h-full min-h-full w-full max-w-4xl items-center justify-center px-4 md:px-0"
              : "mx-auto w-full max-w-4xl gap-6 px-4 pt-4 pb-8 md:px-0"
          }
        >
          {messages.length === 0 && !displayError ? (
            <ConversationEmptyState className="min-h-0 gap-2.5 p-0">
              <AlbucLogo
                className="text-neutral-400"
                iconClassName="size-12 opacity-35"
                showText={false}
              />
              <p className="max-w-md select-none text-center font-serif text-[19px] text-neutral-400">
                {t("ask.empty")}
              </p>
            </ConversationEmptyState>
          ) : (
            <>
              {messages.map((message, index) => {
                if (message.role === "user") {
                  return (
                    <Message from="user" key={message.id}>
                      <MessageContent>
                        <div className="text-[15px] leading-relaxed">
                          {messageText(message)}
                        </div>
                      </MessageContent>
                    </Message>
                  );
                }

                return (
                  <Message from="assistant" key={message.id}>
                    <MessageContent className="w-full max-w-none">
                      <CitedResponse
                        showSources={
                          !(isLoading && index === messages.length - 1)
                        }
                        sources={messageSources(message)}
                        text={messageText(message)}
                      />
                    </MessageContent>
                  </Message>
                );
              })}

              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <Message from="assistant">
                    <MessageContent>
                      <p className="text-sm text-muted-foreground">
                        {t("ask.searching")}
                      </p>
                    </MessageContent>
                  </Message>
                )}

              {displayError && (
                <Message from="assistant">
                  <MessageContent>
                    <p className="text-sm text-destructive">{displayError}</p>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-4xl px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:px-0">
        {usage.overSoftCap ? (
          <p className="mb-2 text-xs text-muted-foreground">
            {usage.allowed ? t("ask.softCap") : t("ask.hardCap")}
          </p>
        ) : null}
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              disabled={inputDisabled}
              placeholder={t("ask.placeholder")}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit
              disabled={!usage.allowed && status !== "streaming"}
              onStop={stop}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
