"use client";

import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  const nav = (
    window as unknown as {
      navigation?: {
        addEventListener: (type: string, cb: () => void) => void;
        removeEventListener: (type: string, cb: () => void) => void;
      };
    }
  ).navigation;
  if (nav) {
    nav.addEventListener("navigatesuccess", callback);
    return () => nav.removeEventListener("navigatesuccess", callback);
  }
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};

const getSnapshot = () => {
  const nav = (window as unknown as { navigation?: { canGoBack: boolean } }).navigation;
  if (nav?.canGoBack !== undefined) return nav.canGoBack;
  return window.history.length > 1;
};

const getServerSnapshot = () => false;

export function useCanGoBack() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
