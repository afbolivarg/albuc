"use client";

import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

export default function ErrorPage() {
  const t = useT();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md mx-auto">
        <div className="flex justify-center">
          <AlbucLogo
            showText={false}
            iconClassName="w-24 h-24 md:w-32 md:h-32"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-serif">
            {t("error.oops")}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            {t("error.title")}
          </h2>
          <p className="text-muted-foreground text-lg">{t("error.body")}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">{t("notFound.home")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
