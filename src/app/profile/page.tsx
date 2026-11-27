"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useLoginBoot } from "@/components/auth/login-boot-context";
import { UserAvatar } from "@/components/auth/user-avatar";
import { NICKNAME_MAX_LENGTH } from "@/domain/auth";
import { prepareAvatarWebp } from "@/lib/prepare-avatar-image";
import { routes } from "@/lib/routes";

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
  } = useAuth();
  const loggingOutRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingNickname, setSavingNickname] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  if (!isReady || !user) {
    return (
      <div className="flex flex-1 flex-col px-4 py-10">
        <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
      </div>
    );
  }

  async function handleSaveNickname() {
    setError(null);
    setMessage(null);
    setSavingNickname(true);
    const result = await saveNickname(nickname);
    setSavingNickname(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNickname(result.user.nickname);
    setMessage("닉네임을 저장했습니다.");
  }

  async function handleAvatarSelected(file: File | null) {
    if (!file) {
      return;
    }
    setError(null);
    setMessage(null);
    setUploadingAvatar(true);
    try {
      const webp = await prepareAvatarWebp(file);
      const result = await uploadAvatar(webp);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("프로필 이미지를 저장했습니다.");
    } catch {
      setError("이미지를 처리할 수 없습니다. 다른 파일을 선택해 주세요.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-10">
      <h1 className="text-xl font-medium text-rsvd-text">프로필</h1>
      <p className="mt-2 text-sm text-rsvd-text-muted">{user.email}</p>

      <section className="mt-8" aria-labelledby="profile-avatar-heading">
        <h2 id="profile-avatar-heading" className="text-sm font-medium text-rsvd-text">
          프로필 이미지
        </h2>
        <div className="mt-3 flex items-center gap-4">
          <UserAvatar
            user={user}
            sizeClassName="h-20 w-20"
            textClassName="text-2xl"
          />
          <div className="min-w-0 flex-1">
            <input
              ref={fileInputRef}
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingAvatar}
              onChange={(event) => {
                void handleAvatarSelected(event.target.files?.[0] ?? null);
              }}
            />
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-4 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:pointer-events-none disabled:text-rsvd-disabled-text"
            >
              {uploadingAvatar ? "업로드 중…" : "이미지 등록"}
            </button>
            <p className="mt-2 text-xs leading-relaxed text-rsvd-text-muted">
              가운데 기준 정사각으로 자른 뒤 WebP로 저장됩니다. (최대 800×800)
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="profile-nickname-heading">
        <h2 id="profile-nickname-heading" className="text-sm font-medium text-rsvd-text">
          닉네임
        </h2>
        <label className="sr-only" htmlFor="profile-nickname">
          닉네임
        </label>
        <input
          id="profile-nickname"
          type="text"
          value={nickname}
          maxLength={NICKNAME_MAX_LENGTH}
          onChange={(event) => setNickname(event.target.value)}
          className="auth-input mt-2 w-full rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-3 text-sm text-rsvd-text"
        />
        <button
          type="button"
          disabled={savingNickname || !nickname.trim()}
          onClick={() => {
            void handleSaveNickname();
          }}
          className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
        >
          {savingNickname ? "저장 중…" : "닉네임 저장"}
        </button>
      </section>

      {error ? (
        <p className="mt-4 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 text-sm text-rsvd-success" role="status">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => {
          loggingOutRef.current = true;
          bumpLoginBoot();
          logout();
          router.replace(routes.spaceList);
        }}
        className="mt-10 inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-4 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
      >
        로그아웃
      </button>
    </div>
  );
}
