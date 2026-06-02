/** [bg-light, bg-dark, ink] for the spine gradient and text. */
export type SpinePalette = readonly [string, string, string];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
    }
  }

  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(clamp(c, 0, 255))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function hslToHex(h: number, s: number, l: number) {
  const { r, g, b } = hslToRgb(h, s, l);
  return toHex(r, g, b);
}

export function isNeutralPixel(
  r: number,
  g: number,
  b: number,
  strict: boolean,
) {
  const { s, l } = rgbToHsl(r, g, b);
  if (strict) return l > 0.92 || l < 0.08 || s < 0.12;
  return l > 0.97 || l < 0.04;
}

type ColorBucket = {
  count: number;
  r: number;
  g: number;
  b: number;
  score: number;
};

export function accumulatePixels(
  data: Buffer,
  strictNeutralFilter: boolean,
): Map<string, ColorBucket> {
  const buckets = new Map<string, ColorBucket>();

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isNeutralPixel(r, g, b, strictNeutralFilter)) continue;

    const qr = Math.floor(r / 16);
    const qg = Math.floor(g / 16);
    const qb = Math.floor(b / 16);
    const key = `${qr}:${qg}:${qb}`;
    const { s } = rgbToHsl(r, g, b);
    const weight = 0.3 + s;

    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.r += r;
      existing.g += g;
      existing.b += b;
      existing.score += weight;
    } else {
      buckets.set(key, { count: 1, r, g, b, score: weight });
    }
  }

  return buckets;
}

export function pickDominantRgb(buckets: Map<string, ColorBucket>) {
  let best: ColorBucket | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.score > best.score) best = bucket;
  }
  if (!best) return null;

  return {
    r: Math.round(best.r / best.count),
    g: Math.round(best.g / best.count),
    b: Math.round(best.b / best.count),
  };
}

export function deriveSpinePalette(
  r: number,
  g: number,
  b: number,
): SpinePalette {
  let { h, s, l } = rgbToHsl(r, g, b);
  s = clamp(s, 0.25, 0.85);
  l = clamp(l, 0.25, 0.65);

  const bg1 = hslToHex(h, s * 0.9, clamp(l + 0.14));
  const bg2 = hslToHex(h, clamp(s * 1.05, 0, 1), clamp(l - 0.16));
  const ink =
    l > 0.52
      ? hslToHex(h, clamp(s * 0.3, 0, 0.4), 0.12)
      : hslToHex(h, clamp(s * 0.25, 0, 0.35), 0.88);

  return [bg1, bg2, ink];
}

export function parseSpineColors(
  value: string[] | null | undefined,
): SpinePalette | null {
  if (!value || value.length !== 3) return null;
  if (!value.every((color) => /^#[0-9a-fA-F]{6}$/.test(color))) return null;
  return [value[0], value[1], value[2]];
}

export function serializeSpineColors(
  palette: SpinePalette,
): [string, string, string] {
  return [palette[0], palette[1], palette[2]];
}
