"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface HistoryState {
  fromSurveyQuestion?: boolean;
  preventBack?: boolean;
}

interface UsePreventBackOptions {
  redirectTo?: string;
  enabled?: boolean;
  onPopState?: (event: PopStateEvent) => void;
  checkState?: (state: HistoryState | null) => boolean;
}

export function usePreventBack({
  redirectTo,
  enabled = true,
  onPopState,
  checkState = state => state?.preventBack === true,
}: UsePreventBackOptions) {
  const router = useRouter();
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentUrl = window.location.pathname + window.location.search;
    const currentState = (window.history.state as HistoryState) ?? {};

    window.history.replaceState({ ...currentState, fromSurveyQuestion: true }, "", "");
    window.history.pushState({ ...currentState, preventBack: true }, "", currentUrl);

    const handlePopState = (event: PopStateEvent) => {
      if (isRedirectingRef.current) {
        return;
      }

      const state = event.state as HistoryState | null;

      if (onPopState) {
        if (checkState(state)) {
          isRedirectingRef.current = true;
          window.history.pushState({ ...currentState, preventBack: true }, "", currentUrl);
          onPopState(event);
        }
      } else if (redirectTo && checkState(state)) {
        isRedirectingRef.current = true;
        window.history.pushState({ ...currentState, preventBack: true }, "", currentUrl);
        router.push(redirectTo);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      isRedirectingRef.current = false;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [redirectTo, router, enabled, onPopState, checkState]);
}
