import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join } from "node:path";
import { parseEpub } from "./epub";
import { collectQuotes, extractLearnings } from "./extract";
import { assertQuotes } from "./fair-use";
import { writePacks } from "./generate";
import { readGate, setGate } from "./gate";
import { BOOKS_DIR, INBOX_DIR, bookDir, packsDir } from "./paths";
import { writeReview } from "./review";
import { buildStoryboard } from "./storyboard";
import type { Gate, IngestedBook } from "./types";

export function listInboxEpubs(): string[] {
  if (!existsSync(INBOX_DIR)) return [];
  return readdirSync(INBOX_DIR)
    .filter((name) => name.toLowerCase().endsWith(".epub") && !name.startsWith("."))
    .map((name) => join(INBOX_DIR, name));
}

export async function processEpubFile(
  epubPath: string,
  opts: { moveInbox?: boolean; changeNotes?: string } = {},
): Promise<string> {
  const book = parseEpub(readFileSync(epubPath), basename(epubPath));
  const slug = book.meta.slug;
  const root = bookDir(slug);
  mkdirSync(root, { recursive: true });
  mkdirSync(packsDir(slug), { recursive: true });

  const dest = join(root, "source.epub");
  if (opts.moveInbox && epubPath !== dest) {
    try {
      renameSync(epubPath, dest);
    } catch {
      copyFileSync(epubPath, dest);
    }
  } else if (epubPath !== dest) {
    copyFileSync(epubPath, dest);
  }

  return writeGenerated(book, opts.changeNotes ?? readGate(slug)?.notes ?? "");
}

function writeGenerated(book: IngestedBook, changeNotes: string): string {
  const slug = book.meta.slug;
  const root = bookDir(slug);
  const learnings = extractLearnings(book, changeNotes);
  const quotes = collectQuotes(book, learnings, changeNotes);
  assertQuotes(quotes);
  const storyboard = buildStoryboard(
    book.meta.title,
    book.meta.author,
    learnings,
    quotes,
    changeNotes,
  );

  writeFileSync(join(root, "book.json"), `${JSON.stringify(book.meta, null, 2)}\n`);
  writeFileSync(join(root, "learnings.json"), `${JSON.stringify(learnings, null, 2)}\n`);
  writeFileSync(
    join(root, "storyboard.json"),
    `${JSON.stringify(storyboard, null, 2)}\n`,
  );
  writeFileSync(
    join(root, "publish.json"),
    `${JSON.stringify(
      {
        slug,
        title: book.meta.title,
        author: book.meta.author,
        quotes,
        mode: null,
        publishedAt: null,
        gate: "DRAFT",
      },
      null,
      2,
    )}\n`,
  );

  writePacks(packsDir(slug), {
    meta: book.meta,
    learnings,
    storyboard,
    quotes,
    changeNotes,
  });

  const prev = readGate(slug);
  const gate: Gate = setGate(
    slug,
    "DRAFT",
    changeNotes || prev?.notes || "",
  );
  writeReview(root, { meta: book.meta, learnings, storyboard, quotes, gate });
  assertPack(slug);
  return slug;
}

export function assertPack(slug: string) {
  const required = [
    join(bookDir(slug), "REVIEW.md"),
    join(bookDir(slug), "gate.json"),
    join(packsDir(slug), "x-thread.md"),
    join(packsDir(slug), "carousel", "carousel.md"),
    join(packsDir(slug), "pinterest", "infographic.svg"),
    join(packsDir(slug), "short", "vo-script.md"),
    join(packsDir(slug), "short", "broll.md"),
    join(packsDir(slug), "short", "captions.vtt"),
    join(packsDir(slug), "youtube", "vo-script.md"),
    join(packsDir(slug), "youtube", "broll.md"),
  ];
  const missing = required.filter((path) => !existsSync(path));
  if (missing.length) {
    throw new Error(`Pack incomplete for ${slug}:\n${missing.join("\n")}`);
  }
}

export async function processInbox(): Promise<string[]> {
  mkdirSync(INBOX_DIR, { recursive: true });
  mkdirSync(BOOKS_DIR, { recursive: true });
  const slugs: string[] = [];
  for (const file of listInboxEpubs()) {
    slugs.push(await processEpubFile(file, { moveInbox: true }));
  }
  return slugs;
}

export function isEpub(path: string) {
  return extname(path).toLowerCase() === ".epub";
}
