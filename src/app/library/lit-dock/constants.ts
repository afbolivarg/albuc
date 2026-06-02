export const GAP = 7;

import type { SortKey } from "./types";

export const SORTS: Array<{
  key: SortKey;
  label: string;
  defaultDir: "asc" | "desc";
}> = [
  { key: "added", label: "Recently added", defaultDir: "desc" },
  { key: "title", label: "Title", defaultDir: "asc" },
  { key: "author", label: "Author", defaultDir: "asc" },
  { key: "rating", label: "Rating", defaultDir: "desc" },
];

export const PALETTES = {
  cream: ["#f4ecd8", "#ddc8a3", "#3a2a14"],
  navy: ["#1e2a44", "#0c1426", "#e8e1d2"],
  rust: ["#a45a3a", "#6c2f1a", "#f4ecd8"],
  forest: ["#274234", "#162820", "#e8d9b8"],
  paper: ["#e8e1d2", "#c9beac", "#2a2418"],
  ink: ["#1a1a1a", "#000000", "#d5c3a1"],
  ochre: ["#c98c3e", "#7a4d18", "#1d1407"],
  rose: ["#c47a8a", "#7a3b48", "#f7e8df"],
  sage: ["#9eb19c", "#5e7459", "#1d2a1a"],
  slate: ["#5a6577", "#2c333d", "#e8e2d0"],
  teal: ["#2f5d62", "#163536", "#e7ddc6"],
  plum: ["#5b3a57", "#2e1c2c", "#ecd9e6"],
  oxblood: ["#742a36", "#3f161d", "#f0dcc8"],
  mustard: ["#d9a441", "#9c6f15", "#211803"],
  fog: ["#aab4bd", "#6f7d88", "#1b232b"],
  bottle: ["#1f3a2e", "#0e1f17", "#cfe0c8"],
} as const;

export type PaletteKey = keyof typeof PALETTES;

export const STATUS_META = {
  WANT: { label: "Want", dot: "#9ca3af" },
  OWNED: { label: "Owned", dot: "#ef4444" },
  READING: { label: "Reading", dot: "#eab308" },
  READ: { label: "Read", dot: "#22c55e" },
} as const;

export const STATUS_ORDER = ["WANT", "OWNED", "READING", "READ"] as const;
