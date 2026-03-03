"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { saveMissionEditorDraft } from "@/actions/mission/draft";
import { updateMission } from "@/actions/mission/update";
import { Separator } from "@/components/ui/separator";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action";
import { useReadMission } from "@/hooks/mission";
import type { GetMissionResponse } from "@/types/dto";
import {
  type EditorMissionDraftPayload,
  type LocalEditorDraftPayload,
  type ServerEditorDraftPayload,
  normalizeEditorMissionDraftPayload,
  selectLatestEditorMissionDraft,
  toServerEditorDraftPayload,
} from "@/types/mission-editor-draft";
import { MissionType, type PaymentType } from "@prisma/client";
import { Button, toast } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Rocket, Save } from "lucide-react";
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSettingsCard } from "./ActionSettingsCard";
import { CompletionSettingsCard } from "./CompletionSettingsCard";
import { EditorBottomSaveSlot } from "./EditorBottomSaveSlot";
import { EditorMissionDraftProvider } from "./EditorMissionDraftContext";
import { useEditorMissionTab } from "./EditorMissionTabContext";
import { MissionStatsDashboard } from "./MissionStatsDashboard";
import { ProjectBasicInfoCard } from "./ProjectBasicInfoCard";
import { RewardSettingsCard } from "./RewardSettingsCard";
import {
  getPublishBlockingMessage,
  validateEditorPublishFlow,
} from "./editor-publish-flow-validation";
import type { SectionSaveHandle, SectionSaveOptions, SectionSaveState } from "./editor-save.types";
import {
  loadMissionEditorDraftFromLocalStorage,
  saveMissionEditorDraftToLocalStorage,
} from "./editorMissionDraftStorage";

interface RewardSnapshot {
  id: string;
  name: string;
  description: string | null;
  paymentType: PaymentType;
  scheduledDate: Date | null;
}

interface EditorMissionTabContentProps {
  missionId: string;
  mission: GetMissionResponse["data"];
  reward: RewardSnapshot | null;
}

const UNIFIED_SAVE_TOAST_ID = "editor-mission-save-result";
const PUBLISH_TOAST_ID = "editor-mission-publish-result";
const LOCAL_DRAFT_AUTOSAVE_THROTTLE_MS = 700;
const LOCAL_DRAFT_AUTOSAVE_MAX_WAIT_MS = 1500;
const WORKING_SET_VERSION_THROTTLE_MS = 120;

type EditorSectionKey = "basic" | "reward" | "action" | "completion";

interface SectionSaveSummary {
  savedCount: number;
  skippedCount: number;
  failedCount: number;
  invalidCount: number;
  failedSections: EditorSectionKey[];
  invalidSections: EditorSectionKey[];
  firstErrorMessage: string | null;
}

interface DraftPersistResult {
  localDraftSaved: boolean;
  localDraftErrorMessage: string | null;
  serverDraftSaved: boolean;
  serverDraftErrorMessage: string | null;
}

function createEmptySummary(): SectionSaveSummary {
  return {
    savedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    invalidCount: 0,
    failedSections: [],
    invalidSections: [],
    firstErrorMessage: null,
  };
}

function buildManualSaveToastMessage(params: {
  savedCount: number;
  effectiveSkipCount: number;
  failedCount: number;
  hasDraftPersistFailure: boolean;
}) {
  const { savedCount, effectiveSkipCount, failedCount, hasDraftPersistFailure } = params;
  const lines = [`저장 ${savedCount} / 스킵 ${effectiveSkipCount}`];
  if (failedCount > 0) {
    lines.push(`실패 ${failedCount}`);
  }
  if (hasDraftPersistFailure) {
    lines.push("임시저장 실패");
  }

  return lines.join("\n");
}

function MissionIntroPreview({ missionId }: { missionId: string }) {
  const previewUrl = ROUTES.MISSION(missionId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [previewUrl]);

  return (
    <div className="relative h-[calc(100vh-120px)] min-h-[720px] w-full overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <div className="size-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-500" />
        </div>
      )}
      <iframe
        title="프로젝트 인트로 미리보기"
        src={previewUrl}
        className="h-full w-full border-0"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export function EditorMissionTabContent({
  missionId,
  mission,
  reward,
}: EditorMissionTabContentProps) {
  const { currentTab } = useEditorMissionTab();
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
  const [sectionStates, setSectionStates] = useState<
    Record<"basic" | "reward" | "action" | "completion", SectionSaveState>
  >({
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
  const missionQuery = useReadMission(missionId);
  const actionsQuery = useReadActionsDetail(missionId);
  const completionsQuery = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const updateSectionState = useCallback(
    (section: "basic" | "reward" | "action" | "completion", nextState: SectionSaveState) => {
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
  const missionEntryActionId = missionQuery.data?.data.entryActionId ?? mission.entryActionId;
  const isPublishValidationReady = Boolean(
    actionsQuery.data?.data &&
      completionsQuery.data?.data &&
      actionRef.current &&
      completionRef.current,
  );
  const publishFlowValidation = useMemo(() => {
    if (!isPublishValidationReady) {
      return {
        isValid: false,
        issues: [],
      };
    }

    return validateEditorPublishFlow({
      entryActionId: missionEntryActionId,
      serverActions: actionsQuery.data?.data ?? [],
      serverCompletions: completionsQuery.data?.data ?? [],
      actionDraftSnapshot: actionRef.current?.exportDraftSnapshot(),
      completionDraftSnapshot: completionRef.current?.exportDraftSnapshot(),
    });
  }, [
    actionsQuery.data?.data,
    completionsQuery.data?.data,
    isPublishValidationReady,
    missionEntryActionId,
    sectionStates.action,
    sectionStates.completion,
  ]);
  const canPublish = !isPublished && isPublishValidationReady && publishFlowValidation.isValid;

  const collectLocalDraftPayload = useCallback((): LocalEditorDraftPayload => {
    return {
      basic: basicInfoRef.current?.exportDraftSnapshot() ?? null,
      reward: rewardRef.current?.exportDraftSnapshot() ?? null,
      action: actionRef.current?.exportDraftSnapshot() ?? null,
      completion: completionRef.current?.exportDraftSnapshot() ?? null,
    };
  }, []);

  const collectServerDraftPayload = useCallback(
    (payload: LocalEditorDraftPayload): ServerEditorDraftPayload =>
      toServerEditorDraftPayload(payload),
    [],
  );

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

  const persistDraftPayload = useCallback(
    async (
      localPayload: LocalEditorDraftPayload,
      serverPayload: ServerEditorDraftPayload,
      serializedDraftSnapshot: string,
      persistedAtMs: number,
    ) => {
      localDraftAutosaveRef.current.lastSerializedPayload = serializedDraftSnapshot;
      localDraftAutosaveRef.current.lastPersistedAt = persistedAtMs;
      const localDraftSaved = saveMissionEditorDraftToLocalStorage(missionId, localPayload);

      let serverDraftSaved = false;
      let serverDraftErrorMessage: string | null = null;
      try {
        await saveMissionEditorDraft(missionId, serverPayload);
        serverDraftSaved = true;
      } catch (error) {
        console.error("saveMissionEditorDraft error:", error);
        serverDraftErrorMessage =
          error instanceof Error ? error.message : "서버 임시저장에 실패했습니다.";
      }

      return {
        localDraftSaved,
        localDraftErrorMessage: localDraftSaved ? null : "로컬 임시저장에 실패했습니다.",
        serverDraftSaved,
        serverDraftErrorMessage,
      } satisfies DraftPersistResult;
    },
    [missionId],
  );

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
    scheduleLocalDraftAutosave();
  }, [scheduleLocalDraftAutosave]);

  const handleCompletionWorkingSetChange = useCallback(() => {
    scheduleLocalDraftAutosave();

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
  }, [scheduleLocalDraftAutosave]);

  useEffect(() => {
    setIsPublished(mission.isActive);
  }, [mission.id, mission.isActive]);

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

    if (actionsQuery.isLoading || completionsQuery.isLoading) {
      return;
    }

    const localDraft = loadMissionEditorDraftFromLocalStorage(missionId);
    const latestMission = missionQuery.data?.data ?? mission;
    const serverDraftRaw = normalizeEditorMissionDraftPayload(
      (latestMission as { editorDraft?: unknown }).editorDraft,
    );
    const serverDraft = serverDraftRaw ? toServerEditorDraftPayload(serverDraftRaw) : null;
    const selectedDraft = selectLatestEditorMissionDraft(localDraft, serverDraft);

    draftRestoreAppliedRef.current = true;

    if (!selectedDraft) {
      return;
    }

    void applyDraftPayload(selectedDraft)
      .then(() => {
        toast({
          message: "임시 저장된 편집 내용이 복원되었습니다.",
        });
      })
      .catch(error => {
        console.error("Failed to restore mission editor draft:", error);
      });
  }, [
    actionsQuery.isLoading,
    applyDraftPayload,
    completionsQuery.isLoading,
    isEditorTab,
    mission,
    missionId,
    missionQuery.data?.data,
  ]);

  useEffect(() => {
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

    scheduleLocalDraftAutosave();
  }, [
    hasPendingChangesFromRefs,
    isEditorTab,
    scheduleLocalDraftAutosave,
    sectionStates.basic,
    sectionStates.reward,
  ]);

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

      const summary: SectionSaveSummary = createEmptySummary();

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

        if (result.status === "saved") {
          summary.savedCount += result.savedCount ?? 1;
        } else {
          summary.savedCount += result.savedCount ?? 0;
        }
        summary.skippedCount += result.skippedCount ?? 0;
        summary.failedCount += result.failedCount ?? (result.status === "failed" ? 1 : 0);
        summary.invalidCount += result.invalidCount ?? (result.status === "invalid" ? 1 : 0);

        if (result.status === "invalid" && result.invalidCount === undefined) {
          summary.skippedCount += 1;
        }

        if (
          result.status === "invalid" ||
          result.invalidCount !== undefined ||
          (result.invalidCount ?? 0) > 0
        ) {
          summary.invalidSections.push(section.key);
          summary.firstErrorMessage ??= result.message ?? `${section.label} 입력값을 확인해주세요.`;
        }

        if (
          result.status === "failed" ||
          result.failedCount !== undefined ||
          (result.failedCount ?? 0) > 0
        ) {
          summary.failedSections.push(section.key);
          summary.firstErrorMessage ??= result.message ?? `${section.label} 저장에 실패했습니다.`;
        }

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

      const localDraftPayload = collectLocalDraftPayload();
      const serializedLocalDraftPayload = JSON.stringify(localDraftPayload);
      const persistedAtMs = Date.now();
      const localDraftPayloadWithMeta: LocalEditorDraftPayload = {
        ...localDraftPayload,
        meta: {
          updatedAtMs: persistedAtMs,
        },
      };
      const serverDraftPayload = collectServerDraftPayload(localDraftPayloadWithMeta);
      const draftPersist = await persistDraftPayload(
        localDraftPayloadWithMeta,
        serverDraftPayload,
        serializedLocalDraftPayload,
        persistedAtMs,
      );

      const hasPendingChangesNow = hasAnyPendingChanges || hasPendingChangesFromRefs();
      if (!hasPendingChangesNow) {
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
          const rawUnsavedCount = summary.skippedCount + summary.invalidCount;
          const effectiveSkipCount = draftPersist.serverDraftSaved ? rawUnsavedCount : 0;
          const processedCount =
            summary.savedCount +
            rawUnsavedCount +
            summary.failedCount +
            (draftPersist.serverDraftSaved ? 0 : 1);

          if (processedCount > 0) {
            const message = buildManualSaveToastMessage({
              savedCount: summary.savedCount,
              effectiveSkipCount,
              failedCount: summary.failedCount,
              hasDraftPersistFailure: !draftPersist.serverDraftSaved,
            });
            if (summary.failedCount > 0 || !draftPersist.serverDraftSaved) {
              toast({
                message,
                icon: AlertCircle,
                iconClassName: "text-red-500",
                id: UNIFIED_SAVE_TOAST_ID,
              });
              if (summary.failedCount > 0) {
                return "failed" as const;
              }

              return summary.savedCount > 0 ? ("saved" as const) : ("no_changes" as const);
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
      collectLocalDraftPayload,
      collectServerDraftPayload,
      hasAnyBusySection,
      hasAnyPendingChanges,
      hasPendingChangesFromRefs,
      isEditorTab,
      isSavingAll,
      persistDraftPayload,
      runSectionSaves,
    ],
  );

  const handleUnifiedSave = useCallback(async () => {
    await runUnifiedSave();
  }, [runUnifiedSave]);

  const runPublishPreflightValidation = useCallback(async () => {
    const [latestMissionResult, latestActionsResult, latestCompletionsResult] = await Promise.all([
      missionQuery.refetch(),
      actionsQuery.refetch(),
      completionsQuery.refetch(),
    ]);

    const latestMission = latestMissionResult.data?.data ?? missionQuery.data?.data ?? mission;
    const latestActions = latestActionsResult.data?.data ?? actionsQuery.data?.data ?? [];
    const latestCompletions =
      latestCompletionsResult.data?.data ?? completionsQuery.data?.data ?? [];

    return validateEditorPublishFlow({
      entryActionId: latestMission.entryActionId,
      serverActions: latestActions,
      serverCompletions: latestCompletions,
    });
  }, [actionsQuery, completionsQuery, mission, missionQuery]);

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

    if (!canPublish) {
      toast({
        message:
          publishFlowValidation.issues.length > 0
            ? getPublishBlockingMessage(publishFlowValidation.issues)
            : "발행 가능 상태를 확인 중입니다. 잠시 후 다시 시도해주세요.",
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
    canPublish,
    hasAnyBusySection,
    hasAnyPendingChanges,
    isEditorTab,
    isPublished,
    isPublishing,
    isSavingAll,
    missionId,
    publishFlowValidation.issues,
    runPublishPreflightValidation,
    runUnifiedSave,
  ]);

  const saveButtonNode = useMemo(
    () =>
      isPublished ? (
        <div className="px-5 py-3">
          <Button
            variant="primary"
            fullWidth
            inlineIcon
            leftIcon={<Save className="size-4" />}
            onClick={handleUnifiedSave}
            loading={isSavingAll}
            disabled={isSavingAll || isPublishing || hasAnyBusySection || !hasAnyPendingChanges}
          >
            저장하기
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 px-5 py-3">
          <Button
            variant="secondary"
            fullWidth
            inlineIcon
            leftIcon={<Save className="size-4" />}
            onClick={handleUnifiedSave}
            loading={isSavingAll}
            disabled={isSavingAll || isPublishing || hasAnyBusySection || !hasAnyPendingChanges}
          >
            저장하기
          </Button>
          <Button
            variant="primary"
            fullWidth
            inlineIcon
            leftIcon={<Rocket className="size-4" />}
            onClick={handlePublish}
            loading={isPublishing}
            disabled={isSavingAll || isPublishing || hasAnyBusySection || !canPublish}
          >
            발행하기
          </Button>
        </div>
      ),
    [
      canPublish,
      handlePublish,
      handleUnifiedSave,
      hasAnyBusySection,
      hasAnyPendingChanges,
      isPublished,
      isPublishing,
      isSavingAll,
    ],
  );

  if (currentTab === "stats") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey={`editor-mission-save:${missionId}`}
          isActive={false}
          node={saveButtonNode}
        />
        <MissionStatsDashboard missionId={missionId} />
      </>
    );
  }

  if (currentTab === "preview") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey={`editor-mission-save:${missionId}`}
          isActive={false}
          node={saveButtonNode}
        />
        <MissionIntroPreview missionId={missionId} />
      </>
    );
  }

  return (
    <>
      <EditorBottomSaveSlot
        slotKey={`editor-mission-save:${missionId}`}
        isActive={isEditorTab}
        node={saveButtonNode}
      />
      <EditorMissionDraftProvider>
        <ProjectBasicInfoCard
          ref={basicInfoRef}
          mission={mission}
          onSaveStateChange={state => updateSectionState("basic", state)}
        />
        <Separator className="h-2" />
        <RewardSettingsCard
          ref={rewardRef}
          mission={mission}
          initialReward={reward}
          onSaveStateChange={state => updateSectionState("reward", state)}
        />
        <Separator className="h-2" />
        <ActionSettingsCard
          ref={actionRef}
          missionId={mission.id}
          onSaveStateChange={state => updateSectionState("action", state)}
          getCompletionDraftSnapshot={() => completionRef.current?.exportDraftSnapshot() ?? null}
          completionWorkingSetVersion={completionWorkingSetVersion}
          onWorkingSetChange={handleActionWorkingSetChange}
        />
        <Separator className="h-2" />
        <CompletionSettingsCard
          ref={completionRef}
          missionId={mission.id}
          onSaveStateChange={state => updateSectionState("completion", state)}
          onWorkingSetChange={handleCompletionWorkingSetChange}
        />
      </EditorMissionDraftProvider>
    </>
  );
}
