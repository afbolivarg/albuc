export type GateStatus = "DRAFT" | "CHANGES_REQUESTED" | "APPROVED";

export type BookMeta = {
  slug: string;
  title: string;
  author: string;
  language: string;
  sourceFile: string;
  chapterCount: number;
  wordCount: number;
};

export type Chapter = {
  id: string;
  title: string;
  href: string;
  text: string;
};

export type IngestedBook = {
  meta: BookMeta;
  chapters: Chapter[];
  fullText: string;
};

export type FairUseQuote = {
  text: string;
  wordCount: number;
  attribution: string;
  location: string;
  purpose: string;
};

export type Learning = {
  id: string;
  claim: string;
  whyItMatters: string;
  chapter: string;
  quote: FairUseQuote | null;
};

export type StoryboardAct = {
  name: string;
  beats: string[];
};

export type Storyboard = {
  hook: string;
  promise: string;
  acts: StoryboardAct[];
  ctaLine: string;
  ctaUrl: string;
  quotes: FairUseQuote[];
};

export type Gate = {
  status: GateStatus;
  notes: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type PublishReceipt = {
  slug: string;
  title: string;
  author: string;
  mode: "dry-run";
  gate: GateStatus;
  publishedAt: string | null;
  platforms: string[];
  fairUse: { quotes: FairUseQuote[] };
  outDir: string;
};

export type PublishJob = {
  slug: string;
  title: string;
  author: string;
  bookDir: string;
  packsDir: string;
  outDir: string;
  quotes: FairUseQuote[];
};

export type PublishResult = {
  publisher: string;
  ok: boolean;
  written: string[];
  message: string;
};

export interface Publisher {
  readonly name: string;
  publish(job: PublishJob): Promise<PublishResult>;
}
