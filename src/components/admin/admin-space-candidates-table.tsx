"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconLock,
  IconPlus,
  IconSearch,
} from "@/components/admin/admin-icons";
import { AdminUserMatchModal } from "@/components/admin/admin-user-match-modal";
import {
  candidateHasSavedEmail,
  candidateRequestCount,
  createVerifyCode,
  createVerifyCodeExpiresAt,
  formatCandidateAppliedAt,
  formatVerifyCountdown,
  isVerifyCodeActive,
  SPACE_CANDIDATE_CHANNELS,
  verifyCodeRemainingMs,
  withFreshVerifyCode,
  type AdminSpaceCandidate,
  type SpaceCandidateChannel,
} from "@/domain/admin-space-candidate";
import type { AdminUser } from "@/domain/admin-user";

type AdminSpaceCandidatesTableProps = {
  initialCandidates: AdminSpaceCandidate[];
  users: AdminUser[];
};

type CandidateDraft = {
  email: string;
  verifyCode: string;
  verifyCodeExpiresAt: string;
};

function draftFromCandidate(candidate: AdminSpaceCandidate): CandidateDraft {
  const fresh = withFreshVerifyCode(candidate);
  return {
    email: fresh.email,
    verifyCode: fresh.verifyCode,
    verifyCodeExpiresAt: fresh.verifyCodeExpiresAt,
  };
}

function draftsEqual(a: CandidateDraft, b: CandidateDraft): boolean {
  return (
    a.email === b.email &&
    a.verifyCode === b.verifyCode &&
    a.verifyCodeExpiresAt === b.verifyCodeExpiresAt
  );
}

function mergeCandidate(
  candidate: AdminSpaceCandidate,
  draft: CandidateDraft | undefined,
): AdminSpaceCandidate {
  if (!draft) {
    return withFreshVerifyCode(candidate);
  }
  return withFreshVerifyCode({
    ...candidate,
    email: draft.email,
    verifyCode: draft.verifyCode,
    verifyCodeExpiresAt: draft.verifyCodeExpiresAt,
  });
}

export function AdminSpaceCandidatesTable({
  initialCandidates,
  users,
}: AdminSpaceCandidatesTableProps) {
  const [savedCandidates, setSavedCandidates] = useState(() =>
    initialCandidates.map((row) => withFreshVerifyCode(row)),
  );
  const [drafts, setDrafts] = useState<Record<string, CandidateDraft>>({});
  const [adding, setAdding] = useState(false);
  const [channel, setChannel] = useState<SpaceCandidateChannel>(
    SPACE_CANDIDATE_CHANNELS[0],
  );
  const [handle, setHandle] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);
  const [savingTable, setSavingTable] = useState(false);
  const [generatingCodeId, setGeneratingCodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchCandidateId, setMatchCandidateId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setSavedCandidates(initialCandidates.map((row) => withFreshVerifyCode(row)));
    setDrafts({});
  }, [initialCandidates]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setDrafts((current) => {
      let changed = false;
      const next: Record<string, CandidateDraft> = {};
      for (const [id, draft] of Object.entries(current)) {
        if (
          draft.verifyCode &&
          draft.verifyCodeExpiresAt &&
          !isVerifyCodeActive(draft, nowMs)
        ) {
          const cleared = {
            ...draft,
            verifyCode: "",
            verifyCodeExpiresAt: "",
          };
          const saved = savedCandidates.find((row) => row.id === id);
          const baseline = saved ? draftFromCandidate(saved) : cleared;
          if (!draftsEqual(cleared, baseline)) {
            next[id] = cleared;
          }
          changed = true;
          continue;
        }
        next[id] = draft;
      }
      return changed ? next : current;
    });
  }, [nowMs, savedCandidates]);

  const rows = useMemo(
    () =>
      savedCandidates.map((candidate) =>
        mergeCandidate(candidate, drafts[candidate.id]),
      ),
    [savedCandidates, drafts],
  );

  const dirtyUpdates = useMemo(() => {
    return savedCandidates
      .map((saved) => {
        const draft = drafts[saved.id];
        if (!draft) {
          return null;
        }
        const baseline = draftFromCandidate(saved);
        if (draftsEqual(draft, baseline)) {
          return null;
        }
        return { id: saved.id, ...draft };
      })
      .filter((item): item is { id: string } & CandidateDraft => item !== null);
  }, [savedCandidates, drafts]);

  const isDirty = dirtyUpdates.length > 0;

  function openAdd() {
    setError(null);
    setChannel(SPACE_CANDIDATE_CHANNELS[0]);
    setHandle("");
    setAdding(true);
  }

  function setDraft(id: string, patch: Partial<CandidateDraft>) {
    setDrafts((current) => {
      const saved = savedCandidates.find((row) => row.id === id);
      if (!saved) {
        return current;
      }
      const baseline = draftFromCandidate(saved);
      const previous = current[id] ?? baseline;
      const next = { ...previous, ...patch };
      if (draftsEqual(next, baseline)) {
        const { [id]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [id]: next };
    });
  }

  async function handleAddSave() {
    setError(null);
    if (!handle.trim()) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    setSavingAdd(true);
    try {
      const response = await fetch("/api/admin/space-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ channel, handle }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        candidate?: AdminSpaceCandidate;
      };
      if (!response.ok || !data.ok || !data.candidate) {
        setError(data.error ?? "저장에 실패했습니다.");
        setSavingAdd(false);
        return;
      }
      setSavedCandidates((current) => [
        withFreshVerifyCode(data.candidate!),
        ...current,
      ]);
      setAdding(false);
      setSavingAdd(false);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSavingAdd(false);
    }
  }

  async function handleTableSave() {
    if (!isDirty) {
      return;
    }
    setError(null);
    setSavingTable(true);
    try {
      const response = await fetch("/api/admin/space-candidates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ updates: dirtyUpdates }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        candidates?: AdminSpaceCandidate[];
      };
      if (!response.ok || !data.ok || !data.candidates) {
        setError(data.error ?? "저장에 실패했습니다.");
        setSavingTable(false);
        return;
      }
      setSavedCandidates(data.candidates.map((row) => withFreshVerifyCode(row)));
      setDrafts({});
      setSavingTable(false);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSavingTable(false);
    }
  }

  async function handleGenerateCode(candidateId: string) {
    const saved = savedCandidates.find((row) => row.id === candidateId);
    if (
      !saved ||
      !candidateHasSavedEmail(saved) ||
      saved.registrationComplete
    ) {
      return;
    }
    const current = mergeCandidate(saved, drafts[candidateId]);
    if (
      current.registrationComplete ||
      isVerifyCodeActive(current, Date.now())
    ) {
      return;
    }

    const verifyCode = createVerifyCode();
    const verifyCodeExpiresAt = createVerifyCodeExpiresAt();
    setError(null);
    setGeneratingCodeId(candidateId);
    try {
      const response = await fetch("/api/admin/space-candidates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          updates: [
            {
              id: candidateId,
              email: saved.email,
              verifyCode,
              verifyCodeExpiresAt,
            },
          ],
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        candidates?: AdminSpaceCandidate[];
      };
      if (!response.ok || !data.ok || !data.candidates) {
        setError(data.error ?? "인증코드 저장에 실패했습니다.");
        setGeneratingCodeId(null);
        return;
      }
      const nextSaved = data.candidates.map((row) => withFreshVerifyCode(row));
      setSavedCandidates(nextSaved);
      setDrafts((currentDrafts) => {
        const draft = currentDrafts[candidateId];
        if (!draft) {
          return currentDrafts;
        }
        const persisted =
          nextSaved.find((row) => row.id === candidateId) ?? saved;
        const baseline = draftFromCandidate(persisted);
        // Keep only pending email edits; verify code is already persisted.
        if (draft.email !== baseline.email) {
          return {
            ...currentDrafts,
            [candidateId]: { ...baseline, email: draft.email },
          };
        }
        const { [candidateId]: _removed, ...rest } = currentDrafts;
        return rest;
      });
      setGeneratingCodeId(null);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setGeneratingCodeId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        {isDirty ? (
          <button
            type="button"
            disabled={savingTable}
            onClick={() => {
              void handleTableSave();
            }}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-rsvd-border bg-rsvd-brand px-3 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
          >
            {savingTable ? "…" : "저장"}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="매장후보 추가"
          onClick={openAdd}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rsvd-border bg-rsvd-surface text-rsvd-text transition hover:bg-rsvd-bg"
        >
          <IconPlus />
        </button>
      </div>

      {error && !adding ? (
        <p className="mb-3 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-rsvd-border bg-rsvd-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-rsvd-border text-xs text-rsvd-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">채널</th>
              <th className="px-4 py-3 font-medium">아이디</th>
              <th className="px-4 py-3 font-medium">신청일</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">인증코드</th>
              <th className="px-4 py-3 font-medium">요청횟수</th>
              <th className="px-4 py-3 font-medium">등록완료</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-rsvd-text-muted"
                >
                  등록된 매장후보가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const saved = savedCandidates.find((row) => row.id === item.id);
                const emailSaved = saved
                  ? candidateHasSavedEmail(saved)
                  : false;
                const registrationComplete = Boolean(item.registrationComplete);
                const codeActive =
                  !registrationComplete && isVerifyCodeActive(item, nowMs);
                const remaining = codeActive
                  ? verifyCodeRemainingMs(item.verifyCodeExpiresAt, nowMs)
                  : 0;
                const codeLocked =
                  !emailSaved ||
                  registrationComplete ||
                  generatingCodeId === item.id;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-rsvd-border last:border-b-0"
                  >
                    <td className="px-4 py-3.5 text-rsvd-text">{item.channel}</td>
                    <td className="px-4 py-3.5 font-medium text-rsvd-text">
                      {item.handle}
                    </td>
                    <td className="px-4 py-3.5 text-rsvd-text-muted">
                      {formatCandidateAppliedAt(item.appliedAt)}
                    </td>
                    <td className="px-4 py-3.5 text-rsvd-text-muted">
                      {item.email.trim() ? (
                        item.email
                      ) : (
                        <button
                          type="button"
                          aria-label="사용자 검색으로 이메일 매칭"
                          onClick={() => setMatchCandidateId(item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rsvd-text-muted transition hover:bg-rsvd-bg hover:text-rsvd-text"
                        >
                          <IconSearch />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-rsvd-text-muted">
                      {codeActive ? (
                        <span className="inline-flex items-baseline gap-2">
                          <span className="font-medium tabular-nums text-rsvd-text">
                            {item.verifyCode}
                          </span>
                          <span className="text-xs tabular-nums text-rsvd-text-muted">
                            {formatVerifyCountdown(remaining)}
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-label="인증코드 생성"
                          disabled={codeLocked}
                          onClick={() => {
                            void handleGenerateCode(item.id);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rsvd-text-muted transition hover:bg-rsvd-bg hover:text-rsvd-text disabled:cursor-not-allowed disabled:text-rsvd-disabled-text disabled:hover:bg-transparent disabled:hover:text-rsvd-disabled-text"
                        >
                          <IconLock />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-rsvd-text">
                      {candidateRequestCount(item)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.registrationComplete}
                        aria-label={`${item.handle} 등록완료`}
                        disabled
                        className={`relative h-6 w-11 cursor-not-allowed rounded-full transition ${
                          item.registrationComplete
                            ? "bg-rsvd-brand"
                            : "bg-rsvd-border"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-rsvd-surface transition ${
                            item.registrationComplete
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {adding ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="space-candidate-add-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
            <h2
              id="space-candidate-add-title"
              className="text-base font-medium text-rsvd-text"
            >
              매장후보 추가
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
                  채널
                </span>
                <input
                  value={channel}
                  readOnly
                  tabIndex={-1}
                  aria-readonly="true"
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-bg px-3.5 py-2.5 text-sm text-rsvd-text"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-rsvd-text">
                  아이디
                </span>
                <input
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  placeholder="@account"
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
                />
              </label>

              <p className="text-xs text-rsvd-text-muted">
                신청일은 저장 시 자동 입력됩니다. 이메일·인증코드는 추후
                매칭됩니다.
              </p>

              {error ? (
                <p className="text-sm text-rsvd-danger" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={savingAdd}
                onClick={() => setAdding(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                취소
              </button>
              <button
                type="button"
                disabled={savingAdd || !handle.trim()}
                onClick={() => {
                  void handleAddSave();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                {savingAdd ? "…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {matchCandidateId ? (
        <AdminUserMatchModal
          users={users}
          onCancel={() => setMatchCandidateId(null)}
          onMatch={(user) => {
            setDraft(matchCandidateId, {
              email: user.email,
              verifyCode: "",
              verifyCodeExpiresAt: "",
            });
            setMatchCandidateId(null);
          }}
        />
      ) : null}
    </div>
  );
}
