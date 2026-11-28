"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AdminAddressSearchField } from "@/components/admin/admin-address-search-field";
import { AdminSpaceImageField } from "@/components/admin/admin-space-image-field";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import {
  ADMIN_SPACE_REQUIRED_FIELD_MESSAGE,
  adminSpaceMissingRequiredFields,
  inviteHandleFromSpaceName,
  noticesToEditableText,
  SPACE_HERO_IMAGE_MAX,
  SPACE_INVITE_CHANNEL_DEFAULT,
  SPACE_MENU_IMAGES_MAX,
  SPACE_NAME_PLACEHOLDER,
  SPACE_NOTICE_PLACEHOLDER,
  SPACE_OTHER_IMAGES_MAX,
  type AdminSpace,
  type AdminSpaceRequiredFieldKey,
} from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminSpaceEditFormProps = {
  mode: "create" | "edit";
  space: AdminSpace;
};

type FieldErrors = Partial<Record<AdminSpaceRequiredFieldKey, string>>;

function fieldDomId(key: AdminSpaceRequiredFieldKey): string {
  return `space-field-${key}`;
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const lockAdminEmail = Boolean(space.createdFromCandidate);
  const inviteChannel = space.inviteChannel || SPACE_INVITE_CHANNEL_DEFAULT;
  const inviteHandle =
    space.inviteHandle ||
    (mode === "create" ? inviteHandleFromSpaceName(name) : "") ||
    "";

  function clearFieldError(key: AdminSpaceRequiredFieldKey) {
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function requiredFieldValues() {
    return {
      name,
      address,
      contact,
      adminEmail,
      inviteChannel,
      inviteHandle,
      notices: noticesText,
      heroImage: heroImages[0] ?? "",
      bookingBufferDays,
      maxBookingDays,
      minPartySize,
      maxPartySize,
    };
  }

  function showRequiredFieldErrors(): boolean {
    const missing = adminSpaceMissingRequiredFields(requiredFieldValues());
    if (missing.length === 0) {
      setFieldErrors({});
      return false;
    }
    const next: FieldErrors = {};
    for (const key of missing) {
      next[key] = ADMIN_SPACE_REQUIRED_FIELD_MESSAGE;
    }
    setFieldErrors(next);
    window.requestAnimationFrame(() => {
      document
        .getElementById(fieldDomId(missing[0]))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return true;
  }

  async function handleSave() {
    setError(null);
    if (showRequiredFieldErrors()) {
      return;
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
        <Field
          id={fieldDomId("name")}
          label="공간명칭"
          error={fieldErrors.name}
        >
          <input
            value={name}
            onChange={(event) => {
              clearFieldError("name");
              setName(event.target.value);
            }}
            placeholder={SPACE_NAME_PLACEHOLDER}
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
          />
        </Field>

        <div id={fieldDomId("address")}>
          <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
            주소
          </span>
          <AdminAddressSearchField
            value={address}
            onChange={(next) => {
              clearFieldError("address");
              setAddress(next);
            }}
          />
          {fieldErrors.address ? (
            <p className="mt-1.5 text-sm text-rsvd-danger" role="alert">
              {fieldErrors.address}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldDomId("contact")}
            label="연락처"
            error={fieldErrors.contact}
          >
            <input
              value={contact}
              onChange={(event) => {
                clearFieldError("contact");
                setContact(event.target.value);
              }}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field
            id={fieldDomId("adminEmail")}
            label="관리자 이메일"
            error={fieldErrors.adminEmail}
          >
            <input
              type="email"
              value={adminEmail}
              readOnly={lockAdminEmail}
              tabIndex={lockAdminEmail ? -1 : undefined}
              aria-readonly={lockAdminEmail || undefined}
              onChange={(event) => {
                clearFieldError("adminEmail");
                setAdminEmail(event.target.value);
              }}
              className={`auth-input w-full rounded-xl border border-rsvd-border px-3.5 py-2.5 text-sm text-rsvd-text ${
                lockAdminEmail ? "bg-rsvd-bg" : "bg-rsvd-surface"
              }`}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldDomId("inviteChannel")}
            label="초대채널"
            error={fieldErrors.inviteChannel}
          >
            <input
              value={inviteChannel}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-bg px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field
            id={fieldDomId("inviteHandle")}
            label="초대아이디"
            error={fieldErrors.inviteHandle}
          >
            <input
              value={inviteHandle}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-bg px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
        </div>

        <Field
          id={fieldDomId("notices")}
          label="공지사항"
          error={fieldErrors.notices}
        >
          <textarea
            value={noticesText}
            onChange={(event) => {
              clearFieldError("notices");
              setNoticesText(event.target.value);
            }}
            rows={6}
            placeholder={SPACE_NOTICE_PLACEHOLDER}
            className="auth-input w-full whitespace-pre-wrap rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
          />
        </Field>

        <div id={fieldDomId("heroImage")}>
          <AdminSpaceImageField
            label="대표 이미지 (필수)"
            urls={heroImages}
            maxCount={SPACE_HERO_IMAGE_MAX}
            onChange={(urls) => {
              clearFieldError("heroImage");
              setHeroImages(urls);
            }}
          />
          {fieldErrors.heroImage ? (
            <p className="mt-1.5 text-sm text-rsvd-danger" role="alert">
              {fieldErrors.heroImage}
            </p>
          ) : null}
        </div>
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
          <Field
            id={fieldDomId("bookingBufferDays")}
            label="몇일 전까지 예약 가능?"
            error={fieldErrors.bookingBufferDays}
          >
            <input
              type="number"
              min={0}
              value={bookingBufferDays}
              onChange={(event) => {
                clearFieldError("bookingBufferDays");
                setBookingBufferDays(event.target.value);
              }}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field
            id={fieldDomId("maxBookingDays")}
            label="몇일 후까지 예약 가능?"
            error={fieldErrors.maxBookingDays}
          >
            <input
              type="number"
              min={0}
              value={maxBookingDays}
              onChange={(event) => {
                clearFieldError("maxBookingDays");
                setMaxBookingDays(event.target.value);
              }}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field
            id={fieldDomId("minPartySize")}
            label="예약 가능 최소 인원?"
            error={fieldErrors.minPartySize}
          >
            <input
              type="number"
              min={1}
              value={minPartySize}
              onChange={(event) => {
                clearFieldError("minPartySize");
                setMinPartySize(event.target.value);
              }}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
          <Field
            id={fieldDomId("maxPartySize")}
            label="예약 가능 최대 인원?"
            error={fieldErrors.maxPartySize}
          >
            <input
              type="number"
              min={1}
              value={maxPartySize}
              onChange={(event) => {
                clearFieldError("maxPartySize");
                setMaxPartySize(event.target.value);
              }}
              className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-rsvd-border bg-rsvd-bg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-rsvd-text">활성 상태</p>
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
            disabled={saving}
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
  id,
  label,
  error,
  children,
}: {
  id?: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="block">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
          {label}
        </span>
        {children}
      </label>
      {error ? (
        <p className="mt-1.5 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
