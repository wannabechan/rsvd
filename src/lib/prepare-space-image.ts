/**
 * Browser-only space image prep: center 3:4 crop → max 750×1000 → WebP.
 */

const TARGET_RATIO = 3 / 4;
const MAX_WIDTH = 750;
const MAX_HEIGHT = 1000;

export async function prepareSpaceImageWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = bitmap;
    if (width <= 0 || height <= 0) {
      throw new Error("invalid-image");
    }

    let cropW = width;
    let cropH = height;
    let sx = 0;
    let sy = 0;
    const ratio = width / height;

    if (ratio > TARGET_RATIO) {
      cropW = Math.round(height * TARGET_RATIO);
      sx = Math.floor((width - cropW) / 2);
    } else if (ratio < TARGET_RATIO) {
      cropH = Math.round(width / TARGET_RATIO);
      sy = Math.floor((height - cropH) / 2);
    }

    const outW = cropW > MAX_WIDTH ? MAX_WIDTH : cropW;
    const outH = cropW > MAX_WIDTH ? MAX_HEIGHT : cropH;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("canvas-unavailable");
    }
    ctx.drawImage(bitmap, sx, sy, cropW, cropH, 0, 0, outW, outH);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.9);
    });
    if (!blob) {
      throw new Error("webp-encode-failed");
    }
    return blob;
  } finally {
    bitmap.close();
  }
}
