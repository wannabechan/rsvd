"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import { isValidEmail, type LoginStep } from "@/domain/auth";
import { consumeAuthIntent } from "@/lib/auth-intent";
import { routes } from "@/lib/routes";

const CODE_PLACEHOLDER = "이메일 발송된 6자리 숫자";

export function LoginForm() {
  const router = useRouter();
  const { startChat } = useReservationChat();
  const {
    requestCode,
    loginByCode,
    loginByPassword,
    setupPassword,
    canUsePasswordLogin,
  } = useAuth();

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function finishLogin() {
    const intent = consumeAuthIntent();
    if (intent?.type === "open-chat") {
      startChat({ spaceId: intent.spaceId, spaceName: intent.spaceName });
      router.replace(routes.spaceDetail(intent.spaceId));
      return;
    }
    if (intent?.type === "path") {
      router.replace(intent.path);
      return;
    }
    router.replace(routes.spaceList);
  }

  async function handleRequestCodeLogin() {
    setError(null);
    if (!isValidEmail(email)) {
      setError("올바른 이메일을 입력해 주세요.");
      return;
    }

    setPending(true);
    const result = await requestCode(email);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCode("");
    setStep("code");
  }

  async function handleChoosePassword() {
    setError(null);
    if (!isValidEmail(email)) {
      setError("올바른 이메일을 입력해 주세요.");
      return;
    }

    if (canUsePasswordLogin(email)) {
      setPassword("");
      setStep("password");
      return;
    }

    setPending(true);
    const result = await requestCode(email);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCode("");
    setPassword("");
    setStep("password-setup");
  }

  async function handleVerifyCode() {
    setError(null);
    setPending(true);
    const result = await loginByCode(email, code);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    finishLogin();
  }

  async function handlePasswordLogin() {
    setError(null);
    setPending(true);
    const result = await loginByPassword(email, password);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    finishLogin();
  }

  async function handlePasswordSetup() {
    setError(null);
    setPending(true);
    const result = await setupPassword(email, code, password);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    finishLogin();
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-8">
      <h1 className="text-xl font-medium text-rsvd-text">로그인</h1>
      <p className="mt-2 text-sm text-rsvd-text-muted">
        이메일 입력 후, 로그인 코드 또는 비밀번호 사용.
      </p>

      <label className="mt-8 block text-sm font-medium text-rsvd-text" htmlFor="login-email">
        이메일
      </label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        disabled={step !== "email" || pending}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
        className="auth-input mt-2 w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text placeholder:text-rsvd-text-muted disabled:bg-rsvd-bg disabled:text-rsvd-text-muted"
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
          <p className="text-sm text-rsvd-text-muted">
            최초 비밀번호 설정 시 이메일로 발송된 로그인 코드 필요.
          </p>
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
              placeholder={CODE_PLACEHOLDER}
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

      {error ? (
        <p className="mt-3 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 pt-10">
        {step === "email" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={handleRequestCodeLogin}
              className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-3 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
            >
              로그인 코드
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleChoosePassword}
              className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-brand bg-rsvd-surface px-3 text-sm font-medium text-rsvd-brand transition hover:bg-rsvd-tint disabled:border-rsvd-border disabled:text-rsvd-disabled-text"
            >
              내 비밀번호
            </button>
          </div>
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
                setError(null);
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
                setError(null);
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
                setError(null);
              }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-3 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
            >
              이메일 다시 입력
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
