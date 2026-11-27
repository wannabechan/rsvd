import { NextResponse } from "next/server";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/domain/auth";
import { resolveAuthUser } from "@/lib/auth-user";
import { verifyPassword } from "@/lib/password-hash";
import { getPasswordHash, isUserStoreConfigured } from "@/lib/user-store";

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

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = normalizeEmail(body.email ?? "");
    const password = (body.password ?? "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { ok: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 },
      );
    }

    const stored = await getPasswordHash(email);
    if (!stored) {
      return NextResponse.json(
        { ok: false, error: "비밀번호 로그인을 먼저 설정해 주세요." },
        { status: 401 },
      );
    }

    const matched = await verifyPassword(password, stored);
    if (!matched) {
      return NextResponse.json(
        { ok: false, error: "비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    const user = await resolveAuthUser(email);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("login-password failed", error);
    return NextResponse.json(
      { ok: false, error: "비밀번호 로그인에 실패했습니다." },
      { status: 500 },
    );
  }
}
