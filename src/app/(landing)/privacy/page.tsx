import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Albuc handles your data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-prose space-y-6 pt-10 pb-12 md:pt-12 md:pb-20 text-foreground">
      <h1 className="text-3xl font-serif font-bold tracking-tight">Privacy</h1>

      <p className="text-muted-foreground leading-relaxed">
        Albuc stores what you give it: your email, your book library, and your
        notes. That&apos;s it.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What we store</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Your account email</li>
          <li>Books you add and their metadata (title, author, cover)</li>
          <li>Notes you write for each book</li>
          <li>How often you use the Ask feature (for basic usage stats)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Who sees your data</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your library and notes are private to your account. When you use Ask,
          your question and relevant note excerpts are sent to an AI provider to
          generate an answer. We use Supabase for auth and database hosting.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Site analytics</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use Vercel Analytics to understand basic usage — page views, where
          visitors come from, that kind of thing. No ad tracking, no selling
          that data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What we don&apos;t do</h2>
        <p className="text-muted-foreground leading-relaxed">
          We don&apos;t sell your data. We don&apos;t show ads. We don&apos;t
          share your notes with other users.
        </p>
      </section>
    </article>
  );
}
