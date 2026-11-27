"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-context";
import { LoginBootProvider } from "@/components/auth/login-boot-context";
import { SiteHeader } from "@/components/layout/site-header";
import { ReservationChatProvider } from "@/components/reservation-chat/reservation-chat-context";
import { isAdminPath } from "@/lib/routes";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const adminMode = isAdminPath(pathname);

  return (
    <AuthProvider>
      <LoginBootProvider>
        {adminMode ? (
          <div className="min-h-dvh w-full bg-rsvd-bg text-rsvd-text">
            {children}
          </div>
        ) : (
          <ReservationChatProvider>
            <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-rsvd-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-rsvd-text">
              <SiteHeader />
              <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {children}
              </main>
            </div>
          </ReservationChatProvider>
        )}
      </LoginBootProvider>
    </AuthProvider>
  );
}
