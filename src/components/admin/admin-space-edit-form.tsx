"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  adminSpaceRegularCount,
  adminSpaceReservationCount,
  type AdminSpace,
} from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminSpaceEditFormProps = {
  space: AdminSpace;
};

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AdminSpaceEditForm({ space }: AdminSpaceEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(space.name);
  const [address, setAddress] = useState(space.address);
  const [contact, setContact] = useState(space.contact);
  const [adminEmail, setAdminEmail] = useState(space.adminEmail);
  const [noticesText, setNoticesText] = useState(space.notices.join("\n"));
  const [heroImage, setHeroImage] = useState(space.heroImage);
  const [menuImagesText, setMenuImagesText] = useState(
    space.menuImages.join("\n"),
  );
  const [otherImagesText, setOtherImagesText] = useState(
    space.otherImages.join("\n"),
  );
  const [bookingBufferDays, setBookingBufferDays] = useState(
    String(space.bookingBufferDays),
  );
  const [maxBookingDays, setMaxBookingDays] = useState(
    String(space.maxBookingDays),
  );
  const [minPartySize, setMinPartySize] = useState(String(space.minPartySize));
  const [maxPartySize, setMaxPartySize] = useState(String(space.maxPartySize));
  const [active, setActive] = useState(space.active);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/spaces/${space.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name,
          address,
          contact,
          adminEmail,
          notices: linesToList(noticesText),
          heroImage,
          menuImages: linesToList(menuImagesText),
          otherImages: linesToList(otherImagesText),
          bookingBufferDays: Number(bookingBufferDays),
          maxBookingDays: Number(maxBookingDays),
          minPartySize: Number(minPartySize),
          maxPartySize: Number(maxPartySize),
          active,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "저장에 실패했습니다.");
        setSaving(false);
        return;
      }
      router.push(routes.adminSpaces);
      router.refresh();
      setSaving(false);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium text-rsvd-text">
          속성 수정{" "}
          <span className="font-normal text-rsvd-text-muted">/ {space.name}</span>
        </h1>
        <Link
          href={routes.adminSpaces}
          className="text-sm text-rsvd-text-muted transition hover:text-rsvd-brand"
        >
          ← 공간 목록
        </Link>
      </div>

      <div className="max-w-2xl space-y-5 rounded-2xl border border-rsvd-border bg-rsvd-surface p-5 md:p-6">
        <Field label="공간명칭">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
          />
        </Field>

        <Field label="주소">
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={2}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="연락처">
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="관리자 이메일">
            <input
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
        </div>

        <Field label="공지 (줄바꿈으로 구분)">
          <textarea
            value={noticesText}
            onChange={(event) => setNoticesText(event.target.value)}
            rows={4}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
          />
        </Field>

        <Field label="대표 이미지 URL">
          <input
            value={heroImage}
            onChange={(event) => setHeroImage(event.target.value)}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
          />
        </Field>

        <Field label="메뉴 이미지 URL (줄바꿈으로 구분)">
          <textarea
            value={menuImagesText}
            onChange={(event) => setMenuImagesText(event.target.value)}
            rows={3}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
          />
        </Field>

        <Field label="기타 이미지 URL (줄바꿈으로 구분)">
          <textarea
            value={otherImagesText}
            onChange={(event) => setOtherImagesText(event.target.value)}
            rows={3}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="예약여유일">
            <input
              type="number"
              min={0}
              value={bookingBufferDays}
              onChange={(event) => setBookingBufferDays(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="최대예약가능일">
            <input
              type="number"
              min={0}
              value={maxBookingDays}
              onChange={(event) => setMaxBookingDays(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="최소 인원">
            <input
              type="number"
              min={1}
              value={minPartySize}
              onChange={(event) => setMinPartySize(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="최대 인원">
            <input
              type="number"
              min={1}
              value={maxPartySize}
              onChange={(event) => setMaxPartySize(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-rsvd-border bg-rsvd-bg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-rsvd-text">활성 상태</p>
            <p className="mt-0.5 text-xs text-rsvd-text-muted">
              현재예약수 {adminSpaceReservationCount(space)} · 단골수{" "}
              {adminSpaceRegularCount(space)}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label="활성 여부"
            onClick={() => setActive((value) => !value)}
            className={`relative h-6 w-11 rounded-full transition ${
              active ? "bg-rsvd-brand" : "bg-rsvd-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-rsvd-surface transition ${
                active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {error ? (
          <p className="text-sm text-rsvd-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Link
            href={routes.adminSpaces}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-4 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
          >
            취소
          </Link>
          <button
            type="button"
            disabled={saving || !name.trim() || !address.trim()}
            onClick={() => {
              void handleSave();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
          >
            {saving ? "…" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
        {label}
      </span>
      {children}
    </label>
  );
}
