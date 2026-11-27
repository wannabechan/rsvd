import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "@/domain/auth";
import { sendLoginCodeEmail } from "@/lib/gmail-send";
import {
  createOtpCookieValue,
  generateLoginCode,
  OTP_COOKIE,
  otpCookieOptions,
} from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }

    const code = generateLoginCode();
    await sendLoginCodeEmail(email, code);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(OTP_COOKIE, createOtpCookieValue(email, code), otpCookieOptions());
    return response;
  } catch (error) {
    console.error("request-code failed", error);
    return NextResponse.json(
      { ok: false, error: "로그인 코드 발송에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
