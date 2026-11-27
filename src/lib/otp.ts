import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { normalizeEmail } from "@/domain/auth";

const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_COOKIE = "rsvd_otp";

type OtpPayload = {
  email: string;
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

export function generateLoginCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashLoginCode(email: string, code: string): string {
  return createHmac("sha256", getOtpSecret())
    .update(`${normalizeEmail(email)}:${code.trim()}`)
    .digest("hex");
}

export function createOtpCookieValue(email: string, code: string): string {
  const payload: OtpPayload = {
    email: normalizeEmail(email),
    hash: hashLoginCode(email, code),
    exp: Date.now() + OTP_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getOtpSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyOtpCookieValue(
  cookieValue: string | undefined,
  email: string,
  code: string,
): { ok: true } | { ok: false; error: string } {
  if (!cookieValue) {
    return { ok: false, error: "로그인 코드가 만료되었거나 없습니다. 다시 요청해 주세요." };
  }

  const [body, sig] = cookieValue.split(".");
  if (!body || !sig) {
    return { ok: false, error: "로그인 코드가 올바르지 않습니다." };
  }

  const expectedSig = createHmac("sha256", getOtpSecret()).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { ok: false, error: "로그인 코드가 올바르지 않습니다." };
  }

  let payload: OtpPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OtpPayload;
  } catch {
    return { ok: false, error: "로그인 코드가 올바르지 않습니다." };
  }

  if (payload.exp < Date.now()) {
    return { ok: false, error: "로그인 코드가 만료되었습니다. 다시 요청해 주세요." };
  }

  if (payload.email !== normalizeEmail(email)) {
    return { ok: false, error: "이메일과 로그인 코드가 일치하지 않습니다." };
  }

  const submittedHash = hashLoginCode(email, code);
  const a = Buffer.from(payload.hash);
  const b = Buffer.from(submittedHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: "로그인 코드가 올바르지 않습니다." };
  }

  return { ok: true };
}

export function otpCookieOptions(maxAgeSeconds = Math.floor(OTP_TTL_MS / 1000)) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
