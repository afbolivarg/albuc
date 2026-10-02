import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadBrand } from "./brand";
import type { BookMeta, FairUseQuote, Learning, Storyboard } from "./types";

type PackInput = {
  meta: BookMeta;
  learnings: Learning[];
  storyboard: Storyboard;
  quotes: FairUseQuote[];
  changeNotes?: string;
};

export function writePacks(dir: string, input: PackInput) {
  mkdirSync(join(dir, "carousel"), { recursive: true });
  mkdirSync(join(dir, "pinterest"), { recursive: true });
  mkdirSync(join(dir, "short"), { recursive: true });
  mkdirSync(join(dir, "youtube"), { recursive: true });

  writeFileSync(join(dir, "x-thread.md"), xThread(input));
  writeCarousel(join(dir, "carousel"), input);
  writePinterest(join(dir, "pinterest"), input);
  writeShort(join(dir, "short"), input);
  writeYouTube(join(dir, "youtube"), input);
}

function attr(input: PackInput): string {
  return `${input.meta.title} — ${input.meta.author}`;
}

function quoteLine(quote: FairUseQuote | undefined): string {
  if (!quote) return "";
  return `“${quote.text}”\n${quote.attribution}`;
}

function xThread(input: PackInput): string {
  const brand = loadBrand();
  const tweets: string[] = [
    `${input.storyboard.hook}\n\nA thread from ${attr(input)}.`,
    input.storyboard.promise,
    ...input.learnings.slice(0, 6).map(
      (learning, i) => `${i + 1}/ ${learning.claim}.`,
    ),
  ];
  const quote = input.quotes[0];
  if (quote) tweets.push(quoteLine(quote));
  tweets.push(
    `Don't collect highlights. Keep one sentence you can teach.\n\n${brand.tagline}\n${brand.url}`,
  );
  if (input.changeNotes) {
    tweets[0] = `${tweets[0]}\n\n(revision: ${input.changeNotes})`;
  }

  return `# X thread\n\nSource: ${attr(input)}\nFair use: short quotes only, always attributed.\n\n${tweets
    .map((tweet, i) => `## Tweet ${i + 1}\n\n${tweet}`)
    .join("\n\n")}\n`;
}

function writeCarousel(dir: string, input: PackInput) {
  const brand = loadBrand();
  const slides = [
    {
      eyebrow: brand.product.toUpperCase(),
      title: input.storyboard.hook,
      body: attr(input),
    },
    ...input.learnings.slice(0, 5).map((learning, i) => ({
      eyebrow: `IDEA ${i + 1}`,
      title: learning.claim,
      body: learning.whyItMatters,
    })),
    {
      eyebrow: "FROM THE BOOK",
      title: input.quotes[0] ? `“${input.quotes[0].text}”` : input.storyboard.promise,
      body: input.quotes[0]?.attribution ?? attr(input),
    },
    {
      eyebrow: brand.product.toUpperCase(),
      title: brand.tagline,
      body: `Keep the book. ${brand.url}`,
    },
  ];

  const md = [
    `# IG / FB carousel`,
    ``,
    `Ratio: 1:1 (1080×1080). ${slides.length} slides.`,
    `Source: ${attr(input)}`,
    ``,
    ...slides.map(
      (slide, i) =>
        `## Slide ${i + 1}\n\n**${slide.eyebrow}**\n\n### ${slide.title}\n\n${slide.body}`,
    ),
    ``,
  ].join("\n");
  writeFileSync(join(dir, "carousel.md"), md);

  for (const [i, slide] of slides.entries()) {
    writeFileSync(
      join(dir, `slide-${String(i + 1).padStart(2, "0")}.svg`),
      squareSlide(slide, i + 1, slides.length),
    );
  }
}

function writePinterest(dir: string, input: PackInput) {
  const brand = loadBrand();
  const bullets = input.learnings.slice(0, 5).map((learning) => learning.claim);
  writeFileSync(
    join(dir, "infographic.md"),
    `# Pinterest 2:3 infographic

Canvas: 1000×1500 (2:3).
Source: ${attr(input)}

## Headline
${input.storyboard.hook}

## Bullets
${bullets.map((item) => `- ${item}`).join("\n")}

## Footer
${brand.tagline}
${brand.url}
${input.quotes[0] ? `\nQuote (short, attributed):\n${quoteLine(input.quotes[0])}` : ""}
`,
  );
  writeFileSync(join(dir, "infographic.svg"), pinSvg(input, bullets));
}

function writeShort(dir: string, input: PackInput) {
  const brand = loadBrand();
  const lines = [
    { t: 0, d: 3.2, vo: input.storyboard.hook, shot: "Hands closing a finished paperback on a wood table. No face." },
    { t: 3.2, d: 4.4, vo: "You highlighted half the book. You cannot teach one page of it.", shot: "Yellow highlights flashing past, then a blank notebook." },
    { t: 7.6, d: 5.0, vo: input.learnings[0]?.claim ?? "Reading without writing is a leak.", shot: "Pen writing one sentence. Macro ink." },
    { t: 12.6, d: 5.2, vo: input.learnings[1]?.claim ?? "A highlight is a receipt. A note is a thought.", shot: "Phone notes app vs paper — cut to paper winning." },
    { t: 17.8, d: 5.4, vo: input.learnings[2]?.claim ?? "Keep one sentence you can say out loud.", shot: "Walking shelf, finger on one spine." },
    { t: 23.2, d: 5.0, vo: "Ask the shelf later. That is the whole practice.", shot: "Laptop or phone with a short question typed over book notes." },
    { t: 28.2, d: 4.8, vo: `${brand.tagline} Keep the book in ${brand.product}.`, shot: `Albuc library shelf, then ${brand.url} card. Still no talking head.` },
  ];

  const vo = `# Shortform VO script (9:16)

Duration: ~33s. Spoken voiceover + B-roll + captions.
Not a talking-head. Not text cards only.

Source: ${attr(input)}

## Read this

${lines.map((line, i) => `${i + 1}. (${line.t.toFixed(1)}s) ${line.vo}`).join("\n")}

## Delivery
Warm, unhurried, close-mic. One breath per line. No background music under the last line.
`;

  const broll = `# Shortform B-roll shot list

Match each shot to the VO timestamp. Faces optional; voice carries the idea.

${lines
  .map(
    (line, i) =>
      `## Shot ${i + 1}  ${line.t.toFixed(1)}–${(line.t + line.d).toFixed(1)}s
- **VO:** ${line.vo}
- **Picture:** ${line.shot}
- **Frame:** 9:16, paper ${loadBrand().colors.paper}, natural window light
`,
  )
  .join("\n")}
`;

  const vtt = `WEBVTT

${lines
  .map((line, i) => {
    const end = line.t + line.d;
    return `${i + 1}
${fmtVtt(line.t)} --> ${fmtVtt(end)}
${line.vo}
`;
  })
  .join("\n")}
`;

  writeFileSync(join(dir, "vo-script.md"), vo);
  writeFileSync(join(dir, "broll.md"), broll);
  writeFileSync(join(dir, "captions.vtt"), vtt);
  writeFileSync(
    join(dir, "production.json"),
    JSON.stringify(
      {
        aspect: "9:16",
        kind: "vo_broll_captions",
        talkingHead: false,
        textCardsOnly: false,
        source: attr(input),
        beats: lines.map((line, i) => ({
          n: i + 1,
          start: line.t,
          duration: line.d,
          vo: line.vo,
          broll: line.shot,
          caption: line.vo,
        })),
      },
      null,
      2,
    ),
  );
}

function writeYouTube(inputDir: string, input: PackInput) {
  const brand = loadBrand();
  const sections = [
    {
      t: "0:00",
      title: "The leak",
      vo: [
        input.storyboard.hook,
        `This is a reading of ideas from ${attr(input)}. Short quotes only. The rest is commentary.`,
        "Most of a book leaves the week you finish it. Not because you are careless. Because reading is an event and keeping is a practice.",
      ],
      broll: "Stack of finished books. Coffee. Window. Cut to empty notebook.",
    },
    {
      t: "0:45",
      title: "Highlights are not thinking",
      vo: [
        input.learnings[0]?.claim ?? "A highlight is a receipt.",
        input.learnings[1]?.claim ?? "Writing is the cheap way to keep a book.",
        input.quotes[0] ? `The book says: “${input.quotes[0].text}” ${input.quotes[0].attribution}` : "",
      ].filter(Boolean),
      broll: "Over-highlighted page, then a clean page with one sentence.",
    },
    {
      t: "2:00",
      title: "One sentence that survives",
      vo: input.learnings.slice(2, 5).map((item) => item.claim),
      broll: "Handwriting, walking a shelf, a single spine pulled.",
    },
    {
      t: "3:30",
      title: "Ask the shelf",
      vo: [
        ...input.learnings.slice(5).map((item) => item.claim),
        "When you can ask your notes a question next month, the book is still working.",
      ],
      broll: "Typing a question. Notes answering. No stock AI fluff.",
    },
    {
      t: "5:00",
      title: "Keep it",
      vo: [
        input.storyboard.ctaLine,
        `Try it on this book tonight. ${brand.url}`,
      ],
      broll: `${brand.product} library UI, then end card.`,
    },
  ];

  writeFileSync(
    join(inputDir, "vo-script.md"),
    `# YouTube longform VO (16:9)

Spoken voiceover + B-roll. ~6 minutes. Not a webcam lecture.

Source: ${attr(input)}

${sections
  .map(
    (section) => `## ${section.t}  ${section.title}

${section.vo.map((line) => `- ${line}`).join("\n")}
`,
  )
  .join("\n")}
`,
  );
  writeFileSync(
    join(inputDir, "broll.md"),
    `# YouTube B-roll

${sections
  .map(
    (section) => `## ${section.t}  ${section.title}
- ${section.broll}
`,
  )
  .join("\n")}
`,
  );
  writeFileSync(
    join(inputDir, "chapters.md"),
    sections.map((section) => `${section.t} ${section.title}`).join("\n") + "\n",
  );
  writeFileSync(
    join(inputDir, "description.md"),
    `${input.storyboard.promise}

Ideas from ${attr(input)}. Short quotations for commentary; full book remains the author's.

${input.quotes[0] ? `“${input.quotes[0].text}” ${input.quotes[0].attribution}\n` : ""}
Chapters
${sections.map((section) => `${section.t} ${section.title}`).join("\n")}

${brand.tagline}
${brand.url}
`,
  );
}

function fmtVtt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const whole = Math.floor(s);
  const ms = Math.round((s - whole) * 1000)
    .toString()
    .padStart(3, "0");
  return `00:${String(m).padStart(2, "0")}:${String(whole).padStart(2, "0")}.${ms}`;
}

function squareSlide(
  slide: { eyebrow: string; title: string; body: string },
  n: number,
  total: number,
): string {
  const brand = loadBrand();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="${brand.colors.paper}"/>
  <rect x="48" y="48" width="984" height="984" fill="none" stroke="${brand.colors.cream}" stroke-width="2"/>
  <text x="80" y="140" fill="${brand.colors.accent}" font-family="Georgia, serif" font-size="22" letter-spacing="4">${escape(slide.eyebrow)}</text>
  <foreignObject x="80" y="180" width="920" height="680">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;color:${brand.colors.ink};font-size:48px;line-height:1.2">${escape(slide.title)}</div>
  </foreignObject>
  <text x="80" y="960" fill="${brand.colors.muted}" font-family="Georgia, serif" font-size="24">${escape(slide.body)}</text>
  <text x="1000" y="1020" text-anchor="end" fill="${brand.colors.muted}" font-family="Georgia, serif" font-size="20">${n}/${total}</text>
</svg>
`;
}

function pinSvg(input: PackInput, bullets: string[]): string {
  const brand = loadBrand();
  const items = bullets
    .map(
      (bullet, i) =>
        `<text x="80" y="${520 + i * 120}" fill="${brand.colors.ink}" font-family="Georgia, serif" font-size="28">${i + 1}. ${escape(clip(bullet, 70))}</text>`,
    )
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">
  <rect width="1000" height="1500" fill="${brand.colors.paper}"/>
  <rect x="40" y="40" width="920" height="1420" fill="none" stroke="${brand.colors.forest}" stroke-width="3"/>
  <text x="80" y="140" fill="${brand.colors.accent}" font-family="Georgia, serif" font-size="20" letter-spacing="5">${escape(brand.product.toUpperCase())}  ·  2:3</text>
  <foreignObject x="80" y="180" width="840" height="280">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;color:${brand.colors.ink};font-size:44px;line-height:1.15">${escape(input.storyboard.hook)}</div>
  </foreignObject>
  ${items}
  <text x="80" y="1320" fill="${brand.colors.muted}" font-family="Georgia, serif" font-size="22">${escape(attr(input))}</text>
  <text x="80" y="1380" fill="${brand.colors.forest}" font-family="Georgia, serif" font-size="26">${escape(brand.tagline)}</text>
  <text x="80" y="1424" fill="${brand.colors.ink}" font-family="Georgia, serif" font-size="22">${escape(brand.url)}</text>
</svg>
`;
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function clip(text: string, n: number): string {
  return text.length <= n ? text : `${text.slice(0, n - 1)}…`;
}
