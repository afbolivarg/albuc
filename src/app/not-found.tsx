import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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
          <h1 className="text-6xl md:text-8xl font-bold text-primary font-serif">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <Button asChild size="lg" className="mt-8">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
