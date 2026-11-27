"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LoginBootContextValue = {
  boot: number;
  bumpLoginBoot: () => void;
};

const LoginBootContext = createContext<LoginBootContextValue | null>(null);

export function LoginBootProvider({ children }: { children: ReactNode }) {
  const [boot, setBoot] = useState(0);
  const bumpLoginBoot = useCallback(() => {
    setBoot((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({ boot, bumpLoginBoot }),
    [boot, bumpLoginBoot],
  );

  return (
    <LoginBootContext.Provider value={value}>{children}</LoginBootContext.Provider>
  );
}

export function useLoginBoot() {
  const context = useContext(LoginBootContext);
  if (!context) {
    throw new Error("useLoginBoot must be used within LoginBootProvider");
  }
  return context;
}
