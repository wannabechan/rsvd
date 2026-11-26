"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  const startChat = useCallback((chat: ActiveReservationChat) => {
    setActiveChat(chat);
  }, []);

  const endChat = useCallback(() => {
    setActiveChat(null);
  }, []);

  useEffect(() => {
    if (!activeChat) {
      return;
    }

    if (pathname !== `/space/${activeChat.spaceId}`) {
      setActiveChat(null);
    }
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
