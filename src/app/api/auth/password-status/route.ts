import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "@/domain/auth";
import {
  hasPasswordForEmail,
  isUserStoreConfigured,
} from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "비밀번호 저장소가 아직 연결되지 않았습니다. Vercel Upstash Redis 설정을 확인해 주세요.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }

    const hasPassword = await hasPasswordForEmail(email);
    return NextResponse.json({ ok: true, hasPassword });
  } catch (error) {
    console.error("password-status failed", error);
    return NextResponse.json(
      { ok: false, error: "비밀번호 설정 여부 확인에 실패했습니다." },
      { status: 500 },
    );
  }
}
