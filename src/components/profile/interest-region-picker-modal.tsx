"use client";

import { useMemo, useState } from "react";
import {
  formatInterestRegionLabel,
  listRegionChildren,
  type RegionNode,
} from "@/domain/interest-region";

type InterestRegionPickerModalProps = {
  excludeLabels: readonly string[];
  onCancel: () => void;
  onSelect: (label: string) => void;
};

export function InterestRegionPickerModal({
  excludeLabels,
  onCancel,
  onSelect,
}: InterestRegionPickerModalProps) {
  const [path, setPath] = useState<string[]>([]);
  const excluded = useMemo(() => new Set(excludeLabels), [excludeLabels]);

  const options = listRegionChildren(path);
  const title =
    path.length === 0
      ? "시·도 선택"
      : `${formatInterestRegionLabel(path)} · 하위 지역`;

  function handlePick(node: RegionNode) {
    const nextPath = [...path, node.name];
    if (node.children && node.children.length > 0) {
      setPath(nextPath);
      return;
    }
    const label = formatInterestRegionLabel(nextPath);
    if (excluded.has(label)) {
      return;
    }
    onSelect(label);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interest-region-picker-title"
    >
      <div className="flex max-h-[min(36rem,90dvh)] w-full max-w-md flex-col rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
        <h2
          id="interest-region-picker-title"
          className="text-base font-medium text-rsvd-text"
        >
          관심지역 추가
        </h2>
        <p className="mt-1 text-xs text-rsvd-text-muted">{title}</p>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-rsvd-border">
          {options.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-rsvd-text-muted">
              선택할 지역이 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-rsvd-border">
              {options.map((node) => {
                const nextPath = [...path, node.name];
                const label = formatInterestRegionLabel(nextPath);
                const isLeaf = !node.children || node.children.length === 0;
                const disabled = isLeaf && excluded.has(label);
                return (
                  <li key={node.name}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handlePick(node)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-rsvd-text transition hover:bg-rsvd-bg disabled:cursor-not-allowed disabled:text-rsvd-disabled-text disabled:hover:bg-transparent"
                    >
                      <span>{node.name}</span>
                      {!isLeaf ? (
                        <span className="text-xs text-rsvd-text-muted" aria-hidden>
                          ›
                        </span>
                      ) : disabled ? (
                        <span className="text-xs text-rsvd-text-muted">선택됨</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
          >
            취소
          </button>
          <button
            type="button"
            disabled={path.length === 0}
            onClick={() => setPath((current) => current.slice(0, -1))}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
          >
            이전
          </button>
        </div>
      </div>
    </div>
  );
}
