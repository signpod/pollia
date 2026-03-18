import { applyMissionActionSectionDraft } from "@/actions/mission/apply-draft";
import type { ActionFormHandle } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { actionSectionDraftSnapshotSchema } from "@/server/services/action/actionSectionDraftSchema";
import { toast } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import type {
  ActionListItem,
  ActionSectionDraftSnapshot,
} from "../../../missions/[missionId]/components/actionSettingsCard.types";
import {
  DRAFT_ITEM_PREFIX,
  getDraftItemKey,
} from "../../../missions/[missionId]/components/actionSettingsCard.utils";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveResult,
} from "../../../missions/[missionId]/components/editor-save.types";
import {
  quizActionDirtyByItemKeyAtom,
  quizActionDraftHydrationVersionAtom,
  quizActionDraftItemsAtom,
  quizActionFormSnapshotByItemKeyAtom,
  quizActionFormVersionByIdAtom,
  quizActionIsApplyingAtom,
  quizActionItemOrderKeysAtom,
  quizActionOpenItemKeyAtom,
  quizActionTypeByItemKeyAtom,
  quizActionValidationIssueCountByItemKeyAtom,
} from "../atoms/quizActionAtoms";

const SAVE_MESSAGES = {
  FORM_NOT_READY: "질문 폼이 준비되지 않았습니다. 다시 시도해주세요.",
  UPLOAD_IN_PROGRESS: "이미지 업로드가 완료된 뒤 저장해주세요.",
  INVALID_INPUT: "질문 입력값을 확인해주세요.",
  SAVE_IN_PROGRESS: "질문 목록 저장이 진행 중입니다.",
  SAVE_SUCCESS: "질문 목록 설정이 저장되었습니다.",
  SAVE_FAILED: "질문 목록 설정 저장에 실패했습니다.",
} as const;

interface UseQuizActionSaveFlowParams {
  missionId: string;
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  orderedActionItems: ActionListItem[];
  isActionsLoading: boolean;
  isBusy: boolean;
  hasPendingChanges: boolean;
  getActionDraftSnapshot: () => ActionSectionDraftSnapshot;
}

export interface UseQuizActionSaveFlowReturn {
  isApplying: boolean;
  executeSave: (options?: SectionSaveOptions) => Promise<SectionSaveResult>;
  saveHandle: SectionSaveHandle;
}

export function useQuizActionSaveFlow({
  missionId,
  formRefs,
  orderedActionItems,
  isActionsLoading,
  isBusy,
  hasPendingChanges,
  getActionDraftSnapshot,
}: UseQuizActionSaveFlowParams): UseQuizActionSaveFlowReturn {
  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useAtom(quizActionIsApplyingAtom);
  const setDraftItems = useSetAtom(quizActionDraftItemsAtom);
  const setItemOrderKeys = useSetAtom(quizActionItemOrderKeysAtom);
  const setOpenItemKey = useSetAtom(quizActionOpenItemKeyAtom);
  const setDirtyByItemKey = useSetAtom(quizActionDirtyByItemKeyAtom);
  const setExistingFormVersionById = useSetAtom(quizActionFormVersionByIdAtom);
  const setActionTypeByItemKey = useSetAtom(quizActionTypeByItemKeyAtom);
  const setDraftFormSnapshotByItemKey = useSetAtom(quizActionFormSnapshotByItemKeyAtom);
  const setValidationIssueCountByItemKey = useSetAtom(quizActionValidationIssueCountByItemKeyAtom);
  const setDraftHydrationVersion = useSetAtom(quizActionDraftHydrationVersionAtom);

  const latestRef = useRef({ missionId, formRefs, orderedActionItems, isActionsLoading, isBusy });
  latestRef.current = { missionId, formRefs, orderedActionItems, isActionsLoading, isBusy };

  // biome-ignore lint/correctness/useExhaustiveDependencies: latestRef로 최신 값 참조
  const executeSave = useCallback(
    async ({
      silent = false,
      showValidationUi = true,
      trigger = "manual",
    }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
      const { missionId, formRefs, orderedActionItems, isActionsLoading, isBusy } =
        latestRef.current;

      if (isActionsLoading || isBusy) {
        return { status: "failed", message: SAVE_MESSAGES.SAVE_IN_PROGRESS };
      }

      const strictMode = trigger === "publish";

      for (const item of orderedActionItems) {
        const formRef = formRefs.current[item.key];
        if (!formRef) {
          if (showValidationUi) setOpenItemKey(item.key);
          if (strictMode) return { status: "failed", message: SAVE_MESSAGES.FORM_NOT_READY };
          continue;
        }

        if (formRef.isUploading()) {
          if (showValidationUi) setOpenItemKey(item.key);
          if (strictMode) return { status: "failed", message: SAVE_MESSAGES.UPLOAD_IN_PROGRESS };
          continue;
        }

        const submission = formRef.validateAndGetSubmission({ showErrors: showValidationUi });
        if (!submission) {
          if (showValidationUi) setOpenItemKey(item.key);
          if (strictMode) return { status: "invalid", message: SAVE_MESSAGES.INVALID_INPUT };
        }
      }

      setIsApplying(true);
      try {
        const response = await applyMissionActionSectionDraft(missionId);
        const result = response.data;

        const savedDraftKeys = new Set(
          Object.keys(result.tempToRealActionIdMap).map(key =>
            key.startsWith(DRAFT_ITEM_PREFIX) ? key.slice(DRAFT_ITEM_PREFIX.length) : key,
          ),
        );
        if (savedDraftKeys.size > 0) {
          setDraftItems(prev => prev.filter(item => !savedDraftKeys.has(item.key)));
          setActionTypeByItemKey(prev => {
            const next = { ...prev };
            for (const draftKey of savedDraftKeys) {
              delete next[getDraftItemKey(draftKey)];
            }
            return next;
          });
        }

        setDirtyByItemKey({});
        setDraftFormSnapshotByItemKey({});
        setValidationIssueCountByItemKey({});

        for (const item of latestRef.current.orderedActionItems) {
          latestRef.current.formRefs.current[item.key]?.deleteMarkedInitialImages();
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: actionQueryKeys.actions({ missionId }) }),
          queryClient.invalidateQueries({ queryKey: missionQueryKeys.mission(missionId) }),
        ]);

        if (result.updatedActionIds.length > 0) {
          setExistingFormVersionById(prev => {
            const next = { ...prev };
            for (const actionId of result.updatedActionIds) {
              next[actionId] = (next[actionId] ?? 0) + 1;
            }
            return next;
          });
        }

        const savedCount = result.createdActionIds.length + result.updatedActionIds.length;
        if (!silent && savedCount > 0) {
          toast({ message: SAVE_MESSAGES.SAVE_SUCCESS });
        }

        return savedCount > 0 ? { status: "saved", savedCount } : { status: "no_changes" };
      } catch (error) {
        const message = error instanceof Error ? error.message : SAVE_MESSAGES.SAVE_FAILED;
        if (!silent) {
          toast({ message, icon: AlertCircle, iconClassName: "text-red-500" });
        }
        return { status: "failed", message };
      } finally {
        setIsApplying(false);
      }
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  const importDraftSnapshot = useCallback(async (snapshot: unknown) => {
    const parsed = actionSectionDraftSnapshotSchema.safeParse(snapshot);
    if (!parsed.success) return;

    const next = parsed.data;
    setDraftItems(next.draftItems);
    setItemOrderKeys(next.itemOrderKeys ?? []);
    setOpenItemKey(null);
    setDirtyByItemKey(next.dirtyByItemKey);
    setActionTypeByItemKey(next.actionTypeByItemKey);

    const sanitizedSnapshots = Object.fromEntries(
      Object.entries(next.formSnapshotByItemKey).map(([key, snap]) => [
        key,
        {
          ...snap,
          values: {
            ...snap.values,
            imageFileUploadId: null,
            ...(snap.values.options
              ? {
                  options: snap.values.options.map(opt => ({
                    ...opt,
                    fileUploadId: null,
                  })),
                }
              : {}),
          },
        },
      ]),
    );
    setDraftFormSnapshotByItemKey(sanitizedSnapshots);
    setDraftHydrationVersion(prev => prev + 1);
  }, []);

  const saveHandle = useMemo<SectionSaveHandle>(
    () => ({
      save: executeSave,
      hasPendingChanges: () => hasPendingChanges,
      isBusy: () => isBusy || isActionsLoading,
      exportDraftSnapshot: (): ActionSectionDraftSnapshot => getActionDraftSnapshot(),
      importDraftSnapshot,
    }),
    [
      executeSave,
      getActionDraftSnapshot,
      hasPendingChanges,
      isActionsLoading,
      isBusy,
      importDraftSnapshot,
    ],
  );

  return { isApplying, executeSave, saveHandle };
}
