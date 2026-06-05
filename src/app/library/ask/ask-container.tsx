"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ChatInterface = dynamic(
  () => import("./chat-interface").then((m) => ({ default: m.ChatInterface })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p className="font-serif text-2xl font-medium text-muted-foreground">
          Loading chat…
        </p>
      </div>
    ),
  },
);

interface AskContainerProps {
  initialUsage: {
    queriesUsed: number;
    queryLimit: number;
    allowed: boolean;
  };
}

export function AskContainer({ initialUsage }: AskContainerProps) {
  const [usage, setUsage] = useState(initialUsage);

  const handleQueryComplete = () => {
    setUsage((prev) => ({
      ...prev,
      queriesUsed: prev.queriesUsed + 1,
      allowed: prev.queriesUsed + 1 < prev.queryLimit,
    }));
  };

  return (
    <div className="h-full">
      <ChatInterface
        initialUsage={usage}
        onQueryComplete={handleQueryComplete}
      />
    </div>
  );
}
