"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  formatPhoneDisplay,
  isValidLoginCode,
  isValidPhone,
  normalizePhone,
} from "@/domain/auth";

type PhoneVerifyStep = "phone" | "code";

type PhoneVerifyModalProps = {
  initialPhone?: string;
  onClose: () => void;
  onVerified: () => void;
};

export function PhoneVerifyModal({
  initialPhone = "",
  onClose,
  onVerified,
}: PhoneVerifyModalProps) {
  const { requestPhoneCode, verifyPhone } = useAuth();
  const [step, setStep] = useState<PhoneVerifyStep>("phone");
  const [phone, setPhone] = useState(() => normalizePhone(initialPhone));
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleRequestCode() {
    setError(null);
    if (!isValidPhone(phone)) {
      setError("올바른 휴대폰 번호를 입력해 주세요.");
      return;
    }
    setPending(true);
    const result = await requestPhoneCode(phone);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDebugCode(result.debugCode ?? null);
    setCode("");
    setStep("code");
  }

  async function handleVerify() {
    setError(null);
    if (!isValidLoginCode(code)) {
      setError("인증 코드 6자리를 입력해 주세요.");
      return;
    }
    setPending(true);
    const result = await verifyPhone(phone, code);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onVerified();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-verify-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
        <p
          id="phone-verify-title"
          className="text-center text-sm font-medium text-rsvd-text"
        >
          {step === "phone" ? "연락처 인증" : "인증 코드 입력"}
        </p>

        {step === "phone" ? (
          <div className="mt-4">
            <label className="sr-only" htmlFor="phone-verify-input">
              휴대폰 번호
            </label>
            <input
              id="phone-verify-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="연락처를 입력하세요."
              value={phone}
              onChange={(event) => setPhone(normalizePhone(event.target.value))}
              className="auth-input w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text"
            />
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-center text-xs text-rsvd-text-muted">
              {formatPhoneDisplay(phone)}으로 문자 발송된 6자리 코드
            </p>
            {debugCode ? (
              <p className="mt-1 text-center text-xs text-rsvd-brand">
                SMS 미설정 · 개발용 코드: {debugCode}
              </p>
            ) : null}
            <label className="sr-only" htmlFor="phone-verify-code">
              인증 코드
            </label>
            <input
              id="phone-verify-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6자리 숫자"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="auth-input mt-3 w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text"
            />
          </div>
        )}

        {error ? (
          <p className="mt-3 text-center text-sm text-rsvd-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (step === "code") {
                setStep("phone");
                setCode("");
                setError(null);
                return;
              }
              onClose();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:pointer-events-none"
          >
            {step === "code" ? "이전" : "취소"}
          </button>
          <button
            type="button"
            disabled={
              pending ||
              (step === "phone" ? !isValidPhone(phone) : code.length !== 6)
            }
            onClick={() => {
              if (step === "phone") {
                void handleRequestCode();
                return;
              }
              void handleVerify();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
          >
            {pending ? "…" : step === "phone" ? "코드 받기" : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
