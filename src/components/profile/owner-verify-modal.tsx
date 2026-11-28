"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { isValidLoginCode } from "@/domain/auth";

type OwnerVerifyModalProps = {
  onClose: () => void;
  onVerified: () => void;
};

export function OwnerVerifyModal({ onClose, onVerified }: OwnerVerifyModalProps) {
  const { verifyOwner } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) {
      return;
    }
    const timer = window.setTimeout(() => {
      onVerified();
      onClose();
    }, 3_000);
    return () => window.clearTimeout(timer);
  }, [success, onClose, onVerified]);

  useEffect(() => {
    if (!error) {
      return;
    }
    const timer = window.setTimeout(() => setError(null), 3_000);
    return () => window.clearTimeout(timer);
  }, [error]);

  async function handleVerify() {
    setError(null);
    if (!isValidLoginCode(code)) {
      setError("인증 코드 6자리를 입력해 주세요.");
      return;
    }
    setPending(true);
    const result = await verifyOwner(code);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-verify-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
        {success ? (
          <>
            <p
              id="owner-verify-title"
              className="text-center text-sm font-medium text-rsvd-text"
            >
              인증되었습니다!
            </p>
            <button
              type="button"
              onClick={() => {
                onVerified();
                onClose();
              }}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong"
            >
              확인
            </button>
          </>
        ) : (
          <>
            <p
              id="owner-verify-title"
              className="text-center text-sm font-medium text-rsvd-text"
            >
              사장님 인증
            </p>
            <p className="mt-2 text-center text-xs text-rsvd-text-muted">
              rsvd.에서 전달받은 인증코드를 입력하세요.
            </p>
            <label className="mt-4 block">
              <span className="sr-only">인증 코드</span>
              <input
                id="owner-verify-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onFocus={() => setError(null)}
                placeholder="000000"
                className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-center text-lg tracking-[0.3em] text-rsvd-text placeholder:tracking-normal placeholder:text-rsvd-text-muted"
                autoFocus
              />
            </label>
            {error ? (
              <p className="mt-3 text-center text-sm text-rsvd-danger" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                취소
              </button>
              <button
                type="button"
                disabled={pending || code.length !== 6}
                onClick={() => {
                  void handleVerify();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                {pending ? <ButtonSpinner /> : "인증"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
