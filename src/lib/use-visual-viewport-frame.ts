"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Size an app-shell element to the visual viewport so mobile keyboards
 * shrink the frame and bottom actions stay above the keyboard.
 */
export function useVisualViewportFrame<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof window === "undefined") {
      return;
    }

    const vv = window.visualViewport;

    const sync = () => {
      if (!vv) {
        node.style.height = "";
        node.style.transform = "";
        return;
      }
      node.style.height = `${Math.round(vv.height)}px`;
      node.style.transform =
        vv.offsetTop > 0 ? `translateY(${Math.round(vv.offsetTop)}px)` : "";
    };

    sync();
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);

    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      node.style.height = "";
      node.style.transform = "";
    };
  }, [enabled]);

  return ref;
}
