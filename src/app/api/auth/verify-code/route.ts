import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  isValidEmail,
  isValidLoginCode,
  normalizeEmail,
  userIdFromEmail,
} from "@/domain/auth";
import {
  OTP_COOKIE,
  otpCookieOptions,
  verifyOtpCookieValue,
} from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = normalizeEmail(body.email ?? "");
    const code = (body.code ?? "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (!isValidLoginCode(code)) {
      return NextResponse.json(
        { ok: false, error: "6자리 숫자 코드를 입력해 주세요." },
        { status: 400 },
      );
    }

    const jar = await cookies();
    const verified = verifyOtpCookieValue(jar.get(OTP_COOKIE)?.value, email, code);
    if (!verified.ok) {
      return NextResponse.json({ ok: false, error: verified.error }, { status: 401 });
    }

    const user = {
      id: userIdFromEmail(email),
      email,
    };

    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(OTP_COOKIE, "", { ...otpCookieOptions(0), maxAge: 0 });
    return response;
  } catch (error) {
    console.error("verify-code failed", error);
    return NextResponse.json(
      { ok: false, error: "로그인 코드 확인에 실패했습니다." },
      { status: 500 },
    );
  }
}
