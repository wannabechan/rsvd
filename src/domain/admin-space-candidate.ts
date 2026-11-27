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
  /** Reserved for later matching — empty for now. */
  email: string;
  /** Reserved for later matching — empty for now. */
  verifyCode: string;
  /** How many invite/request submissions for this channel+handle. */
  requestCount: number;
};

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
