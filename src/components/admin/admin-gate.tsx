"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { routes } from "@/lib/routes";

export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isReady, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!isLoggedIn || !user) {
      router.replace(routes.login);
      return;
    }
    if (user.role !== "admin") {
      router.replace(routes.profile);
    }
  }, [isReady, isLoggedIn, user, router]);

  if (!isReady || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-sm text-rsvd-text-muted">확인 중…</p>
      </div>
    );
  }

  return <>{children}</>;
}
