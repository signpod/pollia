"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useEditorMissionBootstrap } from "../model/EditorMissionBootstrapContext";

export function useEditorBootstrapScrollController(
  missionId: string,
  targetRef: RefObject<HTMLDivElement | null>,
) {
  const { peekDraft, clearDraft } = useEditorMissionBootstrap();

  useEffect(() => {
    const draft = peekDraft(missionId);
    if (!draft) return;
    const timer = setTimeout(() => {
      targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      clearDraft(missionId);
    }, 100);
    return () => clearTimeout(timer);
  }, [missionId, peekDraft, clearDraft, targetRef]);
}
