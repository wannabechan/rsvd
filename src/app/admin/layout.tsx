import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid min-h-dvh w-full max-w-[1400px] grid-cols-5 bg-rsvd-bg" />
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
