"use client";

import { saveMissionEditorDraft } from "@/actions/mission/draft";
import type { GetMissionResponse } from "@/types/dto";
import {
  type EditorMissionDraftPayload,
  type LocalEditorDraftPayload,
  normalizeEditorMissionDraftPayload,
  toServerEditorDraftPayload,
} from "@/types/mission-editor-draft";
import { toast } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type PublishGuardResult,
  editorPublishGuardAtom,
} from "../../../../atoms/editorPublishGuardAtom";
import {
  type UseEditorUndoRedoResult,
  useEditorUndoRedo,
} from "../../../../hooks/useEditorUndoRedo";
import {
  type PostSectionSaveOutcome,
  checkUnifiedSaveGuard,
  resolvePostSectionSaveOutcome,
} from "../../../../missions/[missionId]/components/controllers/editorMissionSaveFlowModel";
import {
  type EditorSectionKey,
  SECTION_LABELS,
  type SectionSaveSummary,
  accumulateSectionSaveResult,
  createEmptySectionSaveSummary,
} from "../../../../missions/[missionId]/components/controllers/editorMissionSaveSummaryModel";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveState,
} from "../../../../missions/[missionId]/components/editor-save.types";
import { quizDraftVersionAtom } from "../../atoms/quizActionAtoms";
import { pickNewerDraft } from "./quizDraftResolveModel";
import { checkQuizPublishGuard } from "./quizPublishGuardModel";

const UNIFIED_SAVE_TOAST_ID = "editor-quiz-save-result";
const LOCAL_DRAFT_STORAGE_KEY_PREFIX = "pollia:quiz-editor-local-draft:";
const LOCAL_DRAFT_AUTOSAVE_DELAY_MS = 800;

type QuizSectionKey = Extract<
  EditorSectionKey,
  "basic" | "reward" | "quizConfig" | "question" | "completion"
>;

const DEFAULT_SECTION_STATE: SectionSaveState = {
  hasPendingChanges: false,
  isBusy: false,
  hasValidationIssues: false,
  validationIssueCount: 0,
};

function getLocalDraftStorageKey(quizId: string): string {
  return `${LOCAL_DRAFT_STORAGE_KEY_PREFIX}${quizId}`;
}

function readLocalDraftPayload(quizId: string): EditorMissionDraftPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getLocalDraftStorageKey(quizId));
    if (!raw) return null;
    return normalizeEditorMissionDraftPayload(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to read local quiz editor draft:", error);
    return null;
  }
}

function writeLocalDraftPayload(quizId: string, payload: LocalEditorDraftPayload): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getLocalDraftStorageKey(quizId),
      JSON.stringify(
        toServerEditorDraftPayload({
          ...payload,
          meta: { updatedAtMs: Date.now() },
        }),
      ),
    );
  } catch (error) {
    console.error("Failed to persist local quiz editor draft:", error);
  }
}

function clearLocalDraftPayload(quizId: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getLocalDraftStorageKey(quizId));
  } catch (error) {
    console.error("Failed to clear local quiz editor draft:", error);
  }
}

interface ResolveDraftToRestoreInput {
  quizId: string;
  mission: GetMissionResponse["data"];
  missionQueryData?: GetMissionResponse["data"] | null;
}

function resolveDraftToRestore({
  quizId,
  mission,
  missionQueryData,
}: ResolveDraftToRestoreInput): EditorMissionDraftPayload | null {
  const latestMission = missionQueryData ?? mission;
  const serverDraftRaw = normalizeEditorMissionDraftPayload(
    (latestMission as { editorDraft?: unknown }).editorDraft,
  );
  const localDraftRaw = readLocalDraftPayload(quizId);
  const serverDraft = serverDraftRaw ? toServerEditorDraftPayload(serverDraftRaw) : null;
  const localDraft = localDraftRaw ? toServerEditorDraftPayload(localDraftRaw) : null;

  return pickNewerDraft(serverDraft, localDraft);
}

interface DraftClearResult {
  serverDraftCleared: boolean;
  serverDraftErrorMessage: string | null;
}

export interface UseEditorQuizControllerParams {
  quizId: string;
  mission: GetMissionResponse["data"];
  currentTab: string;
  missionQueryData?: GetMissionResponse["data"] | null;
  serverActionsCount: number;
  serverCompletionsCount: number;
  questionDraftCount: number;
  completionDraftCount: number;
  isActionsLoading: boolean;
  isCompletionsLoading: boolean;
}

export interface UseEditorQuizControllerResult {
  refs: {
    basicInfoRef: RefObject<SectionSaveHandle | null>;
    rewardRef: RefObject<SectionSaveHandle | null>;
    quizConfigRef: RefObject<SectionSaveHandle | null>;
    questionRef: RefObject<SectionSaveHandle | null>;
    completionRef: RefObject<SectionSaveHandle | null>;
  };
  sectionBindings: {
    onBasicStateChange: (state: SectionSaveState) => void;
    onRewardStateChange: (state: SectionSaveState) => void;
    onQuizConfigStateChange: (state: SectionSaveState) => void;
    onQuestionStateChange: (state: SectionSaveState) => void;
    onCompletionStateChange: (state: SectionSaveState) => void;
  };
  viewState: {
    isSavingAll: boolean;
    hasAnyBusySection: boolean;
    hasAnyPendingChanges: boolean;
    hasAnyValidationIssues: boolean;
  };
  actions: {
    onSave: () => Promise<void>;
  };
  undoRedo: Pick<UseEditorUndoRedoResult, "undo" | "redo" | "canUndo" | "canRedo">;
}

export function useEditorQuizController({
  quizId,
  mission,
  currentTab,
  missionQueryData,
  serverActionsCount,
  serverCompletionsCount,
  questionDraftCount,
  completionDraftCount,
  isActionsLoading,
  isCompletionsLoading,
}: UseEditorQuizControllerParams): UseEditorQuizControllerResult {
  const basicInfoRef = useRef<SectionSaveHandle | null>(null);
  const rewardRef = useRef<SectionSaveHandle | null>(null);
  const quizConfigRef = useRef<SectionSaveHandle | null>(null);
  const questionRef = useRef<SectionSaveHandle | null>(null);
  const completionRef = useRef<SectionSaveHandle | null>(null);
  const draftRestoreAppliedRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const lastAutoSaveTimeRef = useRef(0);

  const [isSavingAll, setIsSavingAll] = useState(false);
  const [sectionStates, setSectionStates] = useState<Record<QuizSectionKey, SectionSaveState>>({
    basic: { ...DEFAULT_SECTION_STATE },
    reward: { ...DEFAULT_SECTION_STATE },
    quizConfig: { ...DEFAULT_SECTION_STATE },
    question: { ...DEFAULT_SECTION_STATE },
    completion: { ...DEFAULT_SECTION_STATE },
  });

  const isEditorTab = currentTab === "editor";
  const draftVersion = useAtomValue(quizDraftVersionAtom);
  const setPublishGuard = useSetAtom(editorPublishGuardAtom);

  const updateSectionState = useCallback((section: QuizSectionKey, nextState: SectionSaveState) => {
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
      return { ...prev, [section]: nextState };
    });
  }, []);

  const hasAnyPendingChanges = useMemo(
    () => Object.values(sectionStates).some(s => s.hasPendingChanges),
    [sectionStates],
  );
  const hasAnyBusySection = useMemo(
    () => Object.values(sectionStates).some(s => s.isBusy),
    [sectionStates],
  );
  const hasAnyValidationIssues = useMemo(
    () => Object.values(sectionStates).some(s => s.hasValidationIssues),
    [sectionStates],
  );

  const hasPendingChangesFromRefs = useCallback(
    () =>
      [
        basicInfoRef.current,
        rewardRef.current,
        quizConfigRef.current,
        questionRef.current,
        completionRef.current,
      ].some(handle => handle?.hasPendingChanges() ?? false),
    [],
  );

  // --- Publish guard ---
  useEffect(() => {
    const guard = (): PublishGuardResult =>
      checkQuizPublishGuard({
        serverActionsCount,
        serverCompletionsCount,
        questionDraftCount,
        completionDraftCount,
      });

    setPublishGuard(() => guard);

    return () => {
      setPublishGuard(null);
    };
  }, [
    setPublishGuard,
    serverActionsCount,
    serverCompletionsCount,
    questionDraftCount,
    completionDraftCount,
  ]);

  // --- Draft collect / apply / clear ---
  const collectLocalDraftPayload = useCallback((): LocalEditorDraftPayload => {
    return {
      basic: basicInfoRef.current?.exportDraftSnapshot() ?? null,
      reward: rewardRef.current?.exportDraftSnapshot() ?? null,
      quizConfig: quizConfigRef.current?.exportDraftSnapshot() ?? null,
      action: questionRef.current?.exportDraftSnapshot() ?? null,
      completion: completionRef.current?.exportDraftSnapshot() ?? null,
    };
  }, []);

  const applyDraftPayload = useCallback(async (payload: EditorMissionDraftPayload) => {
    await Promise.all([
      Promise.resolve(basicInfoRef.current?.importDraftSnapshot(payload.basic ?? null)),
      Promise.resolve(rewardRef.current?.importDraftSnapshot(payload.reward ?? null)),
      Promise.resolve(quizConfigRef.current?.importDraftSnapshot(payload.quizConfig ?? null)),
      Promise.resolve(questionRef.current?.importDraftSnapshot(payload.action ?? null)),
      Promise.resolve(completionRef.current?.importDraftSnapshot(payload.completion ?? null)),
    ]);
  }, []);

  const { pushSnapshot, undo, redo, canUndo, canRedo, getIsUndoRedoInProgress } = useEditorUndoRedo(
    {
      collectSnapshot: collectLocalDraftPayload,
      applySnapshot: applyDraftPayload,
      enabled: isEditorTab,
    },
  );

  const clearPersistedDraft = useCallback(async (): Promise<DraftClearResult> => {
    clearLocalDraftPayload(quizId);

    let serverDraftCleared = false;
    let serverDraftErrorMessage: string | null = null;
    try {
      await saveMissionEditorDraft(quizId, null);
      serverDraftCleared = true;
    } catch (error) {
      serverDraftErrorMessage =
        error instanceof Error ? error.message : "서버 임시저장 정리에 실패했습니다.";
    }

    return { serverDraftCleared, serverDraftErrorMessage };
  }, [quizId]);

  // --- Draft restore ---
  useEffect(() => {
    if (!isEditorTab || draftRestoreAppliedRef.current) return;
    if (
      !basicInfoRef.current ||
      !rewardRef.current ||
      !quizConfigRef.current ||
      !questionRef.current ||
      !completionRef.current
    ) {
      return;
    }
    if (isActionsLoading || isCompletionsLoading) return;

    const selectedDraft = resolveDraftToRestore({
      quizId,
      mission,
      missionQueryData,
    });
    draftRestoreAppliedRef.current = true;

    if (!selectedDraft) {
      pushSnapshot();
      return;
    }

    void applyDraftPayload(selectedDraft)
      .then(() => {
        pushSnapshot();
        toast({ message: "임시 저장된 편집 내용이 복원되었습니다." });
      })
      .catch(error => {
        console.error("Failed to restore quiz editor draft:", error);
      });
  }, [
    applyDraftPayload,
    isActionsLoading,
    isCompletionsLoading,
    isEditorTab,
    mission,
    pushSnapshot,
    quizId,
    missionQueryData,
  ]);

  // --- Auto-save to localStorage + undo history push (throttle) ---
  // biome-ignore lint/correctness/useExhaustiveDependencies: draftVersion and sectionStates are intentional triggers
  useEffect(() => {
    if (!isEditorTab || typeof window === "undefined") return;
    if (!draftRestoreAppliedRef.current) return;
    if (getIsUndoRedoInProgress()) return;
    if (
      !basicInfoRef.current ||
      !rewardRef.current ||
      !quizConfigRef.current ||
      !questionRef.current ||
      !completionRef.current
    ) {
      return;
    }

    const hasPendingChangesNow = hasAnyPendingChanges || hasPendingChangesFromRefs();
    if (!hasPendingChangesNow) return;

    const elapsed = Date.now() - lastAutoSaveTimeRef.current;

    if (elapsed >= LOCAL_DRAFT_AUTOSAVE_DELAY_MS) {
      lastAutoSaveTimeRef.current = Date.now();
      writeLocalDraftPayload(quizId, collectLocalDraftPayload());
      pushSnapshot();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastAutoSaveTimeRef.current = Date.now();
      if (getIsUndoRedoInProgress()) return;
      writeLocalDraftPayload(quizId, collectLocalDraftPayload());
      pushSnapshot();
    }, LOCAL_DRAFT_AUTOSAVE_DELAY_MS - elapsed);

    return () => clearTimeout(timeoutId);
  }, [
    collectLocalDraftPayload,
    draftVersion,
    getIsUndoRedoInProgress,
    hasAnyPendingChanges,
    hasPendingChangesFromRefs,
    isEditorTab,
    pushSnapshot,
    quizId,
    sectionStates,
  ]);

  // --- Unified save flow ---
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
        { key: "basic", label: SECTION_LABELS.basic, ref: basicInfoRef },
        { key: "reward", label: SECTION_LABELS.reward, ref: rewardRef },
        { key: "quizConfig", label: SECTION_LABELS.quizConfig, ref: quizConfigRef },
        { key: "question", label: SECTION_LABELS.question, ref: questionRef },
        { key: "completion", label: SECTION_LABELS.completion, ref: completionRef },
      ];

      let summary: SectionSaveSummary = createEmptySectionSaveSummary();

      for (const section of sections) {
        const handle = section.ref.current;
        if (!handle || !handle.hasPendingChanges()) continue;

        const result = await handle.save({ silent: true, trigger, showValidationUi });
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
              console.error("Failed to clear quiz editor draft:", {
                quizId,
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
              console.error("Failed to clear quiz editor draft:", {
                quizId,
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
    [clearPersistedDraft, quizId],
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
      if (!guard.allowed) return "failed" as const;

      const hasPendingChangesNow = hasAnyPendingChanges || hasPendingChangesFromRefs();
      if (!hasPendingChangesNow) {
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
      hasAnyBusySection,
      hasAnyPendingChanges,
      hasPendingChangesFromRefs,
      isEditorTab,
      isSavingAll,
      runSectionSaves,
    ],
  );

  const saveDraft = useCallback(async () => {
    const draftPayload = collectLocalDraftPayload();
    try {
      await saveMissionEditorDraft(quizId, toServerEditorDraftPayload(draftPayload));
    } catch (error) {
      console.error("Failed to save server draft:", error);
      toast({
        message: "서버 임시저장에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    }
  }, [collectLocalDraftPayload, quizId]);

  const handleSave = useCallback(async () => {
    await saveDraft();
    await runUnifiedSave({ mode: "manual" });
  }, [runUnifiedSave, saveDraft]);

  // --- Section state change callbacks ---
  const onBasicStateChange = useCallback(
    (state: SectionSaveState) => updateSectionState("basic", state),
    [updateSectionState],
  );
  const onRewardStateChange = useCallback(
    (state: SectionSaveState) => updateSectionState("reward", state),
    [updateSectionState],
  );
  const onQuizConfigStateChange = useCallback(
    (state: SectionSaveState) => updateSectionState("quizConfig", state),
    [updateSectionState],
  );
  const onQuestionStateChange = useCallback(
    (state: SectionSaveState) => updateSectionState("question", state),
    [updateSectionState],
  );
  const onCompletionStateChange = useCallback(
    (state: SectionSaveState) => updateSectionState("completion", state),
    [updateSectionState],
  );

  return {
    refs: {
      basicInfoRef,
      rewardRef,
      quizConfigRef,
      questionRef,
      completionRef,
    },
    sectionBindings: {
      onBasicStateChange,
      onRewardStateChange,
      onQuizConfigStateChange,
      onQuestionStateChange,
      onCompletionStateChange,
    },
    viewState: {
      isSavingAll,
      hasAnyBusySection,
      hasAnyPendingChanges,
      hasAnyValidationIssues,
    },
    actions: {
      onSave: handleSave,
    },
    undoRedo: {
      undo,
      redo,
      canUndo,
      canRedo,
    },
  };
}
