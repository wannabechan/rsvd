/**
 * Runtime target detection for gradual native (App Store / Play) rollout.
 * Web stays primary; Capacitor (or similar) can host the same UI later.
 */

export type AppRuntime = "web" | "native-webview" | "unknown";

type CapacitorBridge = {
  isNativePlatform?: () => boolean;
};

export function getAppRuntime(): AppRuntime {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const capacitor = (window as Window & { Capacitor?: CapacitorBridge }).Capacitor;
  if (capacitor?.isNativePlatform?.()) {
    return "native-webview";
  }

  return "web";
}

export function isNativeRuntime(): boolean {
  return getAppRuntime() === "native-webview";
}
