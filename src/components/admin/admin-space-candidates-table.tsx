"use client";

import { useEffect, useState } from "react";
import { IconPlus } from "@/components/admin/admin-icons";
import {
  candidateRequestCount,
  formatCandidateAppliedAt,
  SPACE_CANDIDATE_CHANNELS,
  type AdminSpaceCandidate,
  type SpaceCandidateChannel,
} from "@/domain/admin-space-candidate";

type AdminSpaceCandidatesTableProps = {
  initialCandidates: AdminSpaceCandidate[];
};

export function AdminSpaceCandidatesTable({
  initialCandidates,
}: AdminSpaceCandidatesTableProps) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [adding, setAdding] = useState(false);
  const [channel, setChannel] = useState<SpaceCandidateChannel>(
    SPACE_CANDIDATE_CHANNELS[0],
  );
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  function openAdd() {
    setError(null);
    setChannel(SPACE_CANDIDATE_CHANNELS[0]);
    setHandle("");
    setAdding(true);
  }

  async function handleSave() {
    setError(null);
    if (!handle.trim()) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    setSaving(true);
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
        setSaving(false);
        return;
      }
      setCandidates((current) => [data.candidate!, ...current]);
      setAdding(false);
      setSaving(false);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          aria-label="매장후보 추가"
          onClick={openAdd}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rsvd-border bg-rsvd-surface text-rsvd-text transition hover:bg-rsvd-bg"
        >
          <IconPlus />
        </button>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-rsvd-text-muted"
                >
                  등록된 매장후보가 없습니다.
                </td>
              </tr>
            ) : (
              candidates.map((item) => (
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
                    {item.email || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-rsvd-text-muted">
                    {item.verifyCode || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-rsvd-text">
                    {candidateRequestCount(item)}
                  </td>
                </tr>
              ))
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
                disabled={saving}
                onClick={() => setAdding(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                취소
              </button>
              <button
                type="button"
                disabled={saving || !handle.trim()}
                onClick={() => {
                  void handleSave();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                {saving ? "…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
