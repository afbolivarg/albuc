export async function GET() {
  const content = `# Albuc

> Albuc is a personal library management application that helps you organize and track your reading journey with a warm, tactile interface that makes reading feel like home.

Important features:

- Search and discover any book with rich metadata
- Track reading status: Want, Owned, Reading, or Read with star ratings
- Write beautiful notes in Markdown with live preview
- Personal library management with an intuitive, book-focused interface

## What You Can Do

- **Search Books**: Find any book and save it to your personal library
- **Track Status**: Organize books by reading status (Want, Owned, Reading, Read) with 5-star ratings
- **Rich Notes**: Write and edit notes in Markdown format with live preview
- **Personal Library**: Beautiful, organized view of your entire book collection

This application is designed for book lovers who want a digital solution that captures the warmth and personal connection of a physical library.`
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
