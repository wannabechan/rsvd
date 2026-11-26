import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-1 flex-col bg-rsvd-surface text-rsvd-text">
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
