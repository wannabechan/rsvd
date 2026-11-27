import { NextResponse } from "next/server";
import { processSpaceImageToWebp } from "@/lib/process-space-image";
import {
  isSpaceImageStoreConfigured,
  saveSpaceImageWebp,
} from "@/lib/space-image-store";

const MAX_UPLOAD_BYTES = 8_000_000;
const MAX_STORED_BYTES = 800_000;
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50];

function isWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) {
    return false;
  }
  for (let i = 0; i < 4; i += 1) {
    if (bytes[i] !== WEBP_RIFF[i]) {
      return false;
    }
  }
  for (let i = 0; i < 4; i += 1) {
    if (bytes[8 + i] !== WEBP_MARKER[i]) {
      return false;
    }
  }
  return true;
}

export async function POST(request: Request) {
  try {
    if (!isSpaceImageStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "이미지 파일이 필요합니다." },
        { status: 400 },
      );
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: "이미지 용량이 너무 큽니다. 다시 시도해 주세요." },
        { status: 400 },
      );
    }

    const webp = isWebp(buffer)
      ? buffer
      : await processSpaceImageToWebp(buffer);

    if (webp.byteLength === 0 || webp.byteLength > MAX_STORED_BYTES) {
      return NextResponse.json(
        { ok: false, error: "이미지 처리 결과가 너무 큽니다. 다시 시도해 주세요." },
        { status: 400 },
      );
    }
    if (!isWebp(webp)) {
      return NextResponse.json(
        { ok: false, error: "WebP 이미지만 저장할 수 있습니다." },
        { status: 400 },
      );
    }

    const saved = await saveSpaceImageWebp(webp);
    return NextResponse.json({ ok: true, url: saved.url, id: saved.id });
  } catch (error) {
    console.error("admin space image POST failed", error);
    return NextResponse.json(
      { ok: false, error: "이미지 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
