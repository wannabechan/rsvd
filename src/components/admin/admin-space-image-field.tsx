"use client";

import { useRef, useState } from "react";
import { IconPlus } from "@/components/admin/admin-icons";
import { prepareSpaceImageWebp } from "@/lib/prepare-space-image";

type AdminSpaceImageFieldProps = {
  label: string;
  urls: string[];
  maxCount: number;
  onChange: (urls: string[]) => void;
};

export function AdminSpaceImageField({
  label,
  urls,
  maxCount,
  onChange,
}: AdminSpaceImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canAdd = urls.length < maxCount;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || !canAdd) {
      return;
    }
    setError(null);
    setBusy(true);
    const remaining = maxCount - urls.length;
    const files = Array.from(fileList).slice(0, remaining);
    const next = [...urls];

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("이미지 파일만 업로드할 수 있습니다.");
          continue;
        }
        const webp = await prepareSpaceImageWebp(file);
        const form = new FormData();
        form.set("image", webp, "space.webp");
        const response = await fetch("/api/admin/space-images", {
          method: "POST",
          credentials: "same-origin",
          body: form,
        });
        const data = (await response.json()) as {
          ok: boolean;
          url?: string;
          error?: string;
        };
        if (!response.ok || !data.ok || !data.url) {
          setError(data.error ?? "이미지 업로드에 실패했습니다.");
          break;
        }
        next.push(data.url);
      }
      onChange(next);
    } catch {
      setError("이미지 처리에 실패했습니다.");
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-rsvd-text">{label}</span>
        <span className="text-xs text-rsvd-text-muted">
          {urls.length}/{maxCount}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-[3/4] w-[5.25rem] overflow-hidden rounded-xl border border-rsvd-border bg-rsvd-bg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute top-1 right-1 rounded-md bg-rsvd-surface/90 px-1.5 py-0.5 text-[11px] font-medium text-rsvd-danger"
            >
              삭제
            </button>
          </div>
        ))}

        {canAdd ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex aspect-[3/4] w-[5.25rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-rsvd-border bg-rsvd-bg text-rsvd-text-muted transition hover:border-rsvd-brand hover:text-rsvd-brand disabled:opacity-60"
          >
            <IconPlus className="h-4 w-4" />
            <span className="text-[11px]">{busy ? "…" : "업로드"}</span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxCount > 1}
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files);
        }}
      />

      {error ? (
        <p className="mt-2 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
