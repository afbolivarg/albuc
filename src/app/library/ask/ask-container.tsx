"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  type AIUsageSnapshot,
  SOFT_MONTHLY_QUERY_LIMIT,
} from "@/lib/ai/usage.shared";
import { useT } from "@/lib/i18n/client";
import { ChatInterface } from "./chat-interface";

type AskUsage = Pick<
  AIUsageSnapshot,
  "queriesUsed" | "queryLimit" | "allowed" | "overSoftCap" | "tokensUsed"
>;

interface AskContainerProps {
  initialUsage: AskUsage;
}

export function AskContainer({ initialUsage }: AskContainerProps) {
  const t = useT();
  const [usage, setUsage] = useState(initialUsage);

  const handleQueryComplete = () => {
    setUsage((prev) => ({
      ...prev,
      queriesUsed: prev.queriesUsed + 1,
      allowed: prev.queriesUsed + 1 < prev.queryLimit,
      overSoftCap:
        prev.overSoftCap || prev.queriesUsed + 1 >= SOFT_MONTHLY_QUERY_LIMIT,
    }));
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        <Link
          className="inline-flex items-center gap-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/library"
        >
          <ChevronLeft className="size-4" />
          {t("nav.library")}
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
