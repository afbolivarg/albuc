import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicGone } from "@/components/billing/public-gone";
import { Book3dCover } from "@/components/book-3d-cover";
import { PublicPageShell } from "@/components/public-page-shell";
import { getPublicProfileByHandle, getUserByHandle } from "@/lib/db/queries";
import { translate } from "@/lib/i18n/translate";
import {
  publicProfileMetadata,
  resolvePublicLocaleFrom,
} from "@/lib/public-metadata";
import { profileHandleFromParam, publicNotePath } from "@/lib/sharing";
import { getBookDisplayCoverUrl } from "@/lib/supabase/book-covers.shared";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ handle }, locale] = await Promise.all([
    params,
    resolvePublicLocaleFrom(searchParams),
  ]);
  const username = profileHandleFromParam(handle);
  if (!username) return { title: translate(locale, "nav.library") };
  return publicProfileMetadata(username, locale);
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { handle } = await params;
  const username = profileHandleFromParam(handle);
  if (!username) notFound();

  const [owner, profile, locale] = await Promise.all([
    getUserByHandle(username),
    getPublicProfileByHandle(username),
    resolvePublicLocaleFrom(searchParams),
  ]);
  if (!owner) notFound();
  if (!profile) return <PublicGone />;

  const title = translate(locale, "public.shelfTitle", {
    handle: `@${username}`,
  });

  return (
    <PublicPageShell locale={locale}>
      <h1 className="font-serif text-4xl font-bold tracking-tight">{title}</h1>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {profile.shelf.map((book, index) => {
          const cover = getBookDisplayCoverUrl(book, "M");
          return (
            <li key={book.id}>
              {book.visibility === "public" && book.shareSlug ? (
                <Link
                  href={publicNotePath(book.shareSlug, locale)}
                  prefetch={false}
                  className="bk3d-hover flex gap-3 rounded-xl p-2 hover:bg-muted"
                >
                  <Book3dCover
                    src={cover}
                    title={book.title}
                    className="w-[58px] shrink-0"
                    width={58}
                    height={88}
                    sizes="58px"
                    priority={index === 0}
                  />
                  <BookMeta title={book.title} authors={book.authors} />
                </Link>
              ) : (
                <div className="flex gap-3 rounded-xl p-2">
                  <Book3dCover
                    src={cover}
                    title={book.title}
                    className="w-[58px] shrink-0"
                    width={58}
                    height={88}
                    sizes="58px"
                    priority={index === 0}
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
