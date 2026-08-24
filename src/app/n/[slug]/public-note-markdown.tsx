"use client";

import { Streamdown } from "streamdown";

function asH2({
  node: _node,
  ...props
}: React.ComponentProps<"h2"> & { node?: unknown }) {
  return <h2 {...props} />;
}

function asH3({
  node: _node,
  ...props
}: React.ComponentProps<"h3"> & { node?: unknown }) {
  return <h3 {...props} />;
}

const heading = {
  h1: asH2,
  h2: asH2,
  h3: asH2,
  h4: asH3,
  h5: asH3,
  h6: asH3,
};

export function PublicNoteMarkdown({ markdown }: { markdown: string }) {
  return (
    <Streamdown
      className="prose prose-neutral max-w-none font-serif [&_ul]:my-4 [&_ul]:list-outside [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-outside [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_ul_ul]:mt-1 [&_ol_ol]:mt-1"
      components={heading}
    >
      {markdown}
    </Streamdown>
  );
}
