"use client";

import type { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { NoteMdxEditorProps } from "./initialized-mdx-editor";

const Editor = dynamic(() => import("./initialized-mdx-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export const NoteMdxEditor = forwardRef<MDXEditorMethods, NoteMdxEditorProps>(
  (props, ref) => <Editor {...props} editorRef={ref} />,
);

NoteMdxEditor.displayName = "NoteMdxEditor";
