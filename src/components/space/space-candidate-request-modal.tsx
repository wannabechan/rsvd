"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  SPACE_CANDIDATE_CHANNELS,
  SPACE_CANDIDATE_REQUEST_TITLE,
  spaceCandidateInviteMessage,
  spaceCandidateRepeatInviteMessage,
  type SpaceCandidateChannel,
} from "@/domain/admin-space-candidate";

type SpaceCandidateRequestModalProps = {
  onClose: () => void;
};

type Step = "form" | "confirm";

export function SpaceCandidateRequestModal({
  onClose,
}: SpaceCandidateRequestModalProps) {
  const { user } = useAuth();
  const nickname = user?.nickname?.trim() || "회원";
  const [step, setStep] = useState<Step>("form");
  const [channel, setChannel] = useState<SpaceCandidateChannel>(
    SPACE_CANDIDATE_CHANNELS[0],
  );
  const [handle, setHandle] = useState("");
  const [isRepeat, setIsRepeat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFormSave() {
    setError(null);
    const trimmed = handle.trim();
    if (!trimmed) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    setChecking(true);
    try {
      const params = new URLSearchParams({
        channel,
        handle: trimmed,
      });
      const response = await fetch(`/api/space-candidates?${params}`, {
        method: "GET",
        credentials: "same-origin",
      });
      const data = (await response.json()) as {
        ok: boolean;
        exists?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "조회에 실패했습니다.");
        setChecking(false);
        return;
      }
      setIsRepeat(Boolean(data.exists));
      setStep("confirm");
      setChecking(false);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setChecking(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/space-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          channel,
          handle: handle.trim(),
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "등록 요청 저장에 실패했습니다.");
        setSaving(false);
        return;
      }
      onClose();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="space-candidate-request-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
        {step === "form" ? (
          <>
            <h2
              id="space-candidate-request-title"
              className="text-center text-sm font-medium text-rsvd-text"
            >
              {SPACE_CANDIDATE_REQUEST_TITLE}
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
                  채널
                </span>
                <input
                  value={channel}
                  readOnly
                  tabIndex={-1}
                  aria-readonly="true"
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-bg px-3.5 py-2.5 text-sm text-rsvd-text"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
                  아이디
                </span>
                <input
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  placeholder="@account"
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
                />
              </label>

              {error ? (
                <p className="text-sm text-rsvd-danger" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={checking}
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                취소
              </button>
              <button
                type="button"
                disabled={checking || !handle.trim()}
                onClick={() => {
                  void handleFormSave();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                {checking ? "…" : "등록 요청"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              id="space-candidate-request-title"
              className="text-center text-sm font-medium text-rsvd-text"
            >
              {SPACE_CANDIDATE_REQUEST_TITLE}
            </h2>

            <div className="mt-4 rounded-2xl border border-rsvd-border bg-rsvd-bg px-4 py-3 text-sm text-rsvd-text">
              <p>
                <span className="text-rsvd-text-muted">채널</span>{" "}
                <span className="font-medium">{channel}</span>
              </p>
              <p className="mt-1.5">
                <span className="text-rsvd-text-muted">아이디</span>{" "}
                <span className="font-medium">{handle.trim()}</span>
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-rsvd-text-muted">
              {isRepeat
                ? spaceCandidateRepeatInviteMessage(nickname)
                : spaceCandidateInviteMessage(nickname)}
            </p>

            {error ? (
              <p className="mt-3 text-sm text-rsvd-danger" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setError(null);
                  setStep("form");
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                돌아가기
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  void handleConfirm();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                {saving ? "…" : "확인"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
