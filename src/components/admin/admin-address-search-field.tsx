"use client";

import { useEffect, useId, useState } from "react";
import { openKakaoPostcodeSearch } from "@/lib/kakao-postcode";

type AdminAddressSearchFieldProps = {
  value: string;
  onChange: (next: string) => void;
};

function joinAddress(base: string, detail: string): string {
  return [base.trim(), detail.trim()].filter(Boolean).join(" ");
}

export function AdminAddressSearchField({
  value,
  onChange,
}: AdminAddressSearchFieldProps) {
  const baseId = useId();
  const detailId = useId();
  const [base, setBase] = useState(value);
  const [detail, setDetail] = useState("");
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const joined = joinAddress(base, detail);
    if (value !== joined) {
      setBase(value);
      setDetail("");
    }
    // Sync only when parent value diverges (e.g. loaded space / Kakao replace).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- base/detail are local mirrors
  }, [value]);

  async function handleSearch() {
    setError(null);
    setOpening(true);
    try {
      await openKakaoPostcodeSearch((address) => {
        setBase(address);
        setDetail("");
        onChange(address);
        window.setTimeout(() => {
          document.getElementById(detailId)?.focus();
        }, 0);
      });
    } catch {
      setError("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          id={baseId}
          value={base}
          readOnly
          placeholder="주소 검색으로 입력"
          className="auth-input min-w-0 flex-1 rounded-xl border border-rsvd-border bg-rsvd-bg px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
        />
        <button
          type="button"
          disabled={opening}
          aria-busy={opening}
          onClick={() => {
            void handleSearch();
          }}
          className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
        >
          주소 검색
        </button>
      </div>
      <input
        id={detailId}
        value={detail}
        onChange={(event) => {
          const nextDetail = event.target.value;
          setDetail(nextDetail);
          onChange(joinAddress(base, nextDetail));
        }}
        placeholder="상세주소 (동·호수 등)"
        disabled={!base.trim()}
        className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted disabled:bg-rsvd-bg disabled:text-rsvd-disabled-text"
      />
      {error ? (
        <p className="text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
