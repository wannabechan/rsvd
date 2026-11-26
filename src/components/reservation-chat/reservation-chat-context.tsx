"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

export type ActiveReservationChat = {
  spaceId: string;
  spaceName: string;
};

type ReservationChatContextValue = {
  activeChat: ActiveReservationChat | null;
  startChat: (chat: ActiveReservationChat) => void;
  endChat: () => void;
};

const ReservationChatContext = createContext<ReservationChatContextValue | null>(
  null,
);

export function ReservationChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeChat, setActiveChat] = useState<ActiveReservationChat | null>(null);
  const pendingSpaceIdRef = useRef<string | null>(null);

  const startChat = useCallback((chat: ActiveReservationChat) => {
    pendingSpaceIdRef.current = chat.spaceId;
    setActiveChat(chat);
  }, []);

  const endChat = useCallback(() => {
    pendingSpaceIdRef.current = null;
    setActiveChat(null);
  }, []);

  useEffect(() => {
    if (!activeChat) {
      return;
    }

    const targetPath = `/space/${activeChat.spaceId}`;

    if (pathname === targetPath) {
      pendingSpaceIdRef.current = null;
      return;
    }

    // Keep chat while navigating from the list into the target space page.
    if (pendingSpaceIdRef.current === activeChat.spaceId) {
      return;
    }

    setActiveChat(null);
  }, [activeChat, pathname]);

  const value = useMemo(
    () => ({ activeChat, startChat, endChat }),
    [activeChat, startChat, endChat],
  );

  return (
    <ReservationChatContext.Provider value={value}>
      {children}
    </ReservationChatContext.Provider>
  );
}

export function useReservationChat() {
  const context = useContext(ReservationChatContext);

  if (!context) {
    throw new Error("useReservationChat must be used within ReservationChatProvider");
  }

  return context;
}
