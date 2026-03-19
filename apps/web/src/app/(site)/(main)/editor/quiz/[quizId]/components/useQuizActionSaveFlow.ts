import type { ActionFormHandle } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { useMemo } from "react";
import { removeCompletionDraftByIdAtom } from "../../../missions/[missionId]/atoms/editorCompletionAtoms";
import type {
  ActionListItem,
  ActionSectionDraftSnapshot,
} from "../../../missions/[missionId]/components/actionSettingsCard.types";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveResult,
} from "../../../missions/[missionId]/components/editor-save.types";
import type { ActionSaveFlowAtomSetters } from "../../../missions/[missionId]/components/useActionSaveFlowBase";
import { useActionSaveFlowBase } from "../../../missions/[missionId]/components/useActionSaveFlowBase";
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

const getQueryKeysToInvalidate = (missionId: string) => [
  actionQueryKeys.actions({ missionId }),
  missionCompletionQueryKeys.missionCompletion(missionId),
  missionQueryKeys.mission(missionId),
];

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

export function useQuizActionSaveFlow(
  params: UseQuizActionSaveFlowParams,
): UseQuizActionSaveFlowReturn {
  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useAtom(quizActionIsApplyingAtom);
  const dispatchRemoveCompletionDraftById = useSetAtom(removeCompletionDraftByIdAtom);
  const setDraftItems = useSetAtom(quizActionDraftItemsAtom);
  const setItemOrderKeys = useSetAtom(quizActionItemOrderKeysAtom);
  const setOpenItemKey = useSetAtom(quizActionOpenItemKeyAtom);
  const setDirtyByItemKey = useSetAtom(quizActionDirtyByItemKeyAtom);
  const setExistingFormVersionById = useSetAtom(quizActionFormVersionByIdAtom);
  const setActionTypeByItemKey = useSetAtom(quizActionTypeByItemKeyAtom);
  const setDraftFormSnapshotByItemKey = useSetAtom(quizActionFormSnapshotByItemKeyAtom);
  const setValidationIssueCountByItemKey = useSetAtom(quizActionValidationIssueCountByItemKeyAtom);
  const setDraftHydrationVersion = useSetAtom(quizActionDraftHydrationVersionAtom);

  const atomSetters = useMemo<ActionSaveFlowAtomSetters>(
    () => ({
      setIsApplying,
      setDraftItems,
      setItemOrderKeys,
      setOpenItemKey,
      setDirtyByItemKey,
      setExistingFormVersionById,
      setActionTypeByItemKey,
      setDraftFormSnapshotByItemKey,
      setValidationIssueCountByItemKey,
      setDraftHydrationVersion,
    }),
    [
      setIsApplying,
      setDraftItems,
      setItemOrderKeys,
      setOpenItemKey,
      setDirtyByItemKey,
      setExistingFormVersionById,
      setActionTypeByItemKey,
      setDraftFormSnapshotByItemKey,
      setValidationIssueCountByItemKey,
      setDraftHydrationVersion,
    ],
  );

  const { executeSave, saveHandle } = useActionSaveFlowBase({
    ...params,
    queryClient,
    atomSetters,
    messages: SAVE_MESSAGES,
    getQueryKeysToInvalidate,
    onAfterApply: result => {
      for (const tempId of Object.keys(result.tempToRealCompletionIdMap)) {
        dispatchRemoveCompletionDraftById(tempId);
      }
    },
  });

  return { isApplying, executeSave, saveHandle };
}
