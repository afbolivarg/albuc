"use client"

import { useState } from "react"
import { ChatInterface } from "./chat-interface"

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
    <div className="h-full">
      <ChatInterface
        initialUsage={usage}
        onQueryComplete={handleQueryComplete}
      />
    </div>
  )
}
