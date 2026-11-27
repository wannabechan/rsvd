"use client";

import { avatarToneForEmail, emailInitial, type AuthUser } from "@/domain/auth";

type UserAvatarProps = {
  user: Pick<AuthUser, "email" | "avatarUrl">;
  sizeClassName?: string;
  textClassName?: string;
};

export function UserAvatar({
  user,
  sizeClassName = "h-8 w-8",
  textClassName = "text-sm",
}: UserAvatarProps) {
  const tone = avatarToneForEmail(user.email);
  const initial = emailInitial(user.email);

  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${sizeClassName}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium leading-none ${sizeClassName} ${textClassName}`}
      style={{ backgroundColor: tone.background, color: tone.foreground }}
    >
      {initial}
    </span>
  );
}
