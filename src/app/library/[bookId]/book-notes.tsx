"use client";

import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { NoteMdxEditor } from "@/components/note-editor/note-mdx-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Book } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { updateBookNotesAction } from "./actions";

interface BookNotesProps {
  book: Book;
}

export function BookNotes({ book }: BookNotesProps) {
  const t = useT();
  const router = useRouter();
  const [state, formAction] = useActionState(updateBookNotesAction, null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(book.noteMarkdown || "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const editorRef = useRef<MDXEditorMethods>(null);
  const pendingHref = useRef<string | null>(null);

  const [savedMarkdown, setSavedMarkdown] = useOptimistic(
    book.noteMarkdown || "",
    (_current, next: string) => next,
  );

  const dirty = draft !== savedMarkdown;

  useEffect(() => {
    if (state?.error) {
      setSavedMarkdown(book.noteMarkdown || "");
      setDraft(book.noteMarkdown || "");
    }
  }, [state, book.noteMarkdown, setSavedMarkdown]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      pendingHref.current = `${url.pathname}${url.search}${url.hash}`;
      setConfirmOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  const discardEdits = () => {
    const href = pendingHref.current;
    pendingHref.current = null;
    editorRef.current?.setMarkdown(savedMarkdown);
    setDraft(savedMarkdown);
    setIsEditing(false);
    setConfirmOpen(false);
    if (href) router.push(href);
  };

  const requestExit = () => {
    pendingHref.current = null;
    if (dirty) {
      setConfirmOpen(true);
      return;
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    const markdown = editorRef.current?.getMarkdown() ?? draft;
    setDraft(markdown);
    setIsEditing(false);
    startTransition(() => {
      setSavedMarkdown(markdown);
      const formData = new FormData();
      formData.append("bookId", book.id);
      formData.append("noteMarkdown", markdown);
      formAction(formData);
    });
  };

  return (
    <div className="relative flex min-h-[70vh] flex-col overflow-hidden bg-background md:h-full md:min-h-0">
      {state?.error && (
        <div className="shrink-0 border-b border-destructive/20 bg-destructive/10 px-5 py-2 text-sm text-destructive">
          {t("common.error")}: {state.error}
        </div>
      )}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          !isEditing && "cursor-text",
        )}
        onPointerDown={() => {
          if (!isEditing) setIsEditing(true);
        }}
      >
        <NoteMdxEditor
          key={book.id}
          canSave={dirty}
          doneLabel={t("notes.done")}
          markdown={savedMarkdown}
          onChange={(markdown, initialNormalize) => {
            if (initialNormalize) return;
            setDraft(markdown);
          }}
          onDone={requestExit}
          onSave={handleSave}
          placeholder={
            isEditing || savedMarkdown.trim()
              ? undefined
              : t("notes.placeholder")
          }
          readOnly={!isEditing}
          ref={editorRef}
          saveLabel={t("notes.save")}
        />
      </div>

      <Dialog
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) pendingHref.current = null;
        }}
        open={confirmOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("notes.discardTitle")}</DialogTitle>
            <DialogDescription>{t("notes.discardBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmOpen(false)} variant="ghost">
              {t("notes.keepEditing")}
            </Button>
            <Button onClick={discardEdits} variant="destructive">
              {t("notes.discard")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
