import "server-only";

import sharp from "sharp";
import {
  accumulatePixels,
  deriveSpinePalette,
  pickDominantRgb,
  type SpinePalette,
} from "./spine-colors.shared";

export type { SpinePalette } from "./spine-colors.shared";

export async function extractSpineColorsFromImage(
  input: Buffer | ArrayBuffer | Uint8Array,
): Promise<SpinePalette | null> {
  const buffer = Buffer.isBuffer(input)
    ? input
    : Buffer.from(input instanceof ArrayBuffer ? new Uint8Array(input) : input);

  const { data } = await sharp(buffer)
    .resize(32, 48, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgb =
    pickDominantRgb(accumulatePixels(data, true)) ??
    pickDominantRgb(accumulatePixels(data, false));

  if (!rgb) return null;
  return deriveSpinePalette(rgb.r, rgb.g, rgb.b);
}
