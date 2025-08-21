"use client"

import {
  useState,
  useActionState,
  useOptimistic,
  startTransition,
  useEffect,
} from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Edit3, Save, X, Eye, Signature } from "lucide-react"
import { Book } from "@/lib/db/schema"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import { updateBookNotesAction } from "./actions"

interface BookNotesProps {
  book: Book
}

export function BookNotes({ book }: BookNotesProps) {
  const [state, formAction] = useActionState(updateBookNotesAction, null)
  const [isEditing, setIsEditing] = useState(false)
  const [noteContent, setNoteContent] = useState(book.noteMarkdown || "")
  const [showPreview, setShowPreview] = useState(false)

  const [optimisticNotes, setOptimisticNotes] = useOptimistic(
    book.noteMarkdown || "",
    (currentNotes, newNotes: string) => newNotes
  )

  useEffect(() => {
    if (state?.error) {
      setOptimisticNotes(book.noteMarkdown || "")
      setIsEditing(true)
      setNoteContent(book.noteMarkdown || "")
    }
  }, [state, book.noteMarkdown, setOptimisticNotes])

  const handleSave = () => {
    setIsEditing(false)
    setShowPreview(false)
    startTransition(() => {
      setOptimisticNotes(noteContent)
      const formData = new FormData()
      formData.append("bookId", book.id)
      formData.append("noteMarkdown", noteContent)
      formAction(formData)
    })
  }

  const handleCancel = () => {
    setNoteContent(book.noteMarkdown || "")
    setIsEditing(false)
    setShowPreview(false)
  }

  const hasNotes = optimisticNotes && optimisticNotes.trim().length > 0

  return (
    <Card className="backdrop-blur-sm shadow-none p-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
              <Button variant="outline" onClick={handleCancel} size="sm">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4" />
                Save
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

        {state?.error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            Error: {state.error}
          </div>
        )}

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
                          <p className="leading-relaxed mb-4 font-serif">
                            {children}
                          </p>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-muted pl-4 py-2 bg-muted/30 italic mb-4 font-serif">
                            {children}
                          </blockquote>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 space-y-1 font-serif">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-1 font-serif">
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
              Supports Markdown formatting including **bold**, *italic*,
              headings, lists, quotes, and links.
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
                  <blockquote className="border-l-4 border-muted pl-6 py-4 bg-muted/30 italic mb-6 rounded-r-lg font-serif">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-lg font-serif">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-lg font-serif">
                    {children}
                  </ol>
                ),
              }}
            >
              {optimisticNotes}
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
      </div>
    </Card>
  )
}
