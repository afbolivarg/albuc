import { copyFileSync, existsSync, mkdirSync, statSync, watch } from "node:fs";
import { basename, resolve } from "node:path";
import { writeFixture } from "./fixture";
import { assertApproved, readGate, setGate } from "./gate";
import { BOOKS_DIR, FIXTURES_DIR, INBOX_DIR, bookDir } from "./paths";
import { processEpubFile, processInbox } from "./pipeline";
import { publishDryRun } from "./publish";

const usage = `Albuc organic GTM

Andrés only needs two inputs:
  1. Drop an .epub in content/inbox/
  2. Approve (or request changes)

Commands
  bun run content:run                 Process every EPUB in the inbox
  bun run content:run -- --fixture    Build the demo EPUB, drop it, process
  bun run content:watch               Watch the inbox
  bun run content:approve <slug>      Unlock dry-run publish
  bun run content:changes <slug> "notes"
  bun run content:publish <slug>      Dry-run; blocked unless APPROVED
  bun run content:status [slug]
`;

async function main() {
  const [cmd = "help", ...rest] = process.argv.slice(2);
  mkdirSync(INBOX_DIR, { recursive: true });
  mkdirSync(BOOKS_DIR, { recursive: true });

  switch (cmd) {
    case "run": {
      if (rest.includes("--fixture") || rest[0] === "fixture") {
        const fixture = writeFixture();
        const dest = resolve(INBOX_DIR, basename(fixture));
        copyFileSync(fixture, dest);
        console.log(`Dropped fixture → ${dest}`);
      }
      const explicit = rest.find((arg) => arg.endsWith(".epub"));
      const slugs = explicit
        ? [await processEpubFile(resolve(explicit))]
        : await processInbox();
      if (slugs.length === 0) {
        console.log(`Inbox empty: ${INBOX_DIR}\nDrop an .epub, or: bun run content:run -- --fixture`);
        return;
      }
      for (const slug of slugs) {
        console.log(`Review pack: ${bookDir(slug)}/REVIEW.md`);
        console.log(`Approve:     bun run content:approve ${slug}`);
      }
      return;
    }
    case "watch": {
      console.log(`Watching ${INBOX_DIR} — drop an .epub`);
      const pending = new Map<string, ReturnType<typeof setTimeout>>();
      const kick = (name: string) => {
        if (!name.toLowerCase().endsWith(".epub") || name.startsWith(".")) return;
        const prev = pending.get(name);
        if (prev) clearTimeout(prev);
        pending.set(
          name,
          setTimeout(async () => {
            const path = resolve(INBOX_DIR, name);
            if (!existsSync(path)) return;
            const size = statSync(path).size;
            await sleep(400);
            if (!existsSync(path) || statSync(path).size !== size) return;
            try {
              const slug = await processEpubFile(path, { moveInbox: true });
              console.log(`Ready: ${bookDir(slug)}/REVIEW.md`);
              console.log(`Approve: bun run content:approve ${slug}`);
            } catch (error) {
              console.error(error instanceof Error ? error.message : error);
            }
          }, 600),
        );
      };
      for (const slug of await processInbox()) {
        console.log(`Ready: ${bookDir(slug)}/REVIEW.md`);
      }
      watch(INBOX_DIR, (_event, name) => {
        if (name) kick(name);
      });
      await new Promise(() => {});
      return;
    }
    case "approve": {
      const slug = needSlug(rest[0]);
      setGate(slug, "APPROVED");
      const result = await publishDryRun(slug);
      console.log(`Approved ${slug}`);
      console.log(result.message);
      return;
    }
    case "changes": {
      const slug = needSlug(rest[0]);
      const notes = rest.slice(1).join(" ").trim() || "Please revise.";
      setGate(slug, "CHANGES_REQUESTED", notes);
      const source = resolve(bookDir(slug), "source.epub");
      if (!existsSync(source)) {
        throw new Error(`No source.epub for ${slug}`);
      }
      await processEpubFile(source, { changeNotes: notes });
      setGate(slug, "DRAFT", notes);
      console.log(`Regenerated ${slug} as DRAFT with your notes.`);
      console.log(`Review: ${bookDir(slug)}/REVIEW.md`);
      return;
    }
    case "publish": {
      const slug = needSlug(rest[0]);
      assertApproved(slug);
      const result = await publishDryRun(slug);
      console.log(result.message);
      return;
    }
    case "status": {
      if (rest[0]) {
        printStatus(rest[0]);
        return;
      }
      const { readdirSync } = await import("node:fs");
      const slugs = existsSync(BOOKS_DIR)
        ? readdirSync(BOOKS_DIR).filter((name) => !name.startsWith("."))
        : [];
      if (slugs.length === 0) {
        console.log("No books yet. Drop an EPUB in content/inbox/");
        return;
      }
      for (const slug of slugs) printStatus(slug);
      return;
    }
    case "fixture": {
      const path = writeFixture();
      console.log(`Fixture EPUB: ${path}`);
      console.log(`Also at: ${FIXTURES_DIR}`);
      return;
    }
    default:
      console.log(usage);
  }
}

function needSlug(slug: string | undefined): string {
  if (!slug) {
    throw new Error("Pass a book slug, e.g. bun run content:approve the-commonplace-book");
  }
  if (!existsSync(bookDir(slug))) {
    throw new Error(`Unknown slug ${slug}. Look in content/books/`);
  }
  return slug;
}

function printStatus(slug: string) {
  const gate = readGate(slug);
  console.log(`${slug}: ${gate?.status ?? "no gate"}`);
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
