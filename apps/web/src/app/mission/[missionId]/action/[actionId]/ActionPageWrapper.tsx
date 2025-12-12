"use client";

import { usePreventBack } from "@/hooks/common/usePreventBack";
import type { ReactNode } from "react";
import { useCallback } from "react";

interface ActionPageWrapperProps {
  children: ReactNode;
}

export function ActionPageWrapper({ children }: ActionPageWrapperProps) {
  const handlePopState = useCallback(() => {
    const event = new CustomEvent("action-back-pressed");
    window.dispatchEvent(event);
  }, []);

  usePreventBack({
    enabled: true,
    onPopState: handlePopState,
    checkState: state => state?.fromSurveyQuestion === true,
  });

  return <>{children}</>;
}
