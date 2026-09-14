export function preloadCover(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function preloadCovers(urls: Array<string | null | undefined>) {
  const srcs = urls.filter((url): url is string => Boolean(url));
  if (srcs.length === 0) return Promise.resolve();
  return Promise.all(srcs.map(preloadCover));
}
