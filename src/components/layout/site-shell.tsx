"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-context";
import { LoginBootProvider } from "@/components/auth/login-boot-context";
import { SiteHeader } from "@/components/layout/site-header";
import { ReservationChatProvider } from "@/components/reservation-chat/reservation-chat-context";
import { isAdminPath, routes } from "@/lib/routes";
import { useVisualViewportFrame } from "@/lib/use-visual-viewport-frame";

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
  const pathname = usePathname();
  // Login (and any focused-input flow) needs the shell to track the keyboard.
  const trackKeyboard =
    pathname === routes.login || pathname.startsWith(`${routes.login}/`);
  const shellRef = useVisualViewportFrame<HTMLDivElement>(trackKeyboard);

  return (
    <ReservationChatProvider>
      <div
        ref={shellRef}
        className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-rsvd-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-rsvd-text"
      >
        <SiteHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </ReservationChatProvider>
  );
}
