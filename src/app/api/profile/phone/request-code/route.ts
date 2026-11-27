import { NextResponse } from "next/server";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "@/domain/auth";
import {
  createPhoneOtpCookieValue,
  generatePhoneCode,
  PHONE_OTP_COOKIE,
  phoneOtpCookieOptions,
} from "@/lib/phone-otp";
import { isSmsConfigured, sendPhoneVerificationCode } from "@/lib/sms-send";
import { isUserStoreConfigured } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "프로필 저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { email?: string; phone?: string };
    const email = normalizeEmail(body.email ?? "");
    const phone = normalizePhone(body.phone ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "올바른 휴대폰 번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    const code = generatePhoneCode();
    await sendPhoneVerificationCode(phone, code);

    // Only expose the code when SMS is not configured (local/dev fallback).
    const payload: { ok: true; debugCode?: string } = { ok: true };
    if (!isSmsConfigured()) {
      payload.debugCode = code;
    }

    const response = NextResponse.json(payload);
    response.cookies.set(
      PHONE_OTP_COOKIE,
      createPhoneOtpCookieValue(email, phone, code),
      phoneOtpCookieOptions(),
    );
    return response;
  } catch (error) {
    console.error("phone request-code failed", error);
    return NextResponse.json(
      { ok: false, error: "인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
