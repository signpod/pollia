"use client";

import { saveMissionEditorDraft } from "@/actions/mission/draft";
import { updateMission } from "@/actions/mission/update";
import type { GetMissionResponse } from "@/types/dto";
import {
  type EditorMissionDraftPayload,
  type LocalEditorDraftPayload,
  normalizeEditorMissionDraftPayload,
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
  type PublishAvailability,
  computePublishAvailability,
} from "../models/editorMissionPublishModel";
import {
  type PostSectionSaveOutcome,
  checkPublishGuard,
  checkSaveGuard,
  checkUnifiedSaveGuard,
  resolveNoChangesOutcome,
  resolvePostSectionSaveOutcome,
  resolveSaveStrategy,
} from "./editorMissionSaveFlowModel";
import {
  type EditorSectionKey,
  type SectionSaveSummary,
  accumulateSectionSaveResult,
  createEmptySectionSaveSummary,
} from "./editorMissionSaveSummaryModel";

const UNIFIED_SAVE_TOAST_ID = "editor-mission-save-result";
const PUBLISH_TOAST_ID = "editor-mission-publish-result";

interface ResolveDraftToRestoreInput {
  mission: GetMissionResponse["data"];
  missionQueryData?: GetMissionResponse["data"] | null;
}

function resolveDraftToRestore({
  mission,
  missionQueryData,
}: ResolveDraftToRestoreInput): EditorMissionDraftPayload | null {
  if (mission.isActive || missionQueryData?.isActive) {
    return null;
  }

  const latestMission = missionQueryData ?? mission;
  const serverDraftRaw = normalizeEditorMissionDraftPayload(
    (latestMission as { editorDraft?: unknown }).editorDraft,
  );

  return serverDraftRaw ? toServerEditorDraftPayload(serverDraftRaw) : null;
}

interface DraftClearResult {
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
    onPublish: () => Promise<void>;
  };
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

  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(mission.isActive);
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

    return {
      serverDraftCleared,
      serverDraftErrorMessage,
    };
  }, [missionId]);

  const handleActionWorkingSetChange = useCallback(() => {
    setPublishSnapshotVersion(prev => prev + 1);
  }, []);

  const handleCompletionWorkingSetChange = useCallback(() => {
    setPublishSnapshotVersion(prev => prev + 1);
  }, []);

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

    const selectedDraft = resolveDraftToRestore({ mission, missionQueryData });

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

  const applyPostSectionSaveOutcome = useCallback(
    async (outcome: PostSectionSaveOutcome) => {
      switch (outcome.type) {
        case "publish_error":
          toast({
            message: outcome.message,
            icon: AlertCircle,
            iconClassName: "text-red-500",
            id: UNIFIED_SAVE_TOAST_ID,
          });
          break;

        case "manual_with_failures":
          toast({
            message: outcome.message,
            icon: AlertCircle,
            iconClassName: "text-red-500",
            id: UNIFIED_SAVE_TOAST_ID,
          });
          break;

        case "manual_processed":
          if (outcome.shouldClearDraft) {
            const clearResult = await clearPersistedDraft();
            if (!clearResult.serverDraftCleared) {
              console.error("Failed to clear mission editor draft:", {
                missionId,
                serverDraftErrorMessage: clearResult.serverDraftErrorMessage,
              });
              toast({
                message: "저장은 완료되었지만 임시저장을 정리하지 못했습니다.",
                icon: AlertCircle,
                iconClassName: "text-red-500",
                id: UNIFIED_SAVE_TOAST_ID,
              });
            }
          }
          if (outcome.showToast) {
            toast({ message: outcome.message, id: UNIFIED_SAVE_TOAST_ID });
          }
          break;

        case "saved":
          if (outcome.shouldClearDraft) {
            const clearResult = await clearPersistedDraft();
            if (!clearResult.serverDraftCleared) {
              console.error("Failed to clear mission editor draft:", {
                missionId,
                serverDraftErrorMessage: clearResult.serverDraftErrorMessage,
              });
              toast({
                message: "저장은 완료되었지만 임시저장을 정리하지 못했습니다.",
                icon: AlertCircle,
                iconClassName: "text-red-500",
                id: UNIFIED_SAVE_TOAST_ID,
              });
            }
          }
          if (outcome.showToast) {
            toast({ message: "변경사항이 저장되었습니다.", id: UNIFIED_SAVE_TOAST_ID });
          }
          break;

        case "no_changes":
          if (outcome.showToast) {
            toast({ message: "저장할 변경사항이 없습니다.", id: UNIFIED_SAVE_TOAST_ID });
          }
          break;
      }
    },
    [clearPersistedDraft, missionId],
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
      const guard = checkUnifiedSaveGuard({
        isEditorTab,
        saveInFlight: saveInFlightRef.current,
        isSavingAll,
        hasAnyBusySection,
      });
      if (!guard.allowed) {
        return "failed" as const;
      }

      const hasPendingChangesNow = hasAnyPendingChanges || hasPendingChangesFromRefs();
      if (!hasPendingChangesNow) {
        if (isPublished) {
          const clearResult = await clearPersistedDraft();
          const noChangesOutcome = resolveNoChangesOutcome(clearResult);
          if (noChangesOutcome.type === "clear_failed") {
            console.error("Failed to clear mission editor draft:", {
              missionId,
              serverDraftErrorMessage: clearResult.serverDraftErrorMessage,
            });
            toast({
              message: "저장할 변경사항이 없습니다.\n임시저장을 정리하지 못했습니다.",
              icon: AlertCircle,
              iconClassName: "text-red-500",
              id: UNIFIED_SAVE_TOAST_ID,
            });
            return "no_changes" as const;
          }
        }
        if (showNoChangesToast) {
          toast({ message: "저장할 변경사항이 없습니다.", id: UNIFIED_SAVE_TOAST_ID });
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

        const outcome = resolvePostSectionSaveOutcome({
          mode,
          isPublished,
          summary,
          showSavedToast,
          showNoChangesToast,
        });

        await applyPostSectionSaveOutcome(outcome);
        return outcome.result;
      } finally {
        saveInFlightRef.current = false;
        setIsSavingAll(false);
      }
    },
    [
      applyPostSectionSaveOutcome,
      clearPersistedDraft,
      hasAnyBusySection,
      hasAnyPendingChanges,
      hasPendingChangesFromRefs,
      isEditorTab,
      isPublished,
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

  const saveDraft = useCallback(async () => {
    const draftPayload = collectLocalDraftPayload();

    try {
      await saveMissionEditorDraft(missionId, toServerEditorDraftPayload(draftPayload));
    } catch (error) {
      console.error("Failed to save server draft:", error);
      toast({
        message: "서버 임시저장에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    }
  }, [collectLocalDraftPayload, missionId]);

  const handlePublish = useCallback(async () => {
    const guard = checkPublishGuard({
      isEditorTab,
      isPublished,
      publishInFlight: publishInFlightRef.current,
      isPublishing,
      isSavingAll,
      hasAnyBusySection,
      canPublish: publishState.canPublish,
      isValidationDataReady: publishState.isValidationDataReady,
      issueCount: publishState.issues.length,
      blockingMessage: publishState.blockingMessage,
    });

    if (!guard.allowed) {
      if (!guard.silent) {
        toast({
          message: guard.message,
          icon: AlertCircle,
          iconClassName: "text-red-500",
          id: PUBLISH_TOAST_ID,
        });
      }
      return;
    }

    publishInFlightRef.current = true;
    setIsPublishing(true);
    try {
      if (hasAnyPendingChanges) {
        await saveDraft();
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
    saveDraft,
  ]);

  const handleSave = useCallback(async () => {
    const strategy = resolveSaveStrategy(isPublished);

    if (strategy === "direct-save") {
      const guard = checkSaveGuard({
        isValidationDataReady: publishState.isValidationDataReady,
        issueCount: publishState.issues.length,
        blockingMessage: publishState.blockingMessage,
      });

      if (!guard.allowed) {
        toast({
          message: guard.message,
          icon: AlertCircle,
          iconClassName: "text-red-500",
          id: UNIFIED_SAVE_TOAST_ID,
        });
        return;
      }

      await saveDraft();
      await runUnifiedSave({ mode: "publish" });
      return;
    }

    await saveDraft();
    await runUnifiedSave({ mode: "manual" });
  }, [
    isPublished,
    publishState.blockingMessage,
    publishState.isValidationDataReady,
    publishState.issues.length,
    runUnifiedSave,
    saveDraft,
  ]);

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
      onPublish: handlePublish,
    },
  };
}
