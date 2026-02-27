"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  EditorSectionKey,
  EditorSectionRefMap,
  EditorSectionStateMap,
  MissionEditorAutosaveSnapshotV1,
  ServerSyncSummary,
} from "./editor-autosave.types";
import {
  clearMissionEditorAutosaveSnapshot,
  loadMissionEditorAutosaveSnapshot,
  saveMissionEditorAutosaveSnapshot,
} from "./editorAutosaveStorage";

interface UseMissionEditorAutosaveOptions {
  missionId: string;
  enabled: boolean;
  paused?: boolean;
  missionUpdatedAt: number;
  sectionRefs: EditorSectionRefMap;
  sectionStates: EditorSectionStateMap;
  onServerSync: () => Promise<ServerSyncSummary>;
  localDebounceMs?: number;
  serverSyncIntervalMs?: number;
}

const SECTION_KEYS: EditorSectionKey[] = ["basic", "reward", "action", "completion"];

export function useMissionEditorAutosave({
  missionId,
  enabled,
  paused = false,
  missionUpdatedAt,
  sectionRefs,
  sectionStates,
  onServerSync,
  localDebounceMs = 2000,
  serverSyncIntervalMs = 20000,
}: UseMissionEditorAutosaveOptions) {
  const [lastServerSyncAt, setLastServerSyncAt] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const restoreDoneRef = useRef<string | null>(null);

  const hasAnyPendingChanges = useMemo(
    () => SECTION_KEYS.some(key => sectionStates[key].hasPendingChanges),
    [sectionStates],
  );

  const buildSnapshot = useCallback(
    (meta?: {
      lastServerSyncAt?: number | null;
      invalidSections?: EditorSectionKey[];
      lastError?: string | null;
    }): MissionEditorAutosaveSnapshotV1 => {
      const now = Date.now();

      const sections = SECTION_KEYS.reduce<MissionEditorAutosaveSnapshotV1["sections"]>(
        (acc, key) => {
          acc[key] = {
            updatedAt: now,
            payload: sectionRefs[key].current?.exportDraftSnapshot() ?? null,
          };
          return acc;
        },
        {
          basic: { updatedAt: now, payload: null },
          reward: { updatedAt: now, payload: null },
          action: { updatedAt: now, payload: null },
          completion: { updatedAt: now, payload: null },
        },
      );

      return {
        version: 1,
        missionId,
        updatedAt: now,
        sections,
        meta: {
          lastServerSyncAt: meta?.lastServerSyncAt ?? lastServerSyncAt,
          invalidSections: meta?.invalidSections ?? [],
          lastError: meta?.lastError ?? lastError,
        },
      };
    },
    [lastError, lastServerSyncAt, missionId, sectionRefs],
  );

  const flushLocalDraft = useCallback(
    (meta?: {
      lastServerSyncAt?: number | null;
      invalidSections?: EditorSectionKey[];
      lastError?: string | null;
    }) => {
      if (!enabled) {
        return false;
      }

      const snapshot = buildSnapshot(meta);
      const saved = saveMissionEditorAutosaveSnapshot(snapshot);
      return saved;
    },
    [buildSnapshot, enabled],
  );

  const clearLocalDraft = useCallback(() => {
    clearMissionEditorAutosaveSnapshot(missionId);
    setLastServerSyncAt(null);
    setLastError(null);
  }, [missionId]);

  const runServerSyncNow = useCallback(async () => {
    if (!enabled || paused) {
      return;
    }

    try {
      const result = await onServerSync();
      const hasHardFailure = result.failedCount > 0;
      const now = Date.now();

      if (result.savedCount > 0) {
        setLastServerSyncAt(now);
      }

      setLastError(hasHardFailure ? "서버 동기화 실패" : null);
      flushLocalDraft({
        lastServerSyncAt: result.savedCount > 0 ? now : lastServerSyncAt,
        invalidSections: result.invalidSections,
        lastError: hasHardFailure ? "서버 동기화 실패" : null,
      });

      if (!hasHardFailure) {
        setLastError(null);
      }
    } catch {
      setLastError("서버 동기화 실패");
      flushLocalDraft({
        lastError: "서버 동기화 실패",
      });
    }
  }, [enabled, flushLocalDraft, lastServerSyncAt, onServerSync, paused]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (restoreDoneRef.current === missionId) {
      return;
    }

    const areRefsReady = SECTION_KEYS.every(key => Boolean(sectionRefs[key].current));
    if (!areRefsReady) {
      return;
    }

    const snapshot = loadMissionEditorAutosaveSnapshot(missionId);
    if (!snapshot || snapshot.updatedAt <= missionUpdatedAt) {
      restoreDoneRef.current = missionId;
      return;
    }

    let cancelled = false;
    const restore = async () => {
      for (const key of SECTION_KEYS) {
        if (cancelled) {
          return;
        }

        const payload = snapshot.sections[key]?.payload;
        if (payload === null || payload === undefined) {
          continue;
        }

        await sectionRefs[key].current?.importDraftSnapshot(payload);
      }

      if (cancelled) {
        return;
      }

      setLastServerSyncAt(snapshot.meta.lastServerSyncAt ?? null);
      setLastError(snapshot.meta.lastError ?? null);
      restoreDoneRef.current = missionId;
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, [enabled, missionId, missionUpdatedAt, sectionRefs, sectionStates]);

  useEffect(() => {
    if (!enabled || !hasAnyPendingChanges) {
      return;
    }

    const timer = window.setTimeout(() => {
      flushLocalDraft();
    }, localDebounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, flushLocalDraft, hasAnyPendingChanges, localDebounceMs, sectionStates]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushLocalDraft();
      }
    };

    const onPageHide = () => {
      flushLocalDraft();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [enabled, flushLocalDraft]);

  useEffect(() => {
    if (!enabled || paused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void runServerSyncNow();
    }, serverSyncIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, paused, runServerSyncNow, serverSyncIntervalMs]);

  return {
    flushLocalDraft,
    clearLocalDraft,
    runServerSyncNow,
  };
}
