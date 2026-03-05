"use client";

import { saveMissionEditorDraft } from "@/actions/mission/draft";
import { updateMission } from "@/actions/mission/update";
import type { GetMissionResponse } from "@/types/dto";
import {
  type EditorMissionDraftPayload,
  type LocalEditorDraftPayload,
  normalizeEditorMissionDraftPayload,
  selectLatestEditorMissionDraft,
  toServerEditorDraftPayload,
} from "@/types/mission-editor-draft";
import { MissionType } from "@prisma/client";
import { toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ServerActionLike,
  type ServerCompletionLike,
  getPublishBlockingMessage,
  validateEditorPublishFlow,
} from "../editor-publish-flow-validation";
import type { SectionSaveHandle, SectionSaveOptions, SectionSaveState } from "../editor-save.types";
import {
  getMissionEditorDraftStorageKey,
  loadMissionEditorDraftFromLocalStorage,
  saveMissionEditorDraftToLocalStorage,
} from "../editorMissionDraftStorage";
import {
  type PublishAvailability,
  computePublishAvailability,
} from "../models/editorMissionPublishModel";
import {
  type EditorSectionKey,
  type SectionSaveSummary,
  accumulateSectionSaveResult,
  computeManualSaveDisplayCounts,
  createEmptySectionSaveSummary,
} from "./editorMissionSaveSummaryModel";

const UNIFIED_SAVE_TOAST_ID = "editor-mission-save-result";
const PUBLISH_TOAST_ID = "editor-mission-publish-result";
const LOCAL_DRAFT_AUTOSAVE_THROTTLE_MS = 700;
const LOCAL_DRAFT_AUTOSAVE_MAX_WAIT_MS = 1500;
const WORKING_SET_VERSION_THROTTLE_MS = 120;

interface ResolveDraftToRestoreInput {
  missionId: string;
  mission: GetMissionResponse["data"];
  missionQueryData?: GetMissionResponse["data"] | null;
}

function resolveDraftToRestore({
  missionId,
  mission,
  missionQueryData,
}: ResolveDraftToRestoreInput): EditorMissionDraftPayload | null {
  if (mission.isActive || missionQueryData?.isActive) {
    return null;
  }

  const latestMission = missionQueryData ?? mission;
  const localDraft = loadMissionEditorDraftFromLocalStorage(missionId);
  const serverDraftRaw = normalizeEditorMissionDraftPayload(
    (latestMission as { editorDraft?: unknown }).editorDraft,
  );
  const serverDraft = serverDraftRaw ? toServerEditorDraftPayload(serverDraftRaw) : null;

  return selectLatestEditorMissionDraft(localDraft, serverDraft);
}

interface DraftClearResult {
  localDraftCleared: boolean;
  localDraftErrorMessage: string | null;
  serverDraftCleared: boolean;
  serverDraftErrorMessage: string | null;
}

interface MissionRefetchResult {
  data?: {
    data?: GetMissionResponse["data"];
  };
}

interface ActionsRefetchResult {
  data?: {
    data?: ServerActionLike[];
  };
}

interface CompletionsRefetchResult {
  data?: {
    data?: ServerCompletionLike[];
  };
}

export interface UseEditorMissionControllerParams {
  missionId: string;
  mission: GetMissionResponse["data"];
  currentTab: string;
  missionQueryData?: GetMissionResponse["data"] | null;
  actionsQueryData?: ServerActionLike[] | null;
  completionsQueryData?: ServerCompletionLike[] | null;
  isActionsLoading: boolean;
  isCompletionsLoading: boolean;
  refetchMission: () => Promise<MissionRefetchResult>;
  refetchActions: () => Promise<ActionsRefetchResult>;
  refetchCompletions: () => Promise<CompletionsRefetchResult>;
}

export interface UseEditorMissionControllerResult {
  refs: {
    basicInfoRef: RefObject<SectionSaveHandle | null>;
    rewardRef: RefObject<SectionSaveHandle | null>;
    actionRef: RefObject<SectionSaveHandle | null>;
    completionRef: RefObject<SectionSaveHandle | null>;
  };
  sectionBindings: {
    onBasicStateChange: (state: SectionSaveState) => void;
    onRewardStateChange: (state: SectionSaveState) => void;
    onActionStateChange: (state: SectionSaveState) => void;
    onCompletionStateChange: (state: SectionSaveState) => void;
    getCompletionDraftSnapshot: () => unknown | null;
    completionWorkingSetVersion: number;
    onActionWorkingSetChange: () => void;
    onCompletionWorkingSetChange: () => void;
  };
  viewState: {
    isPublished: boolean;
    canPublish: boolean;
    canSave: boolean;
    isSavingAll: boolean;
    isPublishing: boolean;
    hasAnyBusySection: boolean;
    hasAnyPendingChanges: boolean;
  };
  publishState: PublishAvailability;
  actions: {
    onSave: () => Promise<void>;
    onDraftSave: () => Promise<void>;
    onPublish: () => Promise<void>;
  };
}

function buildManualSaveToastMessage(params: {
  savedCount: number;
  skippedCount: number;
  failedCount: number;
}) {
  const { savedCount, skippedCount, failedCount } = params;
  const lines = [`저장 ${savedCount} / 스킵 ${skippedCount}`];
  if (failedCount > 0) {
    lines.push(`실패 ${failedCount}`);
  }

  return lines.join("\n");
}

function readUseAiCompletionFromBasicDraft(snapshot: unknown): boolean | null {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  if (!("useAiCompletion" in snapshot)) {
    return null;
  }

  const value = (snapshot as { useAiCompletion?: unknown }).useAiCompletion;
  return typeof value === "boolean" ? value : null;
}

export function useEditorMissionController({
  missionId,
  mission,
  currentTab,
  missionQueryData,
  actionsQueryData,
  completionsQueryData,
  isActionsLoading,
  isCompletionsLoading,
  refetchMission,
  refetchActions,
  refetchCompletions,
}: UseEditorMissionControllerParams): UseEditorMissionControllerResult {
  const basicInfoRef = useRef<SectionSaveHandle | null>(null);
  const rewardRef = useRef<SectionSaveHandle | null>(null);
  const actionRef = useRef<SectionSaveHandle | null>(null);
  const completionRef = useRef<SectionSaveHandle | null>(null);
  const draftRestoreAppliedRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const publishInFlightRef = useRef(false);
  const localDraftAutosaveRef = useRef<{
    timeoutId: number | null;
    idleId: number | null;
    maxWaitTimeoutId: number | null;
    lastPersistedAt: number;
    lastSerializedPayload: string | null;
  }>({
    timeoutId: null,
    idleId: null,
    maxWaitTimeoutId: null,
    lastPersistedAt: 0,
    lastSerializedPayload: null,
  });
  const completionWorkingSetThrottleRef = useRef<{
    timeoutId: number | null;
    lastUpdatedAt: number;
  }>({
    timeoutId: null,
    lastUpdatedAt: 0,
  });

  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(mission.isActive);
  const [completionWorkingSetVersion, setCompletionWorkingSetVersion] = useState(0);
  const [publishSnapshotVersion, setPublishSnapshotVersion] = useState(0);
  const [sectionStates, setSectionStates] = useState<Record<EditorSectionKey, SectionSaveState>>({
    basic: {
      hasPendingChanges: false,
      isBusy: false,
      hasValidationIssues: false,
      validationIssueCount: 0,
    },
    reward: {
      hasPendingChanges: false,
      isBusy: false,
      hasValidationIssues: false,
      validationIssueCount: 0,
    },
    action: {
      hasPendingChanges: false,
      isBusy: false,
      hasValidationIssues: false,
      validationIssueCount: 0,
    },
    completion: {
      hasPendingChanges: false,
      isBusy: false,
      hasValidationIssues: false,
      validationIssueCount: 0,
    },
  });

  const isEditorTab = currentTab === "editor";

  const updateSectionState = useCallback(
    (section: EditorSectionKey, nextState: SectionSaveState) => {
      setSectionStates(prev => {
        const currentState = prev[section];
        if (
          currentState.hasPendingChanges === nextState.hasPendingChanges &&
          currentState.isBusy === nextState.isBusy &&
          currentState.hasValidationIssues === nextState.hasValidationIssues &&
          currentState.validationIssueCount === nextState.validationIssueCount
        ) {
          return prev;
        }

        return {
          ...prev,
          [section]: nextState,
        };
      });
    },
    [],
  );

  const hasAnyPendingChanges = useMemo(
    () => Object.values(sectionStates).some(state => state.hasPendingChanges),
    [sectionStates],
  );
  const hasAnyBusySection = useMemo(
    () => Object.values(sectionStates).some(state => state.isBusy),
    [sectionStates],
  );

  const hasPendingChangesFromRefs = useCallback(
    () =>
      [basicInfoRef.current, rewardRef.current, actionRef.current, completionRef.current].some(
        handle => handle?.hasPendingChanges() ?? false,
      ),
    [],
  );

  useEffect(() => {
    setIsPublished(mission.isActive);
  }, [mission.id, mission.isActive]);

  useEffect(() => {
    if (!isEditorTab || typeof window === "undefined") {
      return;
    }

    const checkSectionRefsReady = () => {
      const refsReady =
        Boolean(basicInfoRef.current) &&
        Boolean(rewardRef.current) &&
        Boolean(actionRef.current) &&
        Boolean(completionRef.current);

      if (refsReady) {
        setPublishSnapshotVersion(prev => prev + 1);
        return true;
      }
      return false;
    };

    if (checkSectionRefsReady()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (checkSectionRefsReady()) {
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isEditorTab, missionId]);

  const missionEntryActionId = missionQueryData?.entryActionId ?? mission.entryActionId;
  const basicInfoDraftSnapshotForPublish = useMemo(() => {
    if (!basicInfoRef.current) {
      return undefined;
    }

    return basicInfoRef.current.exportDraftSnapshot();
  }, [publishSnapshotVersion]);

  const missionUseAiCompletionForPublish = useMemo(() => {
    const valueFromDraft = readUseAiCompletionFromBasicDraft(basicInfoDraftSnapshotForPublish);
    if (valueFromDraft !== null) {
      return valueFromDraft;
    }

    return (missionQueryData ?? mission).useAiCompletion;
  }, [basicInfoDraftSnapshotForPublish, mission, missionQueryData]);

  const actionDraftSnapshotForPublish = useMemo(() => {
    if (!actionRef.current) {
      return undefined;
    }

    return actionRef.current.exportDraftSnapshot();
  }, [publishSnapshotVersion]);

  const completionDraftSnapshotForPublish = useMemo(() => {
    if (!completionRef.current) {
      return undefined;
    }

    return completionRef.current.exportDraftSnapshot();
  }, [publishSnapshotVersion]);

  const publishState = useMemo(
    () =>
      computePublishAvailability({
        isPublished,
        entryActionId: missionEntryActionId,
        useAiCompletion: missionUseAiCompletionForPublish,
        serverActions: actionsQueryData,
        serverCompletions: completionsQueryData,
        actionDraftSnapshot: actionDraftSnapshotForPublish,
        completionDraftSnapshot: completionDraftSnapshotForPublish,
      }),
    [
      actionDraftSnapshotForPublish,
      actionsQueryData,
      completionDraftSnapshotForPublish,
      completionsQueryData,
      isPublished,
      missionEntryActionId,
      missionUseAiCompletionForPublish,
    ],
  );
  const canSave = publishState.isValidationDataReady && publishState.issues.length === 0;

  const collectLocalDraftPayload = useCallback((): LocalEditorDraftPayload => {
    return {
      basic: basicInfoRef.current?.exportDraftSnapshot() ?? null,
      reward: rewardRef.current?.exportDraftSnapshot() ?? null,
      action: actionRef.current?.exportDraftSnapshot() ?? null,
      completion: completionRef.current?.exportDraftSnapshot() ?? null,
    };
  }, []);

  const applyDraftPayload = useCallback(async (payload: EditorMissionDraftPayload) => {
    await Promise.all([
      Promise.resolve(basicInfoRef.current?.importDraftSnapshot(payload.basic ?? null)),
      Promise.resolve(rewardRef.current?.importDraftSnapshot(payload.reward ?? null)),
      Promise.resolve(actionRef.current?.importDraftSnapshot(payload.action ?? null)),
      Promise.resolve(completionRef.current?.importDraftSnapshot(payload.completion ?? null)),
    ]);
  }, []);

  const clearLocalDraftAutosaveTimers = useCallback(() => {
    const timerState = localDraftAutosaveRef.current;
    if (timerState.timeoutId !== null) {
      window.clearTimeout(timerState.timeoutId);
      timerState.timeoutId = null;
    }
    if (timerState.maxWaitTimeoutId !== null) {
      window.clearTimeout(timerState.maxWaitTimeoutId);
      timerState.maxWaitTimeoutId = null;
    }
    if (timerState.idleId !== null && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(timerState.idleId);
      timerState.idleId = null;
    }
  }, []);

  const clearPersistedDraft = useCallback(async (): Promise<DraftClearResult> => {
    let serverDraftCleared = false;
    let serverDraftErrorMessage: string | null = null;
    try {
      await saveMissionEditorDraft(missionId, null);
      serverDraftCleared = true;
    } catch (error) {
      serverDraftErrorMessage =
        error instanceof Error ? error.message : "서버 임시저장 정리에 실패했습니다.";
    }

    let localDraftCleared = false;
    let localDraftErrorMessage: string | null = null;
    if (serverDraftCleared) {
      if (typeof window === "undefined") {
        localDraftErrorMessage = "로컬 임시저장 정리에 실패했습니다.";
      } else {
        try {
          window.localStorage.removeItem(getMissionEditorDraftStorageKey(missionId));
          localDraftCleared = true;
        } catch (error) {
          localDraftErrorMessage =
            error instanceof Error ? error.message : "로컬 임시저장 정리에 실패했습니다.";
        }
      }
    }

    if (serverDraftCleared && localDraftCleared) {
      clearLocalDraftAutosaveTimers();
      localDraftAutosaveRef.current.lastSerializedPayload = null;
      localDraftAutosaveRef.current.lastPersistedAt = 0;
    }

    return {
      localDraftCleared,
      localDraftErrorMessage,
      serverDraftCleared,
      serverDraftErrorMessage,
    };
  }, [clearLocalDraftAutosaveTimers, missionId]);

  const flushLocalDraftAutosave = useCallback(() => {
    const timerState = localDraftAutosaveRef.current;
    timerState.idleId = null;
    if (timerState.maxWaitTimeoutId !== null) {
      window.clearTimeout(timerState.maxWaitTimeoutId);
      timerState.maxWaitTimeoutId = null;
    }

    if (!isEditorTab || !draftRestoreAppliedRef.current) {
      return;
    }

    if (
      !basicInfoRef.current ||
      !rewardRef.current ||
      !actionRef.current ||
      !completionRef.current
    ) {
      return;
    }

    if (!hasPendingChangesFromRefs()) {
      return;
    }

    const payload = collectLocalDraftPayload();
    const serializedPayload = JSON.stringify(payload);
    if (timerState.lastSerializedPayload === serializedPayload) {
      return;
    }

    const updatedAtMs = Date.now();
    const payloadWithMeta: LocalEditorDraftPayload = {
      ...payload,
      meta: {
        updatedAtMs,
      },
    };

    timerState.lastSerializedPayload = serializedPayload;
    timerState.lastPersistedAt = updatedAtMs;
    saveMissionEditorDraftToLocalStorage(missionId, payloadWithMeta);
  }, [collectLocalDraftPayload, hasPendingChangesFromRefs, isEditorTab, missionId]);

  const scheduleLocalDraftAutosave = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timerState = localDraftAutosaveRef.current;
    if (timerState.timeoutId !== null) {
      return;
    }

    const elapsed = Date.now() - timerState.lastPersistedAt;
    const waitMs = Math.max(0, LOCAL_DRAFT_AUTOSAVE_THROTTLE_MS - elapsed);

    timerState.timeoutId = window.setTimeout(() => {
      timerState.timeoutId = null;

      if (typeof window.requestIdleCallback === "function") {
        timerState.idleId = window.requestIdleCallback(
          () => {
            flushLocalDraftAutosave();
          },
          { timeout: LOCAL_DRAFT_AUTOSAVE_MAX_WAIT_MS },
        );
        timerState.maxWaitTimeoutId = window.setTimeout(() => {
          if (timerState.idleId !== null && typeof window.cancelIdleCallback === "function") {
            window.cancelIdleCallback(timerState.idleId);
            timerState.idleId = null;
          }
          flushLocalDraftAutosave();
        }, LOCAL_DRAFT_AUTOSAVE_MAX_WAIT_MS);
        return;
      }

      flushLocalDraftAutosave();
    }, waitMs);
  }, [flushLocalDraftAutosave]);

  const handleActionWorkingSetChange = useCallback(() => {
    if (!isPublished) {
      scheduleLocalDraftAutosave();
    }
    setPublishSnapshotVersion(prev => prev + 1);
  }, [isPublished, scheduleLocalDraftAutosave]);

  const handleCompletionWorkingSetChange = useCallback(() => {
    if (!isPublished) {
      scheduleLocalDraftAutosave();
    }
    setPublishSnapshotVersion(prev => prev + 1);

    const throttleState = completionWorkingSetThrottleRef.current;
    const now = Date.now();
    const elapsed = now - throttleState.lastUpdatedAt;
    if (elapsed >= WORKING_SET_VERSION_THROTTLE_MS) {
      throttleState.lastUpdatedAt = now;
      setCompletionWorkingSetVersion(prev => prev + 1);
      return;
    }

    if (throttleState.timeoutId !== null) {
      return;
    }

    throttleState.timeoutId = window.setTimeout(() => {
      throttleState.timeoutId = null;
      throttleState.lastUpdatedAt = Date.now();
      setCompletionWorkingSetVersion(prev => prev + 1);
    }, WORKING_SET_VERSION_THROTTLE_MS - elapsed);
  }, [isPublished, scheduleLocalDraftAutosave]);

  useEffect(() => {
    if (!isEditorTab || draftRestoreAppliedRef.current) {
      return;
    }

    if (
      !basicInfoRef.current ||
      !rewardRef.current ||
      !actionRef.current ||
      !completionRef.current
    ) {
      return;
    }

    if (isActionsLoading || isCompletionsLoading) {
      return;
    }

    const selectedDraft = resolveDraftToRestore({ missionId, mission, missionQueryData });

    draftRestoreAppliedRef.current = true;

    if (!selectedDraft) {
      return;
    }

    void applyDraftPayload(selectedDraft)
      .then(() => {
        setPublishSnapshotVersion(prev => prev + 1);
        toast({
          message: "임시 저장된 편집 내용이 복원되었습니다.",
        });
      })
      .catch(error => {
        console.error("Failed to restore mission editor draft:", error);
      });
  }, [
    applyDraftPayload,
    isActionsLoading,
    isCompletionsLoading,
    isEditorTab,
    mission,
    missionId,
    missionQueryData,
  ]);

  useEffect(() => {
    if (!isEditorTab || isPublished || !draftRestoreAppliedRef.current) {
      return;
    }

    if (
      !basicInfoRef.current ||
      !rewardRef.current ||
      !actionRef.current ||
      !completionRef.current
    ) {
      return;
    }

    if (!hasPendingChangesFromRefs()) {
      return;
    }

    scheduleLocalDraftAutosave();
  }, [hasPendingChangesFromRefs, isEditorTab, isPublished, scheduleLocalDraftAutosave]);

  useEffect(
    () => () => {
      if (typeof window === "undefined") {
        return;
      }
      clearLocalDraftAutosaveTimers();
      const throttleState = completionWorkingSetThrottleRef.current;
      if (throttleState.timeoutId !== null) {
        window.clearTimeout(throttleState.timeoutId);
        throttleState.timeoutId = null;
      }
    },
    [clearLocalDraftAutosaveTimers],
  );

  const runSectionSaves = useCallback(
    async ({
      stopOnError,
      trigger = "manual",
      showValidationUi = true,
    }: {
      stopOnError: boolean;
      trigger?: NonNullable<SectionSaveOptions["trigger"]>;
      showValidationUi?: boolean;
    }): Promise<SectionSaveSummary> => {
      const sections: Array<{
        key: EditorSectionKey;
        label: string;
        ref: RefObject<SectionSaveHandle | null>;
      }> = [
        { key: "basic", label: "기본 정보", ref: basicInfoRef },
        { key: "reward", label: "리워드", ref: rewardRef },
        { key: "action", label: "액션", ref: actionRef },
        { key: "completion", label: "결과 화면", ref: completionRef },
      ];

      let summary: SectionSaveSummary = createEmptySectionSaveSummary();

      for (const section of sections) {
        const handle = section.ref.current;
        if (!handle || !handle.hasPendingChanges()) {
          continue;
        }

        const result = await handle.save({
          silent: true,
          trigger,
          showValidationUi,
        });

        summary = accumulateSectionSaveResult(summary, section, result);

        if (
          stopOnError &&
          (result.status === "failed" ||
            result.status === "invalid" ||
            (result.failedCount ?? 0) > 0 ||
            (result.invalidCount ?? 0) > 0)
        ) {
          return summary;
        }
      }

      return summary;
    },
    [],
  );

  const runUnifiedSave = useCallback(
    async ({
      showSavedToast = true,
      showNoChangesToast = true,
      mode = "manual",
    }: {
      showSavedToast?: boolean;
      showNoChangesToast?: boolean;
      mode?: "manual" | "publish";
    } = {}) => {
      if (!isEditorTab || saveInFlightRef.current || isSavingAll || hasAnyBusySection) {
        return "failed" as const;
      }

      const hasPendingChangesNow = hasAnyPendingChanges || hasPendingChangesFromRefs();
      if (!hasPendingChangesNow) {
        const clearResult = await clearPersistedDraft();
        if (!clearResult.serverDraftCleared || !clearResult.localDraftCleared) {
          console.error("Failed to clear mission editor draft:", {
            missionId,
            serverDraftErrorMessage: clearResult.serverDraftErrorMessage,
            localDraftErrorMessage: clearResult.localDraftErrorMessage,
          });
          toast({
            message: "저장할 변경사항이 없습니다.\n임시저장을 정리하지 못했습니다.",
            icon: AlertCircle,
            iconClassName: "text-red-500",
            id: UNIFIED_SAVE_TOAST_ID,
          });
          return "no_changes" as const;
        }

        if (showNoChangesToast) {
          toast({
            message: "저장할 변경사항이 없습니다.",
            id: UNIFIED_SAVE_TOAST_ID,
          });
        }
        return "no_changes" as const;
      }

      saveInFlightRef.current = true;
      setIsSavingAll(true);
      try {
        const summary = await runSectionSaves({
          stopOnError: mode === "publish",
          trigger: mode === "publish" ? "publish" : "manual",
          showValidationUi: true,
        });

        const shouldClearDraftAfterSave =
          summary.savedCount > 0 &&
          summary.failedCount === 0 &&
          summary.invalidCount === 0 &&
          summary.skippedCount === 0;
        const clearDraftAfterSuccessfulSave = async () => {
          if (!shouldClearDraftAfterSave) {
            return;
          }

          const clearResult = await clearPersistedDraft();
          if (!clearResult.serverDraftCleared || !clearResult.localDraftCleared) {
            console.error("Failed to clear mission editor draft:", {
              missionId,
              serverDraftErrorMessage: clearResult.serverDraftErrorMessage,
              localDraftErrorMessage: clearResult.localDraftErrorMessage,
            });
            toast({
              message: "저장은 완료되었지만 임시저장을 정리하지 못했습니다.",
              icon: AlertCircle,
              iconClassName: "text-red-500",
              id: UNIFIED_SAVE_TOAST_ID,
            });
          }
        };

        if (mode === "publish" && (summary.invalidCount > 0 || summary.failedCount > 0)) {
          toast({
            message: summary.firstErrorMessage ?? "저장에 실패했습니다.",
            icon: AlertCircle,
            iconClassName: "text-red-500",
            id: UNIFIED_SAVE_TOAST_ID,
          });
          return "failed" as const;
        }

        if (mode === "manual") {
          const { skippedCount, processedCount } = computeManualSaveDisplayCounts(summary);

          if (processedCount > 0) {
            const message = buildManualSaveToastMessage({
              savedCount: summary.savedCount,
              skippedCount,
              failedCount: summary.failedCount,
            });
            if (summary.failedCount > 0) {
              toast({
                message,
                icon: AlertCircle,
                iconClassName: "text-red-500",
                id: UNIFIED_SAVE_TOAST_ID,
              });
              if (summary.failedCount > 0) {
                return "failed" as const;
              }
            }

            if (summary.savedCount > 0) {
              await clearDraftAfterSuccessfulSave();
            }

            if (showSavedToast) {
              toast({
                message,
                id: UNIFIED_SAVE_TOAST_ID,
              });
            }

            return summary.savedCount > 0 ? ("saved" as const) : ("no_changes" as const);
          }
        }

        if (summary.savedCount > 0) {
          await clearDraftAfterSuccessfulSave();

          if (showSavedToast) {
            toast({
              message: "변경사항이 저장되었습니다.",
              id: UNIFIED_SAVE_TOAST_ID,
            });
          }
          return "saved" as const;
        }

        if (showNoChangesToast) {
          toast({
            message: "저장할 변경사항이 없습니다.",
            id: UNIFIED_SAVE_TOAST_ID,
          });
        }
        return "no_changes" as const;
      } finally {
        saveInFlightRef.current = false;
        setIsSavingAll(false);
      }
    },
    [
      clearPersistedDraft,
      hasAnyBusySection,
      hasAnyPendingChanges,
      hasPendingChangesFromRefs,
      isEditorTab,
      isSavingAll,
      missionId,
      runSectionSaves,
    ],
  );

  const runPublishPreflightValidation = useCallback(async () => {
    const [latestMissionResult, latestActionsResult, latestCompletionsResult] = await Promise.all([
      refetchMission(),
      refetchActions(),
      refetchCompletions(),
    ]);

    const latestMission = latestMissionResult.data?.data ?? missionQueryData ?? mission;
    const latestActions = latestActionsResult.data?.data ?? actionsQueryData ?? [];
    const latestCompletions = latestCompletionsResult.data?.data ?? completionsQueryData ?? [];

    return validateEditorPublishFlow({
      entryActionId: latestMission.entryActionId,
      useAiCompletion: latestMission.useAiCompletion,
      serverActions: latestActions,
      serverCompletions: latestCompletions,
    });
  }, [
    actionsQueryData,
    completionsQueryData,
    mission,
    missionQueryData,
    refetchActions,
    refetchCompletions,
    refetchMission,
  ]);

  const handlePublish = useCallback(async () => {
    if (
      !isEditorTab ||
      isPublished ||
      publishInFlightRef.current ||
      isPublishing ||
      isSavingAll ||
      hasAnyBusySection
    ) {
      return;
    }

    if (!publishState.canPublish) {
      const isCheckingPublishState =
        !publishState.isValidationDataReady || publishState.issues.length === 0;
      toast({
        message: isCheckingPublishState
          ? "발행 가능 상태를 확인 중입니다. 잠시 후 다시 시도해주세요."
          : (publishState.blockingMessage ?? "발행 가능한 상태인지 확인할 수 없습니다."),
        icon: AlertCircle,
        iconClassName: "text-red-500",
        id: PUBLISH_TOAST_ID,
      });
      return;
    }

    publishInFlightRef.current = true;
    setIsPublishing(true);
    try {
      if (hasAnyPendingChanges) {
        const saveResult = await runUnifiedSave({
          showSavedToast: false,
          showNoChangesToast: false,
          mode: "publish",
        });
        if (saveResult === "failed") {
          return;
        }
      }

      const preflightValidation = await runPublishPreflightValidation();
      if (!preflightValidation.isValid) {
        toast({
          message: getPublishBlockingMessage(preflightValidation.issues),
          icon: AlertCircle,
          iconClassName: "text-red-500",
          id: PUBLISH_TOAST_ID,
        });
        return;
      }

      await updateMission(missionId, {
        isActive: true,
        type: MissionType.GENERAL,
      });
      setIsPublished(true);
      toast({
        message: "발행되었습니다.",
        id: PUBLISH_TOAST_ID,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "발행 중 오류가 발생했습니다.";
      toast({
        message,
        icon: AlertCircle,
        iconClassName: "text-red-500",
        id: PUBLISH_TOAST_ID,
      });
    } finally {
      publishInFlightRef.current = false;
      setIsPublishing(false);
    }
  }, [
    hasAnyBusySection,
    hasAnyPendingChanges,
    isEditorTab,
    isPublished,
    isPublishing,
    isSavingAll,
    missionId,
    publishState.blockingMessage,
    publishState.canPublish,
    publishState.isValidationDataReady,
    publishState.issues.length,
    runPublishPreflightValidation,
    runUnifiedSave,
  ]);

  const handleSave = useCallback(async () => {
    if (!canSave) {
      const isCheckingSaveState =
        !publishState.isValidationDataReady || publishState.issues.length === 0;
      toast({
        message: isCheckingSaveState
          ? "저장 가능 상태를 확인 중입니다. 잠시 후 다시 시도해주세요."
          : (publishState.blockingMessage ?? "저장 가능한 상태인지 확인할 수 없습니다."),
        icon: AlertCircle,
        iconClassName: "text-red-500",
        id: UNIFIED_SAVE_TOAST_ID,
      });
      return;
    }

    await runUnifiedSave({ mode: "publish" });
  }, [
    canSave,
    publishState.blockingMessage,
    publishState.isValidationDataReady,
    publishState.issues.length,
    runUnifiedSave,
  ]);

  const handleDraftSave = useCallback(async () => {
    const draftPayload = collectLocalDraftPayload();
    const updatedAtMs = Date.now();
    const payloadWithMeta: LocalEditorDraftPayload = {
      ...draftPayload,
      meta: { updatedAtMs },
    };
    saveMissionEditorDraftToLocalStorage(missionId, payloadWithMeta);

    try {
      await saveMissionEditorDraft(missionId, toServerEditorDraftPayload(draftPayload));
    } catch (error) {
      console.error("Failed to save server draft:", error);
      toast({
        message: "서버 임시저장에 실패했습니다. 로컬에는 저장되었습니다.",
        icon: AlertCircle,
        iconClassName: "text-yellow-500",
      });
    }

    await runUnifiedSave({ mode: "manual" });
  }, [collectLocalDraftPayload, missionId, runUnifiedSave]);

  const onBasicStateChange = useCallback(
    (state: SectionSaveState) => {
      updateSectionState("basic", state);
      setPublishSnapshotVersion(prev => prev + 1);
    },
    [updateSectionState],
  );

  const onRewardStateChange = useCallback(
    (state: SectionSaveState) => {
      updateSectionState("reward", state);
    },
    [updateSectionState],
  );

  const onActionStateChange = useCallback(
    (state: SectionSaveState) => {
      updateSectionState("action", state);
      setPublishSnapshotVersion(prev => prev + 1);
    },
    [updateSectionState],
  );

  const onCompletionStateChange = useCallback(
    (state: SectionSaveState) => {
      updateSectionState("completion", state);
      setPublishSnapshotVersion(prev => prev + 1);
    },
    [updateSectionState],
  );

  const getCompletionDraftSnapshot = useCallback(
    () => completionRef.current?.exportDraftSnapshot() ?? null,
    [],
  );

  return {
    refs: {
      basicInfoRef,
      rewardRef,
      actionRef,
      completionRef,
    },
    sectionBindings: {
      onBasicStateChange,
      onRewardStateChange,
      onActionStateChange,
      onCompletionStateChange,
      getCompletionDraftSnapshot,
      completionWorkingSetVersion,
      onActionWorkingSetChange: handleActionWorkingSetChange,
      onCompletionWorkingSetChange: handleCompletionWorkingSetChange,
    },
    viewState: {
      isPublished,
      canPublish: publishState.canPublish,
      canSave,
      isSavingAll,
      isPublishing,
      hasAnyBusySection,
      hasAnyPendingChanges,
    },
    publishState,
    actions: {
      onSave: handleSave,
      onDraftSave: handleDraftSave,
      onPublish: handlePublish,
    },
  };
}
