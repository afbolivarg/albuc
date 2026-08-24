import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageShell } from "@/components/public-page-shell";
import { getPublicProfileByHandle } from "@/lib/db/queries";
import { t } from "@/lib/i18n/server";
import { APP_DESCRIPTION } from "@/lib/pwa";
import { normalizeHandle } from "@/lib/sharing";
import { getBookDisplayCoverUrl } from "@/lib/supabase/book-covers.shared";

export const metadata: Metadata = {
  title: "Library",
  description: APP_DESCRIPTION,
};

function profileHandleFromParam(handle: string) {
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) return null;
  const normalized = normalizeHandle(decoded);
  return normalized || null;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const username = profileHandleFromParam(handle);
  if (!username) notFound();

  const profile = await getPublicProfileByHandle(username);
  if (!profile) notFound();

  const title = await t("public.shelfTitle", { handle: `@${username}` });

  return (
    <PublicPageShell>
      <h1 className="font-serif text-4xl font-bold tracking-tight">{title}</h1>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {profile.shelf.map((book, index) => {
          const cover = getBookDisplayCoverUrl(book, "M");
          return (
            <li key={book.id}>
              {book.visibility === "public" && book.shareSlug ? (
                <Link
                  href={`/n/${book.shareSlug}`}
                  prefetch={false}
                  className="flex gap-3 rounded-xl p-2 hover:bg-muted"
                >
                  <Cover
                    cover={cover}
                    priority={index === 0}
                    title={book.title}
                  />
                  <BookMeta title={book.title} authors={book.authors} />
                </Link>
              ) : (
                <div className="flex gap-3 rounded-xl p-2">
                  <Cover
                    cover={cover}
                    priority={index === 0}
                    title={book.title}
                  />
                  <BookMeta title={book.title} authors={book.authors} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PublicPageShell>
  );
}

function Cover({
  cover,
  title,
  priority = false,
}: {
  cover: string | null;
  title: string;
  priority?: boolean;
}) {
  return (
    <div className="h-[88px] w-[58px] shrink-0 overflow-hidden rounded-md bg-muted">
      {cover ? (
        <Image
          alt={title}
          className="h-full w-full object-cover"
          height={88}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          sizes="58px"
          src={cover}
          width={58}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <BookOpen className="size-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function BookMeta({
  title,
  authors,
}: {
  title: string;
  authors: string[] | null;
}) {
  return (
    <div className="min-w-0">
      <p className="font-serif text-lg font-semibold leading-tight">{title}</p>
      <p className="mt-1 truncate text-sm text-muted-foreground">
        {authors?.join(", ") || ""}
      </p>
    </div>
  );
}
