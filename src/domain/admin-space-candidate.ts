/**
 * Admin space-candidate (매장후보) domain — inbound lead rows.
 * Keep free of React/Next/DOM.
 */

export const SPACE_CANDIDATE_CHANNELS = ["인스타그램"] as const;

export type SpaceCandidateChannel = (typeof SPACE_CANDIDATE_CHANNELS)[number];

export type AdminSpaceCandidate = {
  id: string;
  channel: SpaceCandidateChannel;
  /** Channel account handle / id. */
  handle: string;
  /** ISO timestamp when the candidate row was created. */
  appliedAt: string;
  /** Matched platform user email (empty until admin matches). */
  email: string;
  /** 6-digit verification code while active; empty when none / expired. */
  verifyCode: string;
  /** ISO expiry for verifyCode; empty when none. */
  verifyCodeExpiresAt: string;
  /** How many invite/request submissions for this channel+handle. */
  requestCount: number;
  /**
   * True when the candidate has been fully registered as a store.
   * Manual toggle is disabled; flipped on by 사장님 인증.
   */
  registrationComplete: boolean;
  /** Linked admin catalog space id once auto-created; empty until then. */
  spaceId: string;
};

/** Verify codes stay valid for 3 days. */
export const VERIFY_CODE_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export function createVerifyCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, "0");
}

export function createVerifyCodeExpiresAt(nowMs = Date.now()): string {
  return new Date(nowMs + VERIFY_CODE_TTL_MS).toISOString();
}

/** Remaining time as total hours:minutes:seconds (e.g. 71:05:09). */
export function formatVerifyCountdown(remainingMs: number): string {
  const clamped = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function verifyCodeRemainingMs(
  expiresAt: string,
  nowMs = Date.now(),
): number {
  const ends = Date.parse(expiresAt);
  if (!Number.isFinite(ends)) {
    return 0;
  }
  return Math.max(0, ends - nowMs);
}

export function isVerifyCodeActive(
  candidate: Pick<AdminSpaceCandidate, "verifyCode" | "verifyCodeExpiresAt">,
  nowMs = Date.now(),
): boolean {
  if (!candidate.verifyCode.trim() || !candidate.verifyCodeExpiresAt.trim()) {
    return false;
  }
  return verifyCodeRemainingMs(candidate.verifyCodeExpiresAt, nowMs) > 0;
}

/** Drop expired codes so list/save paths stay clean. */
export function withFreshVerifyCode(
  candidate: AdminSpaceCandidate,
  nowMs = Date.now(),
): AdminSpaceCandidate {
  if (!candidate.verifyCode && !candidate.verifyCodeExpiresAt) {
    return candidate;
  }
  if (isVerifyCodeActive(candidate, nowMs)) {
    return candidate;
  }
  return {
    ...candidate,
    verifyCode: "",
    verifyCodeExpiresAt: "",
  };
}

export function candidateHasSavedEmail(
  candidate: Pick<AdminSpaceCandidate, "email">,
): boolean {
  return candidate.email.trim().length > 0;
}

export function formatCandidateAppliedAt(appliedAt: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(appliedAt)) {
    return appliedAt.slice(0, 10);
  }
  const parsed = Date.parse(appliedAt);
  if (!Number.isFinite(parsed)) {
    return appliedAt;
  }
  return new Date(parsed).toISOString().slice(0, 10);
}

export function isSpaceCandidateChannel(
  value: string,
): value is SpaceCandidateChannel {
  return (SPACE_CANDIDATE_CHANNELS as readonly string[]).includes(value);
}

export function createSpaceCandidateId(): string {
  return `candidate-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/** Trim and drop @ so "@shop" and "shop" store/match the same. */
export function normalizeCandidateHandle(handle: string): string {
  return handle.trim().replace(/@/g, "");
}

export function candidateHandlesMatch(a: string, b: string): boolean {
  return (
    normalizeCandidateHandle(a).toLowerCase() ===
    normalizeCandidateHandle(b).toLowerCase()
  );
}

export function candidateRequestCount(candidate: AdminSpaceCandidate): number {
  const count = Number(candidate.requestCount);
  return Number.isFinite(count) && count >= 1 ? Math.floor(count) : 1;
}

/** User home: title for the + button request modal. */
export const SPACE_CANDIDATE_REQUEST_TITLE = "단골 매장 등록 요청하기";

/** Shown after the user submits channel + handle, before confirming registration. */
export function spaceCandidateInviteMessage(nickname: string): string {
  const name = nickname.trim() || "회원";
  return `위 매장 사장님을 초대하겠습니다. 초대를 수락하시는대로 ${name} 님의 연락처 또는 이메일로 알려드릴게요!`;
}

/** Shown when the same channel + handle was requested before. */
export function spaceCandidateRepeatInviteMessage(nickname: string): string {
  const name = nickname.trim() || "회원";
  return `다시 한 번 위 매장 사장님을 초대하겠습니다. 초대를 수락하시는대로 ${name} 님의 연락처 또는 이메일로 알려드릴게요!`;
}
