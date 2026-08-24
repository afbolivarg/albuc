import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/server";

export default async function NotFound() {
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
          <h1 className="font-serif text-6xl font-bold text-primary md:text-8xl">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
            {await t("notFound.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {await t("notFound.body")}
          </p>
        </div>

        <Button asChild size="lg" className="mt-8">
          <Link href="/">{await t("notFound.home")}</Link>
        </Button>
      </main>
    </div>
  );
}
