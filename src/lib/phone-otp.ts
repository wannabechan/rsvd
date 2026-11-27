/**
 * Signed cookie OTP for phone verification (mirrors email login OTP).
 */

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { normalizeEmail, normalizePhone } from "@/domain/auth";

const OTP_TTL_MS = 10 * 60 * 1000;
export const PHONE_OTP_COOKIE = "rsvd_phone_otp";

type PhoneOtpPayload = {
  email: string;
  phone: string;
  hash: string;
  exp: number;
};

function getOtpSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET (or GOOGLE_CLIENT_SECRET) for OTP signing");
  }
  return secret;
}

export function generatePhoneCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashPhoneCode(email: string, phone: string, code: string): string {
  return createHmac("sha256", getOtpSecret())
    .update(
      `${normalizeEmail(email)}:${normalizePhone(phone)}:${code.trim()}`,
    )
    .digest("hex");
}

export function createPhoneOtpCookieValue(
  email: string,
  phone: string,
  code: string,
): string {
  const payload: PhoneOtpPayload = {
    email: normalizeEmail(email),
    phone: normalizePhone(phone),
    hash: hashPhoneCode(email, phone, code),
    exp: Date.now() + OTP_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getOtpSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPhoneOtpCookieValue(
  cookieValue: string | undefined,
  email: string,
  phone: string,
  code: string,
): { ok: true } | { ok: false; error: string } {
  if (!cookieValue) {
    return { ok: false, error: "인증 코드가 만료되었거나 없습니다. 다시 요청해 주세요." };
  }

  const [body, sig] = cookieValue.split(".");
  if (!body || !sig) {
    return { ok: false, error: "인증 코드가 올바르지 않습니다." };
  }

  const expectedSig = createHmac("sha256", getOtpSecret()).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { ok: false, error: "인증 코드가 올바르지 않습니다." };
  }

  let payload: PhoneOtpPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PhoneOtpPayload;
  } catch {
    return { ok: false, error: "인증 코드가 올바르지 않습니다." };
  }

  if (payload.exp < Date.now()) {
    return { ok: false, error: "인증 코드가 만료되었습니다. 다시 요청해 주세요." };
  }

  if (payload.email !== normalizeEmail(email)) {
    return { ok: false, error: "계정과 인증 코드가 일치하지 않습니다." };
  }

  if (payload.phone !== normalizePhone(phone)) {
    return { ok: false, error: "연락처와 인증 코드가 일치하지 않습니다." };
  }

  const submittedHash = hashPhoneCode(email, phone, code);
  const a = Buffer.from(payload.hash);
  const b = Buffer.from(submittedHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: "인증 코드가 올바르지 않습니다." };
  }

  return { ok: true };
}

export function phoneOtpCookieOptions(maxAgeSeconds = Math.floor(OTP_TTL_MS / 1000)) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
