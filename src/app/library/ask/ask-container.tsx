"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SubscribeCta } from "@/components/billing/subscribe-cta";
import { useT } from "@/lib/i18n/client";
import { ChatInterface } from "./chat-interface";

export function AskContainer({ canAsk }: { canAsk: boolean }) {
  const t = useT();

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
        {canAsk ? (
          <ChatInterface />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-sm font-serif text-xl">
              {t("billing.priceLine")}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("billing.askLocked")}
            </p>
            <SubscribeCta />
          </div>
        )}
      </div>
    </div>
  );
}
