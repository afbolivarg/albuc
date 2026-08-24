export function publicProfileTag(handle: string) {
  return `public-profile-${handle.toLowerCase()}`;
}

export function publicNoteTag(slug: string) {
  return `public-note-${slug}`;
}

export const OPEN_LIBRARY_SEARCH_TAG = "open-library-search";
