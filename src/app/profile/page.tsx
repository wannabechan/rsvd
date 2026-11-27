"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useLoginBoot } from "@/components/auth/login-boot-context";
import { UserAvatar } from "@/components/auth/user-avatar";
import { NICKNAME_MAX_LENGTH } from "@/domain/auth";
import { prepareAvatarWebp } from "@/lib/prepare-avatar-image";
import { routes } from "@/lib/routes";

type ConfirmKind = "save-avatar" | "delete-avatar" | null;

export default function ProfilePage() {
  const router = useRouter();
  const { bumpLoginBoot } = useLoginBoot();
  const {
    user,
    isReady,
    isLoggedIn,
    logout,
    saveNickname,
    uploadAvatar,
    removeAvatar,
  } = useAuth();
  const loggingOutRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingNickname, setSavingNickname] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<Blob | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);

  useEffect(() => {
    if (isReady && !isLoggedIn && !loggingOutRef.current) {
      router.replace(routes.login);
    }
  }, [isReady, isLoggedIn, router]);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    };
  }, [pendingPreviewUrl]);

  if (!isReady || !user) {
    return (
      <div className="flex flex-1 flex-col px-4 py-10">
        <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
      </div>
    );
  }

  const previewUser = pendingPreviewUrl
    ? { ...user, avatarUrl: pendingPreviewUrl }
    : user;

  async function handleSaveNickname() {
    setError(null);
    setSavingNickname(true);
    const result = await saveNickname(nickname);
    setSavingNickname(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNickname(result.user.nickname);
  }

  async function handleAvatarSelected(file: File | null) {
    if (!file) {
      return;
    }
    setError(null);
    try {
      const webp = await prepareAvatarWebp(file);
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(webp);
      setPendingAvatar(webp);
      setPendingPreviewUrl(previewUrl);
      setConfirmKind("save-avatar");
    } catch {
      setError("이미지를 처리할 수 없습니다. 다른 파일을 선택해 주세요.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function clearPendingAvatar() {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    setPendingAvatar(null);
    setPendingPreviewUrl(null);
  }

  async function confirmSaveAvatar() {
    if (!pendingAvatar) {
      setConfirmKind(null);
      return;
    }
    setAvatarBusy(true);
    setError(null);
    const result = await uploadAvatar(pendingAvatar);
    setAvatarBusy(false);
    clearPendingAvatar();
    setConfirmKind(null);
    if (!result.ok) {
      setError(result.error);
    }
  }

  async function confirmDeleteAvatar() {
    setAvatarBusy(true);
    setError(null);
    const result = await removeAvatar();
    setAvatarBusy(false);
    setConfirmKind(null);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-10 pb-6">
      <section aria-labelledby="profile-email-heading">
        <h2 id="profile-email-heading" className="text-sm font-medium text-rsvd-text">
          이메일
        </h2>
        <p className="mt-2 text-sm text-rsvd-text-muted">{user.email}</p>
      </section>

      <section className="mt-8" aria-labelledby="profile-avatar-heading">
        <h2 id="profile-avatar-heading" className="text-sm font-medium text-rsvd-text">
          프로필 이미지
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <UserAvatar
            user={previewUser}
            sizeClassName="h-20 w-20"
            textClassName="text-2xl"
          />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              ref={fileInputRef}
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={avatarBusy}
              onChange={(event) => {
                void handleAvatarSelected(event.target.files?.[0] ?? null);
              }}
            />
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-4 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:pointer-events-none disabled:text-rsvd-disabled-text"
            >
              이미지 등록
            </button>
            <button
              type="button"
              disabled={avatarBusy || (!user.avatarUrl && !pendingPreviewUrl)}
              onClick={() => setConfirmKind("delete-avatar")}
              className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-bg px-4 text-sm font-medium text-rsvd-text-muted transition hover:bg-rsvd-tint disabled:pointer-events-none disabled:text-rsvd-disabled-text"
            >
              이미지 삭제
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="profile-nickname-heading">
        <h2 id="profile-nickname-heading" className="text-sm font-medium text-rsvd-text">
          닉네임
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <label className="sr-only" htmlFor="profile-nickname">
            닉네임
          </label>
          <input
            id="profile-nickname"
            type="text"
            value={nickname}
            maxLength={NICKNAME_MAX_LENGTH}
            onChange={(event) => setNickname(event.target.value)}
            className="auth-input min-w-0 flex-1 rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text"
          />
          <button
            type="button"
            disabled={savingNickname || !nickname.trim()}
            onClick={() => {
              void handleSaveNickname();
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
          >
            {savingNickname ? "…" : "저장"}
          </button>
        </div>
      </section>

      {error ? (
        <p className="mt-4 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-auto flex items-center gap-4 pt-10">
        {user.role === "admin" ? (
          <button
            type="button"
            className="px-0 text-left text-xs font-normal text-rsvd-text-muted"
          >
            *관리자모드
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            loggingOutRef.current = true;
            bumpLoginBoot();
            logout();
            router.replace(routes.spaceList);
          }}
          className="px-0 text-left text-xs font-normal text-rsvd-text-muted"
        >
          *로그아웃
        </button>
      </div>

      {confirmKind ? (
        <ConfirmModal
          busy={avatarBusy}
          title={
            confirmKind === "save-avatar"
              ? "저장하시겠습니까?"
              : "삭제하시겠습니까?"
          }
          confirmLabel={confirmKind === "save-avatar" ? "확인" : "삭제"}
          onCancel={() => {
            if (avatarBusy) {
              return;
            }
            if (confirmKind === "save-avatar") {
              clearPendingAvatar();
            }
            setConfirmKind(null);
          }}
          onConfirm={() => {
            if (confirmKind === "save-avatar") {
              void confirmSaveAvatar();
              return;
            }
            void confirmDeleteAvatar();
          }}
        />
      ) : null}
    </div>
  );
}

function ConfirmModal({
  title,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-confirm-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
        <p
          id="profile-confirm-title"
          className="text-center text-sm font-medium text-rsvd-text"
        >
          {title}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:pointer-events-none"
          >
            취소
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:pointer-events-none"
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
