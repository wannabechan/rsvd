import { NextResponse } from "next/server";
import {
  getSpaceImageWebpBytes,
  isSpaceImageStoreConfigured,
} from "@/lib/space-image-store";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    if (!isSpaceImageStoreConfigured()) {
      return new NextResponse(null, { status: 404 });
    }

    const { imageId: rawId } = await context.params;
    const imageId = decodeURIComponent(rawId ?? "").trim();
    if (!imageId) {
      return new NextResponse(null, { status: 400 });
    }

    const bytes = await getSpaceImageWebpBytes(imageId);
    if (!bytes) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(new Blob([Buffer.from(bytes)], { type: "image/webp" }), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("space image GET failed", error);
    return new NextResponse(null, { status: 500 });
  }
}
