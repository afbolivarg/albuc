import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "You're offline",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
            You&apos;re offline
          </h1>
          <p className="text-muted-foreground text-lg">
            Albuc needs a connection for this page. Check your network and try
            again.
          </p>
        </div>

        <Button asChild size="lg" className="mt-8">
          <Link href="/">Try again</Link>
        </Button>
      </div>
    </div>
  );
}
