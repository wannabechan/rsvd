/**
 * Browser-only avatar prep: center square crop → max 800 → WebP.
 */

const MAX_SIDE = 800;

export async function prepareAvatarWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    if (side <= 0) {
      throw new Error("invalid-image");
    }
    const sx = Math.floor((bitmap.width - side) / 2);
    const sy = Math.floor((bitmap.height - side) / 2);
    const out = Math.min(side, MAX_SIDE);

    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("canvas-unavailable");
    }
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out);

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
