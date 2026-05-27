import { Edit3, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANDING_SECTION_GAP = "flex flex-col gap-16 md:gap-40";

const eyebrowClass =
  "m-0 mb-3.5 text-xs font-medium tracking-widest uppercase text-muted-foreground";

const featureTitleClass =
  "m-0 mb-4 font-sans text-3xl md:text-4xl font-bold leading-none tracking-tighter text-balance text-foreground";

const featureLedeClass =
  "m-0 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground";

const showcaseClass =
  "select-none cursor-default [&_*]:select-none [&_*]:cursor-default";

const SPINE_PALETTE = [
  { bg: "#0c1426", ink: "#e8e1d2" },
  { bg: "#e8e1d2", ink: "#2a2418" },
  { bg: "#c47a8a", ink: "#f7e8df" },
  { bg: "#1e2a44", ink: "#e8e1d2" },
  { bg: "#f4ecd8", ink: "#3a2a14" },
  { bg: "#1a1a1a", ink: "#d5c3a1" },
  { bg: "#274234", ink: "#e8d9b8" },
  { bg: "#a45a3a", ink: "#f4ecd8" },
  { bg: "#5a6577", ink: "#e8e2d0" },
  { bg: "#9eb19c", ink: "#1d2a1a" },
  { bg: "#fef9c3", ink: "#854d0e" },
  { bg: "#c9beac", ink: "#2a2418" },
  { bg: "#7a3b48", ink: "#f7e8df" },
  { bg: "#dcfce7", ink: "#166534" },
  { bg: "#c98c3e", ink: "#1d1407" },
  { bg: "#7a4d18", ink: "#f4ecd8" },
  { bg: "#5e7459", ink: "#e8d9b8" },
  { bg: "#f3f4f6", ink: "#1f2937" },
] as const;

const SHELF_BOOKS = [
  { title: "Zero to One", author: "Peter Thiel" },
  { title: "The Everything Store", author: "Brad Stone" },
  { title: "Rework", author: "David Heinemeier Hansson, Jason Fried" },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky" },
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez" },
  { title: "Pride and Prejudice", author: "Jane Austen" },
  { title: "Meditations", author: "Marcus Aurelius" },
  { title: "Henry J. Kaiser", author: "Mark S. Foster" },
  {
    title: "Astrophysics for People in a Hurry",
    author: "Neil deGrasse Tyson",
  },
  { title: "The Prince", author: "Niccolò Machiavelli" },
  { title: "The Picture of Dorian Gray", author: "Oscar Wilde" },
  { title: "Outlive", author: "Peter Attia" },
  { title: "Shoe Dog", author: "Phil Knight" },
  { title: "Dr. Jekyll and Mr. Hyde", author: "Robert Louis Stevenson" },
  { title: "Sam Walton: Made in America", author: "Sam Walton" },
  { title: "Numbers Don't Lie", author: "Vaclav Smil" },
  { title: "Man's Search for Meaning", author: "Viktor Frankl" },
  { title: "Elon Musk", author: "Walter Isaacson" },
  { title: "Leonardo da Vinci", author: "Walter Isaacson" },
  { title: "Steve Jobs", author: "Walter Isaacson" },
] as const;

function spineAuthor(author: string): string {
  const parts = author.split(",");
  const main = (parts[parts.length - 1] ?? author).trim();
  const nameParts = main.split(/\s+/).filter(Boolean);
  if (nameParts.length === 1) return nameParts[0]!.toUpperCase();
  const last = nameParts[nameParts.length - 1]!;
  return `${nameParts[0]![0]!.toUpperCase()}. ${last.toUpperCase()}`;
}

const SPINE_DATA = SHELF_BOOKS.map((book, index) => {
  const palette = SPINE_PALETTE[index % SPINE_PALETTE.length];
  const titleLength = book.title.length;
  return {
    t: book.title,
    a: spineAuthor(book.author),
    bg: palette.bg,
    ink: palette.ink,
    w: Math.min(52, Math.max(28, Math.round(titleLength * 0.75))),
    h: 240 + (index % 6) * 8,
  };
});

function NotesSourcePreview() {
  return (
    <>
      <span className="text-muted-foreground"># </span>On{" "}
      <span className="font-semibold">Zero to One</span>
      {"\n\n"}
      Thiel&apos;s <span className="font-semibold">0 → 1</span> frame: real
      {"\n"}
      progress is creating something new — not
      {"\n"}
      competing in crowded markets.
      {"\n\n"}
      <span className="text-muted-foreground">&gt; </span>
      &quot;Every moment in business
      {"\n"}
      <span className="text-muted-foreground">&gt; </span>
      happens only once.&quot;
    </>
  );
}

function Positioning() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="m-0 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl [&_em]:font-bold [&_em]:italic">
        Goodreads has the shelf.
        <br />
        Notion has the page.
        <br />
        <em>Albuc has both.</em>
      </h2>
    </div>
  );
}

function LibrarySection() {
  return (
    <div className="overflow-hidden rounded-3xl bg-muted pt-8 pb-0 md:px-10 md:pt-10">
      <div className="mb-9 grid grid-cols-1 items-end gap-10 px-8 md:px-0 md:grid-cols-[1fr_auto]">
        <div>
          <p className={eyebrowClass}>Library</p>
          <h2 className={featureTitleClass}>
            Every book you&apos;ve
            <br />
            ever picked up.
          </h2>
          <p className={featureLedeClass}>
            Add any book from Open Library — covers, authors, year, page count,
            all in. Track what you own, what you&apos;re reading, what
            you&apos;ve finished. Rate it. Keep it.
          </p>
        </div>
        <div className="flex max-w-xs flex-col gap-2 text-sm text-muted-foreground max-md:max-w-none md:text-right">
          <span>
            <strong className="font-semibold text-foreground">
              Powered by{" "}
              <a
                href="https://openlibrary.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-4"
              >
                Open Library
              </a>
            </strong>
          </span>
          <span>
            Millions of titles. One search.
            <br />
            Your shelf, not someone else&apos;s algorithm.
          </span>
        </div>
      </div>
      <div
        className={cn(
          "relative flex items-end gap-0.5 overflow-hidden pt-6",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-foreground/85",
          showcaseClass,
        )}
        role="img"
        aria-label="An illustration of a bookshelf showing the spines of many books."
      >
        {SPINE_DATA.map((s) => (
          <div
            key={s.t}
            className="relative shrink-0 overflow-visible whitespace-nowrap rounded-t-sm font-serif text-[11px] leading-[1.1] tracking-wide shadow-[1px_0_0_rgba(0,0,0,0.05)] [transform:rotate(180deg)] [writing-mode:vertical-rl]"
            style={{
              background: s.bg,
              color: s.ink,
              width: s.w,
              height: s.h,
            }}
          >
            <span className="absolute bottom-4 left-1 text-xs font-semibold">
              {s.t}
            </span>
            <span className="absolute top-3.5 right-1 font-sans text-[9px] font-medium uppercase tracking-wider opacity-70">
              {s.a}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesSection() {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
      <div>
        <p className={eyebrowClass}>Notes</p>
        <h2 className={featureTitleClass}>
          Your words.
          <br />
          Not your highlights.
        </h2>
        <p className={featureLedeClass}>
          Write notes in Markdown. Read them back as serif prose, the way
          you&apos;d want them printed. Albuc keeps what <em>you</em> thought
          about the book — not what someone else underlined.
        </p>
      </div>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card shadow-none",
          showcaseClass,
        )}
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2">
          <span className="inline-flex cursor-default items-center gap-1.5 rounded-sm px-2 py-1 text-xs text-muted-foreground">
            <Edit3 size={12} aria-hidden />
            Edit
          </span>
          <span className="inline-flex cursor-default items-center gap-1.5 rounded-sm bg-muted px-2 py-1 text-xs font-medium text-foreground">
            <Eye size={12} aria-hidden />
            Preview
          </span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">
            Saved · 2 min ago
          </span>
        </div>
        <div className="grid min-h-72 grid-cols-2">
          <div className="whitespace-pre-wrap border-r border-border bg-background p-5 font-mono text-xs leading-relaxed text-foreground">
            <NotesSourcePreview />
          </div>
          <div className="p-5 font-serif text-base leading-snug text-foreground">
            <h4 className="m-0 mb-2 font-serif text-lg font-bold tracking-tight">
              On <em>Zero to One</em>
            </h4>
            <p className="mb-2 text-pretty">
              Thiel&apos;s <strong>0 → 1</strong> frame: real progress is
              creating something new — not competing in crowded markets.
            </p>
            <blockquote className="my-2 border-l-4 border-border pl-4 text-muted-foreground italic">
              &quot;Every moment in business happens only once.&quot;
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

function AskSection() {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      <div className={cn("order-2 lg:order-none", showcaseClass)}>
        <div className="flex flex-col gap-4 rounded-xl bg-muted p-6">
          <div className="max-w-3/4 self-end rounded-xl bg-primary px-4 py-2 text-sm leading-snug text-primary-foreground">
            What did I think about <em>Zero to One</em>?
          </div>
          <div className="flex w-full flex-col gap-3 font-sans">
            <div className="text-base leading-relaxed text-pretty text-foreground">
              You wrote that Thiel&apos;s <strong>0 → 1</strong> frame is the
              through-line — real progress means creating something new, not
              competing in crowded markets
              <span className="relative -top-1 ml-0.5 inline-flex size-5 items-center justify-center rounded-full border border-border bg-card font-sans text-[10px] font-semibold leading-none text-muted-foreground">
                1
              </span>
              . You linked this to <em>The Creative Act</em>: that paying close
              attention is choosing what to make real
              <span className="relative -top-1 ml-0.5 inline-flex size-5 items-center justify-center rounded-full border border-border bg-card font-sans text-[10px] font-semibold leading-none text-muted-foreground">
                2
              </span>
              .
            </div>
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex items-start gap-2 rounded-md border border-border bg-card p-2 text-xs leading-snug text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  1
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    On <em>Zero to One</em>
                  </div>
                  <div className="mt-0.5 italic">
                    &quot;Every moment in business happens only once.&quot;
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-md border border-border bg-card p-2 text-xs leading-snug text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  2
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    On <em>The Creative Act</em>
                  </div>
                  <div className="mt-0.5 italic">
                    &quot;Attention is a form of devotion. Choosing where to put
                    it is choosing what to make real.&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-none">
        <p className={eyebrowClass}>Ask</p>
        <h2 className={featureTitleClass}>
          Talk to your
          <br />
          library.
        </h2>
        <p className={featureLedeClass}>
          Ask anything. The answer comes from <strong>your own notes</strong> —
          not the web, not a summary, not a generic AI guess. Every claim is
          cited back to the page you wrote it on.
        </p>
      </div>
    </div>
  );
}

function BuilderNote() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-0 py-6 pb-2 text-center">
      <blockquote className="m-0 mb-4 font-serif text-xl leading-snug text-pretty text-foreground italic">
        &quot;I wanted one place. A library that felt like mine. Not a social
        feed, not a generic note app. Something where I could later ask{" "}
        <em>&apos;what did I think about X?&apos;</em> and get an answer from my
        notes, not the internet.&quot;
      </blockquote>
      <p className="m-0 mb-6 text-sm tracking-wide text-muted-foreground">
        — Andrés Bolívar
      </p>
      <Button asChild variant="ghost">
        <Link href="/why">Why I built this</Link>
      </Button>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <div className={LANDING_SECTION_GAP}>
      <section>
        <Positioning />
      </section>
      <section>
        <LibrarySection />
      </section>
      <section>
        <NotesSection />
      </section>
      <section>
        <AskSection />
      </section>
      <section>
        <BuilderNote />
      </section>
    </div>
  );
}
