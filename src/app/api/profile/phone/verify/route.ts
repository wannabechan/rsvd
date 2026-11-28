import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  isValidEmail,
  isValidLoginCode,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "@/domain/auth";
import {
  PHONE_OTP_COOKIE,
  phoneOtpCookieOptions,
  verifyPhoneOtpCookieValue,
} from "@/lib/phone-otp";
import {
  buildAuthUser,
  isUserStoreConfigured,
  updatePhone,
} from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "프로필 저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      email?: string;
      phone?: string;
      code?: string;
    };
    const email = normalizeEmail(body.email ?? "");
    const phone = normalizePhone(body.phone ?? "");
    const code = (body.code ?? "").trim();

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
    if (!isValidLoginCode(code)) {
      return NextResponse.json(
        { ok: false, error: "인증 코드 6자리를 입력해 주세요." },
        { status: 400 },
      );
    }

    const jar = await cookies();
    const verified = verifyPhoneOtpCookieValue(
      jar.get(PHONE_OTP_COOKIE)?.value,
      email,
      phone,
      code,
    );
    if (!verified.ok) {
      return NextResponse.json(
        { ok: false, error: verified.error },
        { status: 400 },
      );
    }

    await updatePhone(email, phone);
    const user = await buildAuthUser(email);
    const response = NextResponse.json({
      ok: true,
      user,
    });
    response.cookies.set(PHONE_OTP_COOKIE, "", {
      ...phoneOtpCookieOptions(0),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("phone verify failed", error);
    return NextResponse.json(
      { ok: false, error: "연락처 인증에 실패했습니다." },
      { status: 500 },
    );
  }
}
