"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  SectionSaveState,
  SectionSaveStateChangeHandler,
} from "../missions/[missionId]/components/editor-save.types";

export interface UseSectionSaveStateParams {
  hasPendingChanges: boolean;
  isBusy: boolean;
  hasValidationIssues?: boolean;
  validationIssueCount?: number;
  onSaveStateChange?: SectionSaveStateChangeHandler;
}

export interface UseSectionSaveStateReturn {
  getHasPendingChanges: () => boolean;
  getIsBusy: () => boolean;
}

export function useSectionSaveState({
  hasPendingChanges,
  isBusy,
  hasValidationIssues = false,
  validationIssueCount = 0,
  onSaveStateChange,
}: UseSectionSaveStateParams): UseSectionSaveStateReturn {
  const pendingRef = useRef(hasPendingChanges);
  pendingRef.current = hasPendingChanges;

  const busyRef = useRef(isBusy);
  busyRef.current = isBusy;

  const prevRef = useRef<SectionSaveState | null>(null);

  useEffect(() => {
    const next: SectionSaveState = {
      hasPendingChanges,
      isBusy,
      hasValidationIssues,
      validationIssueCount,
    };

    const prev = prevRef.current;
    if (
      prev &&
      prev.hasPendingChanges === next.hasPendingChanges &&
      prev.isBusy === next.isBusy &&
      prev.hasValidationIssues === next.hasValidationIssues &&
      prev.validationIssueCount === next.validationIssueCount
    ) {
      return;
    }

    prevRef.current = next;
    onSaveStateChange?.(next);
  }, [hasPendingChanges, isBusy, hasValidationIssues, validationIssueCount, onSaveStateChange]);

  return {
    getHasPendingChanges: useCallback(() => pendingRef.current, []),
    getIsBusy: useCallback(() => busyRef.current, []),
  };
}
