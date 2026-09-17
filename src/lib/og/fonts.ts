const FONT_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
};

async function fetchGoogleFont(
  family: string,
  weight: OgFont["weight"],
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await fetch(url, {
    headers: { "User-Agent": FONT_UA },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Font CSS ${family} ${weight}: ${response.status}`);
    }
    return response.text();
  });
  const match = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (!match?.[1]) {
    throw new Error(`Could not resolve ${family} ${weight}`);
  }
  const font = await fetch(match[1]);
  if (!font.ok) {
    throw new Error(`Font file ${family} ${weight}: ${font.status}`);
  }
  return font.arrayBuffer();
}

let fontsPromise: Promise<OgFont[]> | null = null;

export function loadOgFonts() {
  fontsPromise ??= Promise.all([
    fetchGoogleFont("EB Garamond", 700),
    fetchGoogleFont("EB Garamond", 600),
    fetchGoogleFont("Geist", 400),
    fetchGoogleFont("Geist", 500),
  ]).then(([garamond700, garamond600, geist400, geist500]) => [
    {
      name: "EB Garamond",
      data: garamond700,
      weight: 700,
      style: "normal",
    },
    {
      name: "EB Garamond",
      data: garamond600,
      weight: 600,
      style: "normal",
    },
    { name: "Geist", data: geist400, weight: 400, style: "normal" },
    { name: "Geist", data: geist500, weight: 500, style: "normal" },
  ]);
  return fontsPromise;
}
