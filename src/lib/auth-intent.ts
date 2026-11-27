/**
 * Post-login navigation intent (web + future native webview).
 * Stored in sessionStorage so login can avoid blocking searchParams prerender.
 */

const STORAGE_KEY = "rsvd:auth-intent";

/** Dispatched when header "로그인" should force the initial email step. */
export const LOGIN_RESET_EVENT = "rsvd:login-reset";

export function requestLoginReset() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(LOGIN_RESET_EVENT));
}

export type AuthIntent =
  | { type: "path"; path: string }
  | { type: "open-chat"; spaceId: string; spaceName: string };

export function saveAuthIntent(intent: AuthIntent): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export function consumeAuthIntent(): AuthIntent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthIntent;
  } catch {
    return null;
  }
}
