"use client";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";

const plugins = { cjk, code, mermaid };

export function PublicNoteMarkdown({ markdown }: { markdown: string }) {
  return (
    <Streamdown
      className="prose prose-neutral max-w-none font-serif [&_ul]:my-4 [&_ul]:list-outside [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-outside [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_ul_ul]:mt-1 [&_ol_ol]:mt-1"
      plugins={plugins}
    >
      {markdown}
    </Streamdown>
  );
}
