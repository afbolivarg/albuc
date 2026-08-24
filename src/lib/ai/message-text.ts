export function joinTextParts(
  parts: Array<{ type: string; text?: string }>,
  separator = "",
): string {
  let text = "";
  for (const part of parts) {
    if (part.type !== "text" || !part.text) continue;
    text = text ? text + separator + part.text : part.text;
  }
  return text;
}
