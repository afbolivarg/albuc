export function charsPerLine(fontSize: number, maxWidth: number) {
  return Math.max(8, Math.floor(maxWidth / (fontSize * 0.46)));
}

export function clampOgLines(
  text: string,
  maxCharsPerLine: number,
  maxLines = 2,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current) lines.push(current);
    current = "";
  };

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (!word) continue;
    const next = current ? `${current} ${word}` : word;
    const isLastSlot = lines.length >= maxLines - 1;
    const remaining = words.slice(index + 1);

    if (isLastSlot) {
      const rest = [next, ...remaining].join(" ");
      lines.push(truncateLine(rest, maxCharsPerLine, remaining.length > 0));
      return lines;
    }

    if (next.length <= maxCharsPerLine || !current) {
      current = next;
      continue;
    }

    pushCurrent();
    current = word;
  }

  pushCurrent();
  return lines.slice(0, maxLines);
}

function truncateLine(text: string, maxChars: number, forceEllipsis: boolean) {
  if (!forceEllipsis && text.length <= maxChars) return text;
  const ellipsis = "…";
  const budget = maxChars - ellipsis.length;
  if (budget <= 0) return ellipsis;

  if (text.length <= maxChars && !forceEllipsis) return text;

  let clipped = text.slice(0, Math.max(1, budget));
  if (clipped.includes(" ")) {
    clipped = clipped.replace(/\s+\S*$/, "").trimEnd();
  }
  if (!clipped) clipped = text.slice(0, budget).trimEnd();
  return `${clipped}${ellipsis}`;
}

export function clampOgLine(text: string, maxChars: number) {
  return truncateLine(text, maxChars, text.length > maxChars);
}
