"use client";

import { ChevronLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
    <div className="flex h-full flex-col bg-[#faf9f6]">
      <header className="flex shrink-0 items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Library
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <ChatInterface
          initialUsage={usage}
          onQueryComplete={handleQueryComplete}
        />
      </div>
    </div>
  );
}
