export async function GET() {
  const content = `# Albuc

> Albuc is a free personal library and book-notes app at https://albuc.com. Track your reading, write markdown notes per book, and ask AI questions grounded in your own notes.

Features:

- Search and add books from Open Library
- Track reading status (Want, Owned, Reading, Read) with star ratings
- Write notes in Markdown per book
- Ask AI questions about your library — answers cite your notes

Albuc is designed for readers who want structure for their library and a place to capture what they actually thought about each book.`;
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
