"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { Loader2, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Response } from "@/components/ai-elements/response"

interface ChatInterfaceProps {
  initialUsage: {
    queriesUsed: number
    queryLimit: number
    allowed: boolean
  }
  onQueryComplete?: () => void
}

export function ChatInterface({
  initialUsage,
  onQueryComplete,
}: ChatInterfaceProps) {
  const { messages, sendMessage, status, error } = useChat()
  const [input, setInput] = useState("")
  const [usage, setUsage] = useState(initialUsage)

  // Track the last completed assistant message to avoid multiple increments
  const lastAssistantMessageIdRef = useRef<string | null>(null)

  // Update usage when a new assistant message is completed (not during streaming)
  useEffect(() => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]

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
      lastAssistantMessageIdRef.current = lastMessage.id
      setUsage(prev => ({
        ...prev,
        queriesUsed: prev.queriesUsed + 1,
      }))
      onQueryComplete?.()
    }
  }, [messages, status, onQueryComplete])

  const hasMessages = messages.length > 0
  const isLoading = status === "streaming" || status === "submitted"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !usage.allowed) return

    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Usage Exceeded Warning */}
      {!usage.allowed && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200 px-4 py-3 rounded-lg">
          <p className="font-medium">Query Limit Reached</p>
          <p className="text-sm">
            You've reached your monthly query limit. Upgrade your plan to
            continue asking questions.
          </p>
        </div>
      )}

      {!hasMessages ? (
        // Empty State
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Ask anything about your library. I'll search through your notes
                and books to provide accurate, cited answers.
              </p>
            </div>
            <div className="text-left space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Try asking:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>"What are the key themes in [book title]?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>"Summarize my notes about [topic]"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    "Find connections between [concept A] and [concept B]"
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      ) : (
        // Messages Display
        <div className="space-y-6">
          {messages.map(message => {
            // For user messages, show chat-like bubble
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="rounded-lg p-4 bg-muted/50 max-w-[80%]">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">You</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        {message.parts.map((part, idx) => {
                          if (part.type === "text") {
                            return (
                              <div key={idx} className="text-sm">
                                {part.text}
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // For assistant messages, show full-width without box
            return (
              <div key={message.id} className="w-full">
                <div className="flex items-start gap-3 py-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-primary"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {message.parts.map((part, idx) => {
                      if (part.type === "text") {
                        return (
                          <Response
                            key={idx}
                            className="prose prose-sm dark:prose-invert max-w-none"
                          >
                            {part.text}
                          </Response>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Loading State - only show when submitted but no assistant message yet */}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="w-full">
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground pt-0.5">
                    <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                    <span className="text-sm">Searching your library...</span>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Input Section */}
      <div className="sticky bottom-0 pb-4 bg-background">
        <form onSubmit={handleSubmit} className="w-full">
          <Card className="p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder={
                  !usage.allowed
                    ? "Query limit reached. Please upgrade to continue."
                    : "Ask a question about your library..."
                }
                disabled={isLoading || !usage.allowed}
                className="min-h-[60px] resize-none"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || !usage.allowed}
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
