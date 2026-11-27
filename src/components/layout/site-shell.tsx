"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-context";
import { LoginBootProvider } from "@/components/auth/login-boot-context";
import { SiteHeader } from "@/components/layout/site-header";
import { ReservationChatProvider } from "@/components/reservation-chat/reservation-chat-context";
import { isAdminPath } from "@/lib/routes";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoginBootProvider>
        <Suspense fallback={<div className="min-h-dvh w-full bg-rsvd-bg" />}>
          <ShellByPath>{children}</ShellByPath>
        </Suspense>
      </LoginBootProvider>
    </AuthProvider>
  );
}

function ShellByPath({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isAdminPath(pathname)) {
    return <div className="min-h-dvh w-full bg-rsvd-bg text-rsvd-text">{children}</div>;
  }
  return <MobileShell>{children}</MobileShell>;
}

function MobileShell({ children }: { children: ReactNode }) {
  return (
    <ReservationChatProvider>
      <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-rsvd-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-rsvd-text">
        <SiteHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </ReservationChatProvider>
  );
}
