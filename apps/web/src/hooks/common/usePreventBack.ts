"use client";

import { useEffect, useRef } from "react";

interface UsePreventBackOptions {
  redirectTo: string;
  enabled?: boolean;
}

export function usePreventBack({ redirectTo, enabled = true }: UsePreventBackOptions) {
  const hasGuardRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    if (!hasGuardRef.current) {
      window.history.pushState(null, "");
      hasGuardRef.current = true;
    }

    const handlePopState = () => {
      window.location.replace(redirectTo);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [redirectTo, enabled]);
}
