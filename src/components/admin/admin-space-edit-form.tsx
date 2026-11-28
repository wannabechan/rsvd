"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AdminAddressSearchField } from "@/components/admin/admin-address-search-field";
import { AdminSpaceImageField } from "@/components/admin/admin-space-image-field";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import {
  adminSpaceRegularCount,
  adminSpaceRequiredFieldsError,
  adminSpaceReservationCount,
  inviteHandleFromSpaceName,
  isCandidateOnboardingDraft,
  noticesToEditableText,
  SPACE_HERO_IMAGE_MAX,
  SPACE_INVITE_CHANNEL_DEFAULT,
  SPACE_MENU_IMAGES_MAX,
  SPACE_NAME_PLACEHOLDER,
  SPACE_NOTICE_PLACEHOLDER,
  SPACE_OTHER_IMAGES_MAX,
  type AdminSpace,
} from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminSpaceEditFormProps = {
  mode: "create" | "edit";
  space: AdminSpace;
};

export function AdminSpaceEditForm({ mode, space }: AdminSpaceEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(space.name);
  const [address, setAddress] = useState(space.address);
  const [contact, setContact] = useState(space.contact);
  const [adminEmail, setAdminEmail] = useState(space.adminEmail);
  const [noticesText, setNoticesText] = useState(
    noticesToEditableText(space.notices),
  );
  const [heroImages, setHeroImages] = useState(
    space.heroImage ? [space.heroImage] : [],
  );
  const [menuImages, setMenuImages] = useState(space.menuImages);
  const [otherImages, setOtherImages] = useState(space.otherImages);
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

  const lockAdminEmail = Boolean(space.createdFromCandidate);
  const onboardingDraft = isCandidateOnboardingDraft({
    active,
    createdFromCandidate: space.createdFromCandidate,
  });

  async function handleSave() {
    setError(null);
    if (!onboardingDraft) {
      const requiredError = adminSpaceRequiredFieldsError({
        name,
        address,
        contact,
        adminEmail,
        notices: noticesText,
        heroImage: heroImages[0] ?? "",
      });
      if (requiredError) {
        setError(requiredError);
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        name,
        address,
        contact,
        adminEmail,
        notices: noticesText,
        heroImage: heroImages[0] ?? "",
        menuImages,
        otherImages,
        bookingBufferDays: Number(bookingBufferDays),
        maxBookingDays: Number(maxBookingDays),
        minPartySize: Number(minPartySize),
        maxPartySize: Number(maxPartySize),
        active,
      };

      const response = await fetch(
        mode === "create"
          ? "/api/admin/spaces"
          : `/api/admin/spaces/${space.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      );
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
          {mode === "create" ? "매장 추가" : "매장 수정"}
          {mode === "edit" ? (
            <span className="font-normal text-rsvd-text-muted">
              {" "}
              / {space.name}
            </span>
          ) : null}
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
            placeholder={SPACE_NAME_PLACEHOLDER}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
            주소
          </span>
          <AdminAddressSearchField value={address} onChange={setAddress} />
        </div>

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
              readOnly={lockAdminEmail}
              tabIndex={lockAdminEmail ? -1 : undefined}
              aria-readonly={lockAdminEmail || undefined}
              onChange={(event) => setAdminEmail(event.target.value)}
              className={`auth-input w-full rounded-xl border border-rsvd-border px-3.5 py-2.5 text-sm text-rsvd-text ${
                lockAdminEmail ? "bg-rsvd-bg" : "bg-rsvd-surface"
              }`}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="초대채널">
            <input
              value={space.inviteChannel || SPACE_INVITE_CHANNEL_DEFAULT}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-bg px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="초대아이디">
            <input
              value={
                space.inviteHandle ||
                (mode === "create" ? inviteHandleFromSpaceName(name) : "") ||
                ""
              }
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-bg px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
        </div>

        <Field label="공지사항">
          <textarea
            value={noticesText}
            onChange={(event) => setNoticesText(event.target.value)}
            rows={6}
            placeholder={SPACE_NOTICE_PLACEHOLDER}
            className="auth-input w-full whitespace-pre-wrap rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
          />
        </Field>

        <AdminSpaceImageField
          label={onboardingDraft ? "대표 이미지" : "대표 이미지 (필수)"}
          urls={heroImages}
          maxCount={SPACE_HERO_IMAGE_MAX}
          onChange={setHeroImages}
        />
        <AdminSpaceImageField
          label="메뉴 이미지"
          urls={menuImages}
          maxCount={SPACE_MENU_IMAGES_MAX}
          onChange={setMenuImages}
        />
        <AdminSpaceImageField
          label="기타 이미지"
          urls={otherImages}
          maxCount={SPACE_OTHER_IMAGES_MAX}
          onChange={setOtherImages}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="몇일 전까지 예약 가능?">
            <input
              type="number"
              min={0}
              value={bookingBufferDays}
              onChange={(event) => setBookingBufferDays(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="몇일 후까지 예약 가능?">
            <input
              type="number"
              min={0}
              value={maxBookingDays}
              onChange={(event) => setMaxBookingDays(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="예약 가능 최소 인원?">
            <input
              type="number"
              min={1}
              value={minPartySize}
              onChange={(event) => setMinPartySize(event.target.value)}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field label="예약 가능 최대 인원?">
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
            {mode === "edit" ? (
              <p className="mt-0.5 text-xs text-rsvd-text-muted">
                현재예약수 {adminSpaceReservationCount(space)} · 단골수{" "}
                {adminSpaceRegularCount(space)}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-rsvd-text-muted">
                목록·상세에 노출할지 설정합니다.
              </p>
            )}
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
            disabled={
              saving ||
              (!onboardingDraft &&
                Boolean(
                  adminSpaceRequiredFieldsError({
                    name,
                    address,
                    contact,
                    adminEmail,
                    notices: noticesText,
                    heroImage: heroImages[0] ?? "",
                  }),
                ))
            }
            aria-busy={saving}
            onClick={() => {
              void handleSave();
            }}
            className={`inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong ${
              saving
                ? "disabled:bg-rsvd-brand disabled:text-rsvd-on-brand disabled:hover:bg-rsvd-brand"
                : "disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
            }`}
          >
            {saving ? <ButtonSpinner /> : "저장"}
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
