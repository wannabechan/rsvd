/** Kakao 우편번호(주소검색) — browser only. No API key required. */

const POSTCODE_SCRIPT_SRC =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export type KakaoPostcodeResult = {
  zonecode: string;
  address: string;
  addressType: "R" | "J";
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  bname: string;
  userSelectedType: "R" | "J";
};

type KakaoPostcodeConstructor = new (options: {
  oncomplete: (data: KakaoPostcodeResult) => void;
  onclose?: (state: "FORCE_CLOSE" | "COMPLETE_CLOSE") => void;
}) => { open: () => void };

declare global {
  interface Window {
    kakao?: { Postcode?: KakaoPostcodeConstructor };
    daum?: { Postcode?: KakaoPostcodeConstructor };
  }
}

let scriptPromise: Promise<void> | null = null;

function getPostcodeConstructor(): KakaoPostcodeConstructor | null {
  return window.kakao?.Postcode ?? window.daum?.Postcode ?? null;
}

export function loadKakaoPostcodeScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Postcode requires a browser."));
  }
  if (getPostcodeConstructor()) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${POSTCODE_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Kakao Postcode script failed to load.")),
        { once: true },
      );
      if (getPostcodeConstructor()) {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = POSTCODE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Kakao Postcode script failed to load."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/** Prefer road address; append building / dong extras like Kakao guide samples. */
export function formatKakaoPostcodeAddress(data: KakaoPostcodeResult): string {
  const base =
    data.userSelectedType === "R"
      ? data.roadAddress || data.address
      : data.jibunAddress || data.address;

  const extras: string[] = [];
  if (data.bname) {
    extras.push(data.bname);
  }
  if (data.buildingName) {
    extras.push(data.buildingName);
  }
  if (extras.length === 0) {
    return base;
  }
  return `${base} (${extras.join(", ")})`;
}

export async function openKakaoPostcodeSearch(
  onComplete: (address: string, data: KakaoPostcodeResult) => void,
): Promise<void> {
  await loadKakaoPostcodeScript();
  const Postcode = getPostcodeConstructor();
  if (!Postcode) {
    throw new Error("Kakao Postcode API is unavailable.");
  }

  new Postcode({
    oncomplete(data) {
      onComplete(formatKakaoPostcodeAddress(data), data);
    },
  }).open();
}
