"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { routes } from "@/lib/routes";

const NAV_ITEMS = [
  { href: routes.adminSettings, label: "기본설정", match: "exact" as const },
  { href: routes.adminSpaces, label: "매장목록", match: "prefix" as const },
  {
    href: routes.adminSpaceCandidates,
    label: "매장후보",
    match: "prefix" as const,
  },
  { href: routes.adminUsers, label: "사용자", match: "prefix" as const },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGate>
      <div className="mx-auto grid min-h-dvh w-full max-w-[1400px] grid-cols-5">
        <aside className="col-span-1 min-w-[11rem] border-r border-rsvd-border bg-rsvd-surface">
          <div className="border-b border-rsvd-border px-4 py-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium leading-none text-rsvd-brand">
                관리자모드
              </p>
              <Link
                href={routes.spaceList}
                className="shrink-0 text-xs font-normal leading-none text-rsvd-text-muted transition hover:text-rsvd-text"
              >
                나가기
              </Link>
            </div>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => {
              const active =
                item.match === "exact"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-rsvd-tint font-medium text-rsvd-brand"
                      : "text-rsvd-text hover:bg-rsvd-bg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="col-span-4 min-w-0 overflow-y-auto bg-rsvd-bg p-6 md:p-8">
          {children}
        </section>
      </div>
    </AdminGate>
  );
}
