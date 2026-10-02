import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { assertApproved } from "./gate";
import { bookDir, outDir, packsDir } from "./paths";
import type {
  BookMeta,
  FairUseQuote,
  PublishJob,
  PublishReceipt,
  PublishResult,
  Publisher,
} from "./types";

const PLATFORMS = ["x", "instagram", "pinterest", "short", "youtube"] as const;

export class DryRunPublisher implements Publisher {
  readonly name = "dry-run";

  async publish(job: PublishJob): Promise<PublishResult> {
    rmSync(job.outDir, { recursive: true, force: true });
    mkdirSync(job.outDir, { recursive: true });

    const written: string[] = [];
    const copy = (from: string, to: string) => {
      if (!existsSync(from)) return;
      mkdirSync(join(to, ".."), { recursive: true });
      cpSync(from, to, { recursive: true });
      written.push(to);
    };

    copy(join(job.packsDir, "x-thread.md"), join(job.outDir, "x", "thread.md"));
    copy(join(job.packsDir, "carousel"), join(job.outDir, "instagram"));
    copy(join(job.packsDir, "pinterest"), join(job.outDir, "pinterest"));
    copy(join(job.packsDir, "short"), join(job.outDir, "short"));
    copy(join(job.packsDir, "youtube"), join(job.outDir, "youtube"));

    const receipt: PublishReceipt = {
      slug: job.slug,
      title: job.title,
      author: job.author,
      mode: "dry-run",
      gate: "APPROVED",
      publishedAt: new Date().toISOString(),
      platforms: [...PLATFORMS],
      fairUse: { quotes: job.quotes },
      outDir: job.outDir,
    };
    const receiptPath = join(job.outDir, "publish-receipt.json");
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    written.push(receiptPath);

    return {
      publisher: this.name,
      ok: true,
      written,
      message: `Dry-run wrote ${written.length} paths under ${job.outDir}`,
    };
  }
}

/** Live social APIs are not wired. Same interface; refuse clearly. */
export class StubLivePublisher implements Publisher {
  constructor(readonly name: string) {}

  async publish(): Promise<PublishResult> {
    return {
      publisher: this.name,
      ok: false,
      written: [],
      message: `${this.name} API is not wired. Use dry-run (default).`,
    };
  }
}

export const livePublishers: Publisher[] = [
  new StubLivePublisher("x"),
  new StubLivePublisher("instagram"),
  new StubLivePublisher("pinterest"),
  new StubLivePublisher("tiktok"),
  new StubLivePublisher("youtube"),
];

export function loadJob(slug: string): PublishJob {
  const root = bookDir(slug);
  const meta = JSON.parse(
    readFileSync(join(root, "book.json"), "utf8"),
  ) as BookMeta;
  const quotes = JSON.parse(
    readFileSync(join(root, "publish.json"), "utf8"),
  ) as { quotes: FairUseQuote[] };
  return {
    slug,
    title: meta.title,
    author: meta.author,
    bookDir: root,
    packsDir: packsDir(slug),
    outDir: outDir(slug),
    quotes: quotes.quotes ?? [],
  };
}

export async function publishDryRun(slug: string): Promise<PublishResult> {
  assertApproved(slug);
  const job = loadJob(slug);
  const result = await new DryRunPublisher().publish(job);
  const receiptPath = join(job.bookDir, "publish.json");
  const prev = existsSync(receiptPath)
    ? (JSON.parse(readFileSync(receiptPath, "utf8")) as Record<string, unknown>)
    : {};
  writeFileSync(
    receiptPath,
    `${JSON.stringify(
      {
        ...prev,
        mode: "dry-run",
        gate: "APPROVED",
        publishedAt: new Date().toISOString(),
        outDir: job.outDir,
      },
      null,
      2,
    )}\n`,
  );
  return result;
}
