"use client";

import { SubscribeCta } from "@/components/billing/subscribe-cta";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function TeaserNote({
  preview,
  hasMore,
}: {
  preview: string;
  hasMore: boolean;
}) {
  const t = useT();

  if (!preview.trim()) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-sm text-muted-foreground">
          {t("billing.teaserEmpty")}
        </p>
        <SubscribeCta />
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={cn(
          "prose prose-neutral max-w-none px-6 py-8 font-serif text-lg leading-relaxed",
          hasMore &&
            "[mask-image:linear-gradient(to_bottom,black_40%,transparent_92%)]",
        )}
      >
        <pre className="font-serif text-wrap whitespace-pre-wrap">
          {preview}
        </pre>
      </div>
      {hasMore ? (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-background via-background/90 to-transparent px-6 pt-16 pb-10 text-center">
          <p className="font-serif text-2xl">{t("billing.priceLine")}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("billing.teaserLede")}
          </p>
          <SubscribeCta />
        </div>
      ) : (
        <div className="flex justify-center px-6 pb-10">
          <SubscribeCta />
        </div>
      )}
    </div>
  );
}
