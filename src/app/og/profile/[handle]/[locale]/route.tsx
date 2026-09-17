import { notFound } from "next/navigation";

import { getPublicProfileByHandle } from "@/lib/db/queries";
import { translate } from "@/lib/i18n/translate";
import { ProfileOgImage } from "@/lib/og/images";
import { renderOgImage } from "@/lib/og/render";
import { parseOgLocale } from "@/lib/public-metadata";
import { normalizeHandle } from "@/lib/sharing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string; locale: string }> },
) {
  const { handle: rawHandle, locale: rawLocale } = await params;
  const locale = parseOgLocale(rawLocale);
  const handle = normalizeHandle(rawHandle);
  if (!locale || !handle) notFound();

  const profile = await getPublicProfileByHandle(handle);
  if (!profile) notFound();

  const title = translate(locale, "public.shelfTitle", {
    handle: `@${handle}`,
  });

  return renderOgImage(<ProfileOgImage title={title} />);
}
