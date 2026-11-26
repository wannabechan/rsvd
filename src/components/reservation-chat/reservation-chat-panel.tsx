"use client";

import { useEffect, useRef, useState } from "react";
import type { SpaceItem } from "@/data/spaces";

type ChatRole = "restaurant" | "guest";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: Date;
};

type ReservationChatPanelProps = {
  space: SpaceItem;
};

export function ReservationChatPanel({ space }: ReservationChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "restaurant",
      text: `안녕하세요. ${space.name}입니다. 원하시는 날짜·시간과 인원을 알려주시면 예약을 도와드릴게요.`,
      createdAt: new Date(),
    },
  ]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages]);

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
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} spaceName={space.name} />
        ))}
      </div>

      <form
        className="shrink-0 border-t border-rsvd-border bg-rsvd-surface px-3 py-3"
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
            placeholder="날짜, 시간, 인원을 알려주세요"
            className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm leading-snug text-rsvd-text placeholder:text-rsvd-text-muted"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
          >
            보내기
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatBubble({
  message,
  spaceName,
}: {
  message: ChatMessage;
  spaceName: string;
}) {
  const isGuest = message.role === "guest";
  const timeLabel = formatMessageTime(message.createdAt);

  return (
    <div className={`flex flex-col ${isGuest ? "items-end" : "items-start"}`}>
      {!isGuest ? (
        <p className="mb-1 px-1 text-xs font-medium text-rsvd-text-muted">{spaceName}</p>
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
    </div>
  );
}

function formatMessageTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
