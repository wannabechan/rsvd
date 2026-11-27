/**
 * Server-side space image prep: center 3:4 crop → max 750×1000 → WebP.
 */

import sharp from "sharp";

const TARGET_RATIO = 3 / 4;
const MAX_WIDTH = 750;
const MAX_HEIGHT = 1000;

export async function processSpaceImageToWebp(
  input: Buffer | Uint8Array,
): Promise<Uint8Array> {
  const image = sharp(Buffer.from(input), { failOn: "none" });
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width <= 0 || height <= 0) {
    throw new Error("invalid-image");
  }

  let cropW = width;
  let cropH = height;
  let left = 0;
  let top = 0;
  const ratio = width / height;

  if (ratio > TARGET_RATIO) {
    cropW = Math.round(height * TARGET_RATIO);
    left = Math.floor((width - cropW) / 2);
  } else if (ratio < TARGET_RATIO) {
    cropH = Math.round(width / TARGET_RATIO);
    top = Math.floor((height - cropH) / 2);
  }

  let pipeline = image.extract({
    left,
    top,
    width: cropW,
    height: cropH,
  });

  if (cropW > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, { fit: "fill" });
  }

  const buffer = await pipeline.webp({ quality: 90 }).toBuffer();
  return new Uint8Array(buffer);
}
