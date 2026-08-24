import { Edit3, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/en";
import { translate } from "@/lib/i18n/translate";
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

type Copy = (key: MessageKey, vars?: Record<string, string | number>) => string;

function Positioning({ t }: { t: Copy }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="m-0 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl [&_em]:font-bold [&_em]:italic">
        {t("features.positioning1")}
        <br />
        {t("features.positioning2")}
        <br />
        <em>{t("features.positioning3")}</em>
      </h2>
    </div>
  );
}

function LibrarySection({ t }: { t: Copy }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-muted pt-8 pb-0 md:px-10 md:pt-10">
      <div className="mb-9 grid grid-cols-1 items-end gap-10 px-8 md:px-0 md:grid-cols-[1fr_auto]">
        <div>
          <p className={eyebrowClass}>{t("features.libraryEyebrow")}</p>
          <h2 className={featureTitleClass}>{t("features.libraryTitle")}</h2>
          <p className={featureLedeClass}>{t("features.libraryLede")}</p>
        </div>
        <div className="flex max-w-xs flex-col gap-2 text-sm text-muted-foreground max-md:max-w-none md:text-right">
          <span>
            <strong className="font-semibold text-foreground">
              {t("features.poweredBy")}{" "}
              <a
                href="https://openlibrary.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Open Library
              </a>
            </strong>
          </span>
          <span>
            {t("features.openLibraryLede1")}
            <br />
            {t("features.openLibraryLede2")}
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
        aria-label={t("features.shelfAria")}
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

function NotesSection({ t }: { t: Copy }) {
  const demoBook = "Zero to One";
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
      <div>
        <p className={eyebrowClass}>{t("features.notesEyebrow")}</p>
        <h2 className={featureTitleClass}>{t("features.notesTitle")}</h2>
        <p className={featureLedeClass}>{t("features.notesLede")}</p>
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
            {t("features.edit")}
          </span>
          <span className="inline-flex cursor-default items-center gap-1.5 rounded-sm bg-muted px-2 py-1 text-xs font-medium text-foreground">
            <Eye size={12} aria-hidden />
            {t("features.preview")}
          </span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {t("features.savedAgo")}
          </span>
        </div>
        <div className="grid min-h-72 grid-cols-2">
          <div className="whitespace-pre-wrap border-r border-border bg-background p-5 font-mono text-xs leading-relaxed text-foreground">
            {t("features.notesDemoSource", { book: demoBook })}
          </div>
          <div className="p-5 font-serif text-base leading-snug text-foreground">
            <h4 className="m-0 mb-2 font-serif text-lg font-bold tracking-tight">
              {t("features.notesDemoOn", { book: demoBook })}
            </h4>
            <p className="mb-2 text-pretty">{t("features.notesDemoBody")}</p>
            <blockquote className="my-2 border-l-4 border-border pl-4 text-muted-foreground italic">
              &quot;{t("features.notesDemoQuote")}&quot;
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

function AskSection({ t }: { t: Copy }) {
  const demoBook = "Zero to One";
  const demoBook2 = "The Creative Act";
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      <div className={cn("order-2 lg:order-none", showcaseClass)}>
        <div className="flex flex-col gap-4 rounded-xl bg-muted p-6">
          <div className="max-w-3/4 self-end rounded-xl bg-primary px-4 py-2 text-sm leading-snug text-primary-foreground">
            {t("features.askDemoQuestion", { book: demoBook })}
          </div>
          <div className="flex w-full flex-col gap-3 font-sans">
            <div className="text-pretty text-base leading-relaxed text-foreground">
              {t("features.askDemoAnswer", { book2: demoBook2 })}
            </div>
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex items-start gap-2 rounded-md border border-border bg-card p-2 text-xs leading-snug text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  1
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {t("features.notesDemoOn", { book: demoBook })}
                  </div>
                  <div className="mt-0.5 italic">
                    &quot;{t("features.notesDemoQuote")}&quot;
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-md border border-border bg-card p-2 text-xs leading-snug text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  2
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {t("features.notesDemoOn", { book: demoBook2 })}
                  </div>
                  <div className="mt-0.5 italic">
                    &quot;{t("features.askDemoCite2Quote")}&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-none">
        <p className={eyebrowClass}>{t("features.askEyebrow")}</p>
        <h2 className={featureTitleClass}>{t("features.askTitle")}</h2>
        <p className={featureLedeClass}>{t("features.askLede")}</p>
      </div>
    </div>
  );
}

function BuilderNote({ t }: { t: Copy }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-0 py-6 pb-2 text-center">
      <blockquote className="m-0 mb-4 font-serif text-xl leading-snug text-pretty text-foreground italic">
        &quot;{t("features.builderQuote1")}{" "}
        <em>&apos;{t("features.builderQuoteAsk")}&apos;</em>{" "}
        {t("features.builderQuote2")}&quot;
      </blockquote>
      <p className="m-0 mb-6 text-sm tracking-wide text-muted-foreground">
        — Andrés Bolívar
      </p>
      <Button asChild variant="ghost">
        <Link href="/why">{t("home.whyBuilt")}</Link>
      </Button>
    </div>
  );
}

export function LandingFeatures({ locale }: { locale: Locale }) {
  const t: Copy = (key, vars) => translate(locale, key, vars);
  return (
    <div className={LANDING_SECTION_GAP}>
      <section>
        <Positioning t={t} />
      </section>
      <section>
        <LibrarySection t={t} />
      </section>
      <section>
        <NotesSection t={t} />
      </section>
      <section>
        <AskSection t={t} />
      </section>
      <section>
        <BuilderNote t={t} />
      </section>
    </div>
  );
}
