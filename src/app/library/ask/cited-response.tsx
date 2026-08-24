"use client";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import { Streamdown } from "streamdown";
import { type AskSource, uniqueSourcesByBook } from "@/lib/ai/citations";
import { cn } from "@/lib/utils";
import { CitationChip, SourceBooks } from "./citation-chip";

const plugins = { cjk, code, mermaid };

function MermaidFallback({ chart }: { chart: string; error: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
      {chart}
    </pre>
  );
}

function replaceCiteText(
  text: string,
  sources: Map<number, AskSource>,
  keyPrefix: string,
): ReactNode {
  const cleaned = text.replace(/\[blocked\]/gi, "");
  const parts = cleaned.split(/(\[\d+\])/g);
  if (parts.length === 1) return cleaned;

  const seen = new Map<number, number>();
  return parts.map((part) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (!match) return part;
    const n = Number(match[1]);
    const occurrence = (seen.get(n) ?? 0) + 1;
    seen.set(n, occurrence);
    return (
      <CitationChip
        key={`${keyPrefix}-cite-${n}-${occurrence}`}
        n={n}
        source={sources.get(n)}
      />
    );
  });
}

function withCitationChips(
  children: ReactNode,
  sources: Map<number, AskSource>,
): ReactNode {
  return Children.map(children, (child, index) => {
    if (typeof child === "string" || typeof child === "number") {
      return replaceCiteText(String(child), sources, String(index));
    }

    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.props.children != null
    ) {
      return cloneElement(child, {
        children: withCitationChips(child.props.children, sources),
      });
    }

    return child;
  });
}

function citedElement(Tag: keyof HTMLElementTagNameMap) {
  return function CitedElement({
    children,
    sources,
    ...props
  }: {
    children?: ReactNode;
    sources: Map<number, AskSource>;
  } & Record<string, unknown>) {
    const Component = Tag;
    return (
      <Component {...props}>{withCitationChips(children, sources)}</Component>
    );
  };
}

function citationComponents(sources: AskSource[]) {
  const byNumber = new Map(sources.map((source) => [source.n, source]));
  const wrap = (Tag: keyof HTMLElementTagNameMap) => {
    const El = citedElement(Tag);
    return (props: { children?: ReactNode } & Record<string, unknown>) => (
      <El {...props} sources={byNumber} />
    );
  };

  return {
    p: wrap("p"),
    li: wrap("li"),
    td: wrap("td"),
    th: wrap("th"),
    h1: wrap("h1"),
    h2: wrap("h2"),
    h3: wrap("h3"),
    blockquote: wrap("blockquote"),
    strong: wrap("strong"),
    em: wrap("em"),
    a: ({
      href,
      children,
      ...props
    }: {
      href?: string;
      children?: ReactNode;
    } & Record<string, unknown>) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="underline decoration-foreground/25 underline-offset-2 hover:decoration-foreground/60"
        {...props}
      >
        {withCitationChips(children, byNumber)}
      </a>
    ),
  } as ComponentProps<typeof Streamdown>["components"];
}

export function CitedResponse({
  text,
  sources,
  showSources = false,
}: {
  text: string;
  sources: AskSource[];
  showSources?: boolean;
}) {
  return (
    <div>
      <Streamdown
        className={cn(
          "prose prose-sm size-full max-w-none text-foreground prose-headings:font-serif prose-p:text-foreground prose-strong:text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-8 [&_li]:my-1",
        )}
        components={citationComponents(sources)}
        mermaid={{ errorComponent: MermaidFallback }}
        plugins={plugins}
      >
        {text.replace(/\[blocked\]/gi, "")}
      </Streamdown>
      {showSources ? (
        <SourceBooks sources={uniqueSourcesByBook(sources)} />
      ) : null}
    </div>
  );
}
