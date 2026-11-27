"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useLoginBoot } from "@/components/auth/login-boot-context";
import { SpaceCandidateRequestModal } from "@/components/space/space-candidate-request-modal";
import { routes } from "@/lib/routes";

type FloatingAddButtonProps = {
  /** Logged out, or logged in with no favorite shops yet. */
  attention?: boolean;
};

export function FloatingAddButton({ attention = false }: FloatingAddButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { bumpLoginBoot } = useLoginBoot();
  const { isReady, isLoggedIn } = useAuth();
  const [requestOpen, setRequestOpen] = useState(false);

  function handleClick() {
    if (!isReady) {
      return;
    }
    if (!isLoggedIn) {
      bumpLoginBoot();
      if (pathname !== routes.login) {
        router.push(routes.login);
      }
      return;
    }
    setRequestOpen(true);
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px]">
        <div className="pointer-events-auto flex justify-end p-4 pb-6">
          <button
            type="button"
            aria-label="단골 매장 등록 요청하기"
            onClick={handleClick}
            className={`inline-flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${
              attention
                ? "rsvd-add-attention text-rsvd-brand"
                : "bg-rsvd-border text-rsvd-brand transition hover:bg-rsvd-tint"
            }`}
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {requestOpen ? (
        <SpaceCandidateRequestModal onClose={() => setRequestOpen(false)} />
      ) : null}
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
