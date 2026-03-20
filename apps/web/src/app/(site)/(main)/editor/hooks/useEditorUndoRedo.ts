"use client";

import type { EditorMissionDraftPayload } from "@/types/mission-editor-draft";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MAX_HISTORY = 30;

interface UseEditorUndoRedoParams {
  collectSnapshot: () => EditorMissionDraftPayload;
  applySnapshot: (payload: EditorMissionDraftPayload) => Promise<void>;
  enabled: boolean;
  maxHistory?: number;
}

export interface UseEditorUndoRedoResult {
  pushSnapshot: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  getIsUndoRedoInProgress: () => boolean;
}

export function useEditorUndoRedo({
  collectSnapshot,
  applySnapshot,
  enabled,
  maxHistory = DEFAULT_MAX_HISTORY,
}: UseEditorUndoRedoParams): UseEditorUndoRedoResult {
  const historyRef = useRef<EditorMissionDraftPayload[]>([]);
  const cursorRef = useRef(-1);
  const isUndoRedoInProgressRef = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncCanFlags = useCallback(() => {
    setCanUndo(cursorRef.current > 0);
    setCanRedo(cursorRef.current < historyRef.current.length - 1);
  }, []);

  const pushSnapshot = useCallback(() => {
    if (!enabled || isUndoRedoInProgressRef.current) return;

    const snapshot = collectSnapshot();
    const history = historyRef.current;
    const cursor = cursorRef.current;

    if (cursor >= 0 && cursor < history.length) {
      if (JSON.stringify(history[cursor]) === JSON.stringify(snapshot)) return;
    }

    if (cursor < history.length - 1) {
      history.splice(cursor + 1);
    }

    history.push(snapshot);

    if (history.length > maxHistory) {
      history.splice(0, history.length - maxHistory);
    }

    cursorRef.current = history.length - 1;
    syncCanFlags();
  }, [collectSnapshot, enabled, maxHistory, syncCanFlags]);

  const undo = useCallback(async () => {
    if (!enabled || cursorRef.current <= 0) return;

    isUndoRedoInProgressRef.current = true;
    try {
      cursorRef.current -= 1;
      const snapshot = historyRef.current[cursorRef.current];
      if (snapshot) {
        await applySnapshot(snapshot);
      }
      syncCanFlags();
    } finally {
      setTimeout(() => {
        isUndoRedoInProgressRef.current = false;
      }, 0);
    }
  }, [applySnapshot, enabled, syncCanFlags]);

  const redo = useCallback(async () => {
    if (!enabled || cursorRef.current >= historyRef.current.length - 1) return;

    isUndoRedoInProgressRef.current = true;
    try {
      cursorRef.current += 1;
      const snapshot = historyRef.current[cursorRef.current];
      if (snapshot) {
        await applySnapshot(snapshot);
      }
      syncCanFlags();
    } finally {
      setTimeout(() => {
        isUndoRedoInProgressRef.current = false;
      }, 0);
    }
  }, [applySnapshot, enabled, syncCanFlags]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const modKey = e.metaKey || e.ctrlKey;
      if (!modKey) return;

      const key = e.key.toLowerCase();

      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        void undo();
        return;
      }

      if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        void redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, undo, redo]);

  const getIsUndoRedoInProgress = useCallback(() => isUndoRedoInProgressRef.current, []);

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    getIsUndoRedoInProgress,
  };
}
