"use client";

import { useEffect, useRef, useState } from "react";
import { ReservationDateCalendar } from "@/components/reservation-chat/reservation-date-calendar";
import type { SpaceItem } from "@/data/spaces";

type ChatRole = "system" | "restaurant" | "guest";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: Date;
  showDatePicker?: boolean;
};

type ReservationChatPanelProps = {
  space: SpaceItem;
};

export function ReservationChatPanel({ space }: ReservationChatPanelProps) {
  // Sample/test: no prior thread yet. Real data would hydrate previous messages here.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isReservationActive, setIsReservationActive] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages, selectedDate]);

  function startReservation() {
    if (isReservationActive) {
      return;
    }

    setIsReservationActive(true);
    setSelectedDate(null);
    setMessages((current) => [
      ...current,
      {
        id: `reservation-${Date.now()}`,
        role: "system",
        text: `안녕하세요. ${space.name} 예약을 진행합니다. 먼저 예약 희망일을 선택하세요.`,
        createdAt: new Date(),
        showDatePicker: true,
      },
    ]);
  }

  function cancelReservation() {
    if (!isReservationActive) {
      return;
    }

    setIsReservationActive(false);
    setSelectedDate(null);
    setMessages((current) => [
      ...current.map((message) =>
        message.showDatePicker ? { ...message, showDatePicker: false } : message,
      ),
      {
        id: `reservation-cancel-${Date.now()}`,
        role: "system",
        text: `${space.name} 예약 진행이 중단되었습니다.`,
        createdAt: new Date(),
      },
    ]);
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `guest-${Date.now()}`,
        role: "guest",
        text,
        createdAt: new Date(),
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-rsvd-bg">
      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
        aria-label={`${space.name} 예약챗`}
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-rsvd-text-muted">
            이전 대화가 없습니다.
          </p>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              spaceName={space.name}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-rsvd-border bg-rsvd-surface px-3 pt-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={isReservationActive ? cancelReservation : startReservation}
            className={`inline-flex h-9 items-center justify-center rounded-full border px-3.5 text-sm font-medium transition ${
              isReservationActive
                ? "border-rsvd-danger bg-rsvd-surface text-rsvd-danger hover:bg-rsvd-bg"
                : "border-rsvd-brand bg-rsvd-surface text-rsvd-brand hover:bg-rsvd-tint"
            }`}
          >
            {isReservationActive ? "예약중단" : "예약하기"}
          </button>
        </div>

        <form
          className="pb-3"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <label className="sr-only" htmlFor="reservation-chat-input">
            예약 메시지 입력
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="reservation-chat-input"
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="메시지를 입력하세요"
              className="reservation-chat-input max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm leading-snug text-rsvd-text placeholder:text-rsvd-text-muted"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="보내기"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rsvd-brand text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
            >
              <SendArrowIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  spaceName,
  selectedDate,
  onSelectDate,
}: {
  message: ChatMessage;
  spaceName: string;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
}) {
  const isGuest = message.role === "guest";
  const speakerLabel =
    message.role === "system" ? "rsvd." : message.role === "restaurant" ? spaceName : null;
  const timeLabel = formatMessageTime(message.createdAt);

  return (
    <div className={`flex flex-col ${isGuest ? "items-end" : "items-start"}`}>
      {speakerLabel ? (
        <p className="mb-1 px-1 text-xs font-medium text-rsvd-text-muted">{speakerLabel}</p>
      ) : null}
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed text-[var(--rsvd-chat-text)] ${
          isGuest
            ? "rounded-br-md bg-[var(--rsvd-chat-self-bg)]"
            : "rounded-bl-md border border-rsvd-border bg-[var(--rsvd-chat-restaurant-bg)]"
        }`}
      >
        {message.text}
      </div>
      <p className="mt-1 px-1 text-[0.7rem] text-rsvd-text-muted">{timeLabel}</p>
      {message.showDatePicker ? (
        <div className="mt-2 w-full max-w-[20rem]">
          <ReservationDateCalendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </div>
      ) : null}
    </div>
  );
}

function formatMessageTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function SendArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 -translate-x-[2px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6v6a4 4 0 0 1-4 4H6" />
      <path d="M10 12l-4 4 4 4" />
    </svg>
  );
}
