"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddBookModal } from "./add-book-modal"

export function AddBookButton() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Book
      </Button>

      <AddBookModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
