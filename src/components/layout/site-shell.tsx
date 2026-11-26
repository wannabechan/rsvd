import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { ReservationChatProvider } from "@/components/reservation-chat/reservation-chat-context";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <ReservationChatProvider>
      <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-rsvd-surface text-rsvd-text">
        <SiteHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </ReservationChatProvider>
  );
}
