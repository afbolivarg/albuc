"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonWithTooltip,
  CreateLink,
  headingsPlugin,
  InsertThematicBreak,
  ListsToggle,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  markdownShortcutPlugin,
  quotePlugin,
  Separator,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Save, X } from "lucide-react";
import type { ForwardedRef } from "react";

export type NoteMdxEditorProps = MDXEditorProps & {
  onDone?: () => void;
  onSave?: () => void;
  canSave?: boolean;
  doneLabel?: string;
  saveLabel?: string;
};

export default function InitializedMdxEditor({
  editorRef,
  onDone,
  onSave,
  canSave = false,
  doneLabel = "Done",
  saveLabel = "Save",
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & NoteMdxEditorProps) {
  return (
    <MDXEditor
      {...props}
      className={`albuc-note-editor ${props.readOnly ? "albuc-note-editor--readonly" : ""} ${props.className ?? ""}`}
      contentEditableClassName="albuc-note-editor-content"
      plugins={[
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: "albuc-note-editor-toolbar",
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertThematicBreak />
              <Separator />
              <ButtonWithTooltip
                title={doneLabel}
                onClick={(event) => {
                  event.preventDefault();
                  onDone?.();
                }}
              >
                <X size={18} strokeWidth={1.75} />
              </ButtonWithTooltip>
              {canSave ? (
                <ButtonWithTooltip
                  title={saveLabel}
                  onClick={(event) => {
                    event.preventDefault();
                    onSave?.();
                  }}
                >
                  <Save size={18} strokeWidth={1.75} />
                </ButtonWithTooltip>
              ) : null}
            </>
          ),
        }),
      ]}
      ref={editorRef}
    />
  );
}
