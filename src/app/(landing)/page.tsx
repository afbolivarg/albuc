import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingFeatures } from "./landing-features";

export default async function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-40 pb-12 md:pb-20">
      <Card className="bg-muted rounded-xl shadow-none overflow-hidden p-0 border-none">
        <CardContent
          className="p-4 md:p-6 bg-cover bg-center bg-no-repeat relative min-h-[600px] md:min-h-[700px]"
          style={{ backgroundImage: "url('/hero-bg.webp')" }}
        >
          <div className="text-center pt-8 md:pt-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-none tracking-tight font-serif">
              Don&apos;t just read.
              <br />
              Build ideas.
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-tight">
              Track your reading. Capture your thinking. Albuc blends
              Goodreads&apos; structure with Notion&apos;s writing flow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild>
                <Link href="/sign-in">Get started — it&apos;s free</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="hover:bg-foreground/10 hover:text-foreground"
              >
                <Link href="/why">Why I built this</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LandingFeatures />

      <Card className="bg-muted rounded-3xl border-none shadow-none">
        <CardContent className="p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif tracking-tight">
            From book to brain. Effortlessly.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Turn your reading into a personal knowledge base. Start free, stay
            free.
          </p>
          <Button asChild>
            <Link href="/sign-in">Get started — it&apos;s free</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
