"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface HistoryState {
  preventBack?: boolean;
  url?: string;
}

interface UsePreventBackOptions {
  redirectTo?: string;
  enabled?: boolean;
  onPopState?: (event: PopStateEvent) => void;
  currentPath?: string;
}

export function usePreventBack({
  redirectTo,
  enabled = true,
  onPopState,
  currentPath,
}: UsePreventBackOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const isRedirectingRef = useRef(false);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (!enabled || !redirectTo) {
      return;
    }

    const effectiveCurrentPath = currentPath || pathname;

    if (pathname !== effectiveCurrentPath && previousPathnameRef.current === effectiveCurrentPath) {
      if (!isRedirectingRef.current) {
        isRedirectingRef.current = true;
        router.replace(redirectTo);
      }
      return;
    }

    previousPathnameRef.current = pathname;
  }, [pathname, redirectTo, enabled, router, currentPath]);

  useEffect(() => {
    if (!enabled || !redirectTo) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const currentUrl = window.location.pathname + window.location.search;

    window.history.replaceState({ preventBack: true, url: currentUrl }, "", currentUrl);
    window.history.pushState({ preventBack: true, url: currentUrl }, "", currentUrl);

    const handlePopState = (event: PopStateEvent) => {
      if (isRedirectingRef.current) {
        return;
      }

      const state = event.state as HistoryState | null;

      if (state?.preventBack || window.location.pathname !== currentUrl.split("?")[0]) {
        isRedirectingRef.current = true;
        window.history.pushState({ preventBack: true, url: currentUrl }, "", currentUrl);

        if (onPopState) {
          onPopState(event);
        } else {
          window.location.href = redirectTo;
        }
      }
    };

    window.addEventListener("popstate", handlePopState, { capture: true });

    return () => {
      isRedirectingRef.current = false;
      window.removeEventListener("popstate", handlePopState, { capture: true });
    };
  }, [redirectTo, enabled, onPopState]);
}
