import { NextResponse } from "next/server";
import {
  isValidEmail,
  normalizeEmail,
} from "@/domain/auth";
import {
  buildAuthUser,
  clearAvatar,
  getAvatarWebpBytes,
  isUserStoreConfigured,
  saveAvatarWebp,
} from "@/lib/user-store";

const MAX_AVATAR_BYTES = 600_000;
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

export async function GET(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return new NextResponse(null, { status: 404 });
    }

    const email = normalizeEmail(
      new URL(request.url).searchParams.get("e") ?? "",
    );
    if (!isValidEmail(email)) {
      return new NextResponse(null, { status: 400 });
    }

    const bytes = await getAvatarWebpBytes(email);
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
    console.error("avatar GET failed", error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "프로필 저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const email = normalizeEmail(String(form.get("email") ?? ""));
    const file = form.get("avatar");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "이미지 파일이 필요합니다." },
        { status: 400 },
      );
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { ok: false, error: "이미지 용량이 너무 큽니다. 다시 시도해 주세요." },
        { status: 400 },
      );
    }
    if (!isWebp(buffer)) {
      return NextResponse.json(
        { ok: false, error: "WebP 이미지만 저장할 수 있습니다." },
        { status: 400 },
      );
    }

    await saveAvatarWebp(email, buffer);
    const user = await buildAuthUser(email);
    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("avatar POST failed", error);
    return NextResponse.json(
      { ok: false, error: "프로필 이미지 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "프로필 저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const email = normalizeEmail(
      new URL(request.url).searchParams.get("e") ?? "",
    );
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }

    await clearAvatar(email);
    const user = await buildAuthUser(email);
    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("avatar DELETE failed", error);
    return NextResponse.json(
      { ok: false, error: "프로필 이미지 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
