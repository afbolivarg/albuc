import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BRAND_DIR } from "./paths";

export type Brand = {
  product: string;
  url: string;
  tagline: string;
  voice: string[];
  avoid: string[];
  colors: {
    paper: string;
    ink: string;
    muted: string;
    accent: string;
    forest: string;
    cream: string;
  };
};

let cached: Brand | null = null;

export function loadBrand(): Brand {
  if (cached) return cached;
  cached = JSON.parse(readFileSync(join(BRAND_DIR, "brand.json"), "utf8")) as Brand;
  return cached;
}

export function ctaLine(brand: Brand): string {
  return `${brand.tagline} ${brand.url}`;
}
