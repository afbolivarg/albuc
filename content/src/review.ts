import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { BookMeta, FairUseQuote, Gate, Learning, Storyboard } from "./types";

export function writeReview(bookRoot: string, input: {
  meta: BookMeta;
  learnings: Learning[];
  storyboard: Storyboard;
  quotes: FairUseQuote[];
  gate: Gate;
}) {
  const { meta, learnings, storyboard, quotes, gate } = input;
  const body = `# Review pack — ${meta.title}

**Author:** ${meta.author}  
**Slug:** \`${meta.slug}\`  
**Gate:** **${gate.status}**${gate.notes ? ` — ${gate.notes}` : ""}

This is the only file Andrés needs to read. Approve or request changes. Nothing publishes until the gate is APPROVED.

## How to decide

\`\`\`bash
bun run content:approve ${meta.slug}
bun run content:changes ${meta.slug} "what to fix"
\`\`\`

## Hook

${storyboard.hook}

${storyboard.promise}

## Learnings

${learnings.map((item) => `- **${item.id}** (${item.chapter}) — ${item.claim}`).join("\n")}

## Fair-use quotes (short, attributed)

${quotes.map((quote) => `- “${quote.text}” ${quote.attribution} · ${quote.location} · ${quote.wordCount} words`).join("\n") || "_None extracted._"}

## Packs

| Platform | Path |
| --- | --- |
| X thread | \`packs/x-thread.md\` |
| IG/FB carousel | \`packs/carousel/carousel.md\` + \`slide-*.svg\` |
| Pinterest 2:3 | \`packs/pinterest/infographic.svg\` |
| 9:16 short (VO + B-roll + captions) | \`packs/short/vo-script.md\`, \`broll.md\`, \`captions.vtt\` |
| 16:9 YouTube (VO + B-roll) | \`packs/youtube/vo-script.md\`, \`broll.md\` |

Shorts are a spoken voiceover with picture B-roll and a \`.vtt\` caption file — not talking-head text cards.

## After approve

Dry-run publish writes files under \`out/\` and never calls a social API. Live publishers are stubs behind the same \`Publisher\` interface.
`;
  writeFileSync(join(bookRoot, "REVIEW.md"), body);
}
