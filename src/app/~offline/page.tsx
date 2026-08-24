import type { Metadata } from "next";
import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await t("offline.title"),
    description: await t("offline.body"),
  };
}

export default async function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="mx-auto max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <AlbucLogo
            showText={false}
            iconClassName="w-24 h-24 md:w-32 md:h-32"
          />
        </div>

        <div className="space-y-4">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {await t("offline.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {await t("offline.body")}
          </p>
        </div>

        <Button asChild size="lg" className="mt-8">
          <Link href="/">{await t("offline.retry")}</Link>
        </Button>
      </main>
    </div>
  );
}
