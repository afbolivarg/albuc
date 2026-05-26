import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNav } from "@/components/landing-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Why Albuc",
  description:
    "The story behind Albuc — a personal library and notes app for readers.",
};

export default function WhyPage() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 md:p-6 space-y-12">
      <Card className="bg-muted rounded-xl shadow-none border-none">
        <CardContent className="p-4 md:p-8 space-y-8">
          <LandingNav />

          <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground">
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Why Albuc exists
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              I read a lot. Or at least I try to. And every time I finished a
              book, the same thing happened: the ideas faded. Highlights lived
              in three different apps. Notes were scattered. Goodreads knew what
              I read, but not what I thought about it.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              I wanted one place — a library that felt like mine. Not a social
              feed, not a generic note app. Something where each book had a
              shelf, a status, a rating, and room for my own words. Something
              where I could later ask &ldquo;what did I think about X?&rdquo;
              and get an answer from my notes, not the internet.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Goodreads gives you the catalog. Notion gives you the blank page.
              Neither gives you both, tied to the books you actually read. That
              gap is what Albuc fills.
            </p>

            <h2 className="text-xl font-serif font-semibold pt-2">
              Why it&apos;s free
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              I built this because I needed it. I&apos;m a developer, and this
              is the tool I wished existed. Hosting it costs me a little, but
              not much — and the joy of other readers using something I made is
              worth more than charging for it. No paywall, no premium tier. Just
              sign up and use it.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              The code is open on GitHub if you&apos;re curious how it works.
              But you don&apos;t need to run anything yourself — just come read,
              take notes, and build on what you learn.
            </p>
          </article>

          <div className="pt-4">
            <Button asChild>
              <Link href="/sign-up">Start your library</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <LandingFooter />
    </div>
  );
}
