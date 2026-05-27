import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why Albuc",
  description:
    "The story behind Albuc — a personal library and notes app for readers.",
};

export default function WhyPage() {
  return (
    <article className="mx-auto max-w-prose space-y-6 pb-12 md:pb-20 text-foreground">
      <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-center mb-8 md:mb-12">
        Why Albuc exists
      </h1>

      <p className="text-muted-foreground leading-relaxed">
        I read a lot. Or at least I try to. And every time I finished a book,
        the same thing happened: the ideas faded. Highlights lived in three
        different apps. Notes were scattered between the actual pages of the
        book, my notebooks, Notion, and Apple Notes. Goodreads knew what I read,
        but not what I thought about it.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        I wanted one place — a library that felt like mine. Not a social feed,
        not a generic note app. Something where each book had a shelf, a status,
        a rating, and room for my own words. Something where I could later ask
        &ldquo;what did I think about X?&rdquo; and get an answer from my notes,
        not the internet.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        Goodreads gives you the catalog. Notion gives you the blank page.
        Neither gives you both, tied to the books you actually read. That gap is
        what Albuc fills.
      </p>

      <h2 className="text-lg font-semibold">Why it&apos;s free</h2>

      <p className="text-muted-foreground leading-relaxed">
        I built this because I needed it. I&apos;m a developer, and this is the
        tool I wished existed. Hosting it costs me a little, but not much — and
        the joy of other readers using something I made is worth more than
        charging for it. No paywall, no premium tier. Just sign up and use it.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        The code is open on{" "}
        <a
          href="https://github.com/afbolivarg/albuc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          GitHub
        </a>{" "}
        if you&apos;re curious how it works. But you don&apos;t need to run
        anything yourself — just come read, take notes, and build on what you
        learn.
      </p>

      <p className="text-muted-foreground leading-relaxed">— Andrés Bolívar</p>

      <Button asChild>
        <Link href="/sign-in">Start your library</Link>
      </Button>
    </article>
  );
}
