"use client"

import { useState } from "react"
import { ChatInterface } from "./chat-interface"
import { UsageBadge } from "./usage-badge"

interface AskContainerProps {
  initialUsage: {
    queriesUsed: number
    queryLimit: number
    allowed: boolean
  }
}

export function AskContainer({ initialUsage }: AskContainerProps) {
  const [usage, setUsage] = useState(initialUsage)

  const handleQueryComplete = () => {
    // Optimistically increment the counter when a query completes
    setUsage(prev => ({
      ...prev,
      queriesUsed: prev.queriesUsed + 1,
      // If we hit the limit, mark as not allowed
      allowed: prev.queriesUsed + 1 < prev.queryLimit,
    }))
  }

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Ask Your Library
            </h1>
            <p className="text-muted-foreground">
              Ask questions and get answers based only on your personal notes
              and books
            </p>
          </div>

          {/* Usage Badge */}
          <UsageBadge
            queriesUsed={usage.queriesUsed}
            queryLimit={usage.queryLimit}
          />
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface
        initialUsage={usage}
        onQueryComplete={handleQueryComplete}
      />
    </>
  )
}
