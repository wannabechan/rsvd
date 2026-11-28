import { NextResponse } from "next/server";
import {
  isValidEmail,
  normalizeEmail,
} from "@/domain/auth";
import {
  buildAuthUser,
  clearPhone,
  isUserStoreConfigured,
} from "@/lib/user-store";

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

    await clearPhone(email);
    const user = await buildAuthUser(email);
    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("phone DELETE failed", error);
    return NextResponse.json(
      { ok: false, error: "연락처 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
