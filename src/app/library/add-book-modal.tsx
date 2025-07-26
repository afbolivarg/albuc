"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, BookOpen } from "lucide-react"
import { searchBooks } from "@/app/actions/books"
import { BookSearchResult } from "@/lib/open-library"
import { SearchResultItem } from "./search-result-item"

interface AddBookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBookModal({ open, onOpenChange }: AddBookModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<BookSearchResult[]>([])
  const [isSearching, startSearchTransition] = useTransition()
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    startSearchTransition(async () => {
      try {
        const searchResult = await searchBooks(query)
        setResults(searchResult.results)
        setHasSearched(true)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
        setHasSearched(true)
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleClose = () => {
    setQuery("")
    setResults([])
    setHasSearched(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-foreground">
            Add Book to Alexandria
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 focus-visible:ring-0"
                disabled={isSearching}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching Alexandria...</span>
                </div>
              </div>
            ) : hasSearched ? (
              results.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Found {results.length} books
                  </p>
                  {results.map((book, index) => (
                    <SearchResultItem
                      key={`${book.workKey}-${index}`}
                      book={book}
                      onAdd={() => handleClose()}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                  <p className="text-foreground">
                    No books found for &quot;{query}&quot;
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or check the spelling
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                <Search className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Search for books to add to your library
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching by title, author, or ISBN
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
