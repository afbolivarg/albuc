import { revalidateTag } from "next/cache";
import { publicNoteTag, publicProfileTag } from "@/lib/cache-tags";

export function revalidatePublicProfile(handle: string | null | undefined) {
  if (!handle) return;
  revalidateTag(publicProfileTag(handle), "max");
}

export function revalidatePublicNote(slug: string | null | undefined) {
  if (!slug) return;
  revalidateTag(publicNoteTag(slug), "max");
}
