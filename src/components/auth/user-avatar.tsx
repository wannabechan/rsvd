"use client";

import { avatarToneForEmail, emailInitial, type AuthUser } from "@/domain/auth";

type UserAvatarProps = {
  user: Pick<AuthUser, "email" | "avatarUrl" | "role" | "ownerVerified">;
  sizeClassName?: string;
  textClassName?: string;
};

/** admin / manager (ownerVerified) get a privilege ring in the header avatar. */
export function hasPrivilegeAvatarRing(
  user: Pick<AuthUser, "role" | "ownerVerified">,
): boolean {
  return user.role === "admin" || user.ownerVerified;
}

/** admin → success ring; manager(ownerVerified) → accent; others → none. */
function privilegeRingClass(
  user: Pick<AuthUser, "role" | "ownerVerified">,
): string {
  if (user.role === "admin") {
    return "ring-[3px] ring-rsvd-success";
  }
  if (user.ownerVerified) {
    return "ring-[3px] ring-rsvd-accent";
  }
  return "";
}

export function UserAvatar({
  user,
  sizeClassName = "h-8 w-8",
  textClassName = "text-sm",
}: UserAvatarProps) {
  const tone = avatarToneForEmail(user.email);
  const initial = emailInitial(user.email);
  const ringClass = privilegeRingClass(user);

  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${sizeClassName} ${ringClass}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium leading-none ${sizeClassName} ${textClassName} ${ringClass}`}
      style={{ backgroundColor: tone.background, color: tone.foreground }}
    >
      {initial}
    </span>
  );
}
