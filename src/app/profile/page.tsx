"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { routes } from "@/lib/routes";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isReady, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.replace(routes.login);
    }
  }, [isReady, isLoggedIn, router]);

  if (!isReady || !user) {
    return (
      <div className="flex flex-1 flex-col px-4 py-10">
        <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-10">
      <h1 className="text-xl font-medium text-rsvd-text">프로필</h1>
      <p className="mt-3 text-sm text-rsvd-text-muted">{user.email}</p>
      <button
        type="button"
        onClick={() => {
          logout();
          router.replace(routes.spaceList);
        }}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-4 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
      >
        로그아웃
      </button>
    </div>
  );
}
