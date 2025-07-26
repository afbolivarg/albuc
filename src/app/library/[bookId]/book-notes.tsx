"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Edit3, Save, X, Eye, Signature } from "lucide-react"
import { UserBook } from "@/lib/db/schema"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"

interface BookNotesProps {
  book: UserBook
}

export function BookNotes({ book }: BookNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [noteContent, setNoteContent] = useState(book.noteMarkdown || "")
  const [isPending, startTransition] = useTransition()
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      try {
        const { updateBookNotes } = await import("@/app/actions/books")
        await updateBookNotes(book.id, noteContent)
        setIsEditing(false)
      } catch (error) {
        console.error("Failed to save notes:", error)
        // TODO: Show error toast
      }
    })
  }

  const handleCancel = () => {
    setNoteContent(book.noteMarkdown || "")
    setIsEditing(false)
    setShowPreview(false)
  }

  const hasNotes = book.noteMarkdown && book.noteMarkdown.trim().length > 0

  return (
    <Card className="backdrop-blur-sm shadow-none p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold">My Notes</h2>

        {isEditing ? (
          <div className="flex items-center gap-2">
            {noteContent.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4" />
                {showPreview ? "Edit" : "Preview"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              size="sm"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending} size="sm">
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
          >
            <Edit3 className="h-4 w-4" />
            {hasNotes ? "Edit Notes" : "Add Notes"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {showPreview ? (
            <div className="min-h-[300px] p-4 border border-muted rounded-lg bg-muted/30">
              {noteContent.trim() ? (
                <div className="prose prose-muted max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-serif font-bold mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-serif font-semibold mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-serif font-semibold mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="leading-relaxed mb-4">{children}</p>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-muted pl-4 py-2 bg-muted/30 italic mb-4">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1">
                          {children}
                        </ol>
                      ),
                    }}
                  >
                    {noteContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Nothing to preview yet...
                </p>
              )}
            </div>
          ) : (
            <Textarea
              value={noteContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNoteContent(e.target.value)
              }
              placeholder="Write your notes in Markdown...

**Bold text**, *italic text*

# Heading 1
## Heading 2

- List item
- Another item

> Quote

[Link text](url)"
              className="min-h-[300px] border-muted focus:border-muted focus:ring-muted font-mono text-sm resize-none"
            />
          )}

          <p className="text-xs text-muted-foreground">
            Supports Markdown formatting including **bold**, *italic*, headings,
            lists, quotes, and links.
          </p>
        </div>
      ) : hasNotes ? (
        <div className="prose prose-muted max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-serif font-bold mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-serif font-semibold mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-serif font-semibold mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed mb-4 font-serif text-lg">
                  {children}
                </p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-muted pl-6 py-4 bg-muted/30 italic mb-6 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2 text-lg">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2 text-lg">
                  {children}
                </ol>
              ),
            }}
          >
            {book.noteMarkdown}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
          <Signature className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No notes yet</p>
          <p className="text-sm text-muted-foreground">
            Click &quot;Add Notes&quot; to start writing your thoughts about
            this book
          </p>
        </div>
      )}
    </Card>
  )
}
