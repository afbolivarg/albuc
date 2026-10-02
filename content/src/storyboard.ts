import { ctaLine, loadBrand } from "./brand";
import type { FairUseQuote, Learning, Storyboard } from "./types";

export function buildStoryboard(
  title: string,
  author: string,
  learnings: Learning[],
  quotes: FairUseQuote[],
  changeNotes = "",
): Storyboard {
  const brand = loadBrand();
  const punchier = /punch|sharper|hook/i.test(changeNotes);
  const first = learnings[0]?.claim ?? `Most of ${title} disappears the week you finish it`;
  const hook = punchier
    ? `You finished the book. You cannot teach one page of it.`
    : `You don't have a reading problem. You have a keeping problem.`;

  return {
    hook,
    promise: `Five keepable ideas from ${title} by ${author} — then a practice you can do tonight.`,
    acts: [
      {
        name: "The leak",
        beats: [
          hook,
          first,
          learnings[1]?.claim ?? "Highlights feel like thinking. They usually aren't.",
        ],
      },
      {
        name: "The practice",
        beats: learnings.slice(2, 5).map((item) => item.claim),
      },
      {
        name: "The shelf",
        beats: [
          ...learnings.slice(5, 7).map((item) => item.claim),
          ctaLine(brand),
        ],
      },
    ],
    ctaLine: `Keep the book in ${brand.product}. ${brand.tagline}`,
    ctaUrl: brand.url,
    quotes,
  };
}
