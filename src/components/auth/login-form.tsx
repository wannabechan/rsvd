"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { isValidEmail, type LoginStep } from "@/domain/auth";
import { consumeAuthIntent } from "@/lib/auth-intent";
import { routes } from "@/lib/routes";

const CODE_PLACEHOLDER = "이메일 발송된 6자리 숫자";
const ERROR_DISMISS_MS = 5000;

export function LoginForm() {
  const router = useRouter();
  const {
    requestCode,
    loginByCode,
    loginByPassword,
    setupPassword,
    checkCanUsePasswordLogin,
  } = useAuth();

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "request-code" | "choose-password" | null
  >(null);
  const errorTimerRef = useRef<number | null>(null);

  function clearError() {
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setError(null);
  }

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  function showError(message: string) {
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
    }
    setError(message);
    errorTimerRef.current = window.setTimeout(() => {
      setError(null);
      errorTimerRef.current = null;
    }, ERROR_DISMISS_MS);
  }

  function finishLogin() {
    // Drop any pre-login intent; always land on the default home.
    consumeAuthIntent();
    router.replace(routes.spaceList);
  }

  async function handleRequestCodeLogin() {
    clearError();
    if (!isValidEmail(email)) {
      showError("올바른 이메일을 입력해 주세요.");
      return;
    }

    setPending(true);
    setPendingAction("request-code");
    const result = await requestCode(email);
    setPending(false);
    setPendingAction(null);

    if (!result.ok) {
      showError(result.error);
      return;
    }

    setCode("");
    setStep("code");
  }

  async function handleChoosePassword() {
    clearError();
    if (!isValidEmail(email)) {
      showError("올바른 이메일을 입력해 주세요.");
      return;
    }

    setPending(true);
    setPendingAction("choose-password");
    const status = await checkCanUsePasswordLogin(email);
    if (!status.ok) {
      setPending(false);
      setPendingAction(null);
      showError(status.error);
      return;
    }

    if (status.hasPassword) {
      setPending(false);
      setPendingAction(null);
      setPassword("");
      setStep("password");
      return;
    }

    const result = await requestCode(email);
    setPending(false);
    setPendingAction(null);

    if (!result.ok) {
      showError(result.error);
      return;
    }

    setCode("");
    setPassword("");
    setStep("password-setup");
  }

  async function handleVerifyCode() {
    clearError();
    setPending(true);
    const result = await loginByCode(email, code);
    setPending(false);

    if (!result.ok) {
      showError(result.error);
      return;
    }

    finishLogin();
  }

  async function handlePasswordLogin() {
    clearError();
    setPending(true);
    const result = await loginByPassword(email, password);
    setPending(false);

    if (!result.ok) {
      showError(result.error);
      return;
    }

    finishLogin();
  }

  async function handlePasswordSetup() {
    clearError();
    setPending(true);
    const result = await setupPassword(email, code, password);
    setPending(false);

    if (!result.ok) {
      showError(result.error);
      return;
    }

    finishLogin();
  }

  const emailFilled = email.trim().length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-8 pb-4">
        <label className="block text-sm font-medium text-rsvd-text" htmlFor="login-email">
          이메일 로그인
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          disabled={step !== "email" || pending}
          onChange={(event) => setEmail(event.target.value)}
          onFocus={clearError}
          placeholder="name@example.com"
          className={`auth-input auth-input-email mt-2 w-full rounded-2xl border border-rsvd-border px-3.5 py-3 text-sm text-rsvd-text placeholder:text-rsvd-text-muted disabled:text-rsvd-text-muted ${
            emailFilled ? "bg-rsvd-tint disabled:bg-rsvd-tint" : "bg-rsvd-surface disabled:bg-rsvd-bg"
          }`}
        />

        {step === "code" ? (
          <div className="mt-5">
            <label className="block text-sm font-medium text-rsvd-text" htmlFor="login-code">
              로그인 코드
            </label>
            <input
              id="login-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              disabled={pending}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={CODE_PLACEHOLDER}
              className="auth-input mt-2 w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
            />
          </div>
        ) : null}

        {step === "password" ? (
          <div className="mt-5">
            <label className="block text-sm font-medium text-rsvd-text" htmlFor="login-password">
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={pending}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호 입력"
              className="auth-input mt-2 w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
            />
          </div>
        ) : null}

        {step === "password-setup" ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-rsvd-text" htmlFor="setup-code">
                로그인 코드
              </label>
              <input
                id="setup-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                disabled={pending}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="최초 설정 시 이메일 발송된 6자리 숫자 입력"
                className="auth-input mt-2 w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rsvd-text" htmlFor="setup-password">
                새 비밀번호
              </label>
              <input
                id="setup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                disabled={pending}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6자 이상"
                className="auth-input mt-2 w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
              />
            </div>
          </div>
        ) : null}

      </div>

      <div className="shrink-0 bg-rsvd-surface px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-3">
          {error ? (
            <p className="text-sm text-rsvd-danger" role="alert">
              {error}
            </p>
          ) : null}
          {step === "email" ? (
            <>
              <p className="text-sm text-rsvd-text-muted">
                이메일 입력 후, 아래 중 한 가지를 선택하세요.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={pending}
                  aria-busy={pendingAction === "request-code"}
                  onClick={handleRequestCodeLogin}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-3 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:pointer-events-none"
                >
                  {pendingAction === "request-code" ? (
                    <ButtonSpinner tone="on-brand" />
                  ) : (
                    "로그인 코드"
                  )}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  aria-busy={pendingAction === "choose-password"}
                  onClick={handleChoosePassword}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-brand bg-rsvd-surface px-3 text-sm font-medium text-rsvd-brand transition hover:bg-rsvd-tint disabled:pointer-events-none"
                >
                  {pendingAction === "choose-password" ? (
                    <ButtonSpinner tone="brand" />
                  ) : (
                    "내 비밀번호"
                  )}
                </button>
              </div>
            </>
          ) : null}

          {step === "code" ? (
            <>
              <button
                type="button"
                disabled={pending || code.length !== 6}
                onClick={handleVerifyCode}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-3 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                코드로 로그인
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setStep("email");
                  setCode("");
                  clearError();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-3 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
              >
                이메일 다시 입력
              </button>
            </>
          ) : null}

          {step === "password" ? (
            <>
              <button
                type="button"
                disabled={pending || !password}
                onClick={handlePasswordLogin}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-3 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                비밀번호로 로그인
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  clearError();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-3 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
              >
                이메일 다시 입력
              </button>
            </>
          ) : null}

          {step === "password-setup" ? (
            <>
              <button
                type="button"
                disabled={pending || code.length !== 6 || !password}
                onClick={handlePasswordSetup}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-3 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                비밀번호 설정 후 로그인
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setPassword("");
                  clearError();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-3 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
              >
                이메일 다시 입력
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ButtonSpinner({ tone }: { tone: "on-brand" | "brand" }) {
  const borderClass =
    tone === "brand"
      ? "border-rsvd-brand border-t-transparent"
      : "border-rsvd-on-brand border-t-transparent";

  return (
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 ${borderClass}`}
    />
  );
}
