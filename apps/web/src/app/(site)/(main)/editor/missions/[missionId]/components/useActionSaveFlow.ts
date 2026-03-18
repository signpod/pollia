import type { ActionFormHandle } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { useMemo } from "react";
import {
  actionDirtyByItemKeyAtom,
  actionDraftHydrationVersionAtom,
  actionDraftItemsAtom,
  actionFormSnapshotByItemKeyAtom,
  actionFormVersionByIdAtom,
  actionIsApplyingAtom,
  actionItemOrderKeysAtom,
  actionOpenItemKeyAtom,
  actionTypeByItemKeyAtom,
  actionValidationIssueCountByItemKeyAtom,
} from "../atoms/editorActionAtoms";
import { removeCompletionDraftByIdAtom } from "../atoms/editorCompletionAtoms";
import type { ActionListItem, ActionSectionDraftSnapshot } from "./actionSettingsCard.types";
import type { SectionSaveHandle, SectionSaveOptions, SectionSaveResult } from "./editor-save.types";
import type { ActionSaveFlowAtomSetters } from "./useActionSaveFlowBase";
import { useActionSaveFlowBase } from "./useActionSaveFlowBase";

const ACTION_SAVE_MESSAGES = {
  FORM_NOT_READY: "질문 폼이 준비되지 않았습니다. 다시 시도해주세요.",
  UPLOAD_IN_PROGRESS: "이미지 업로드가 완료된 뒤 저장해주세요.",
  INVALID_INPUT: "질문 입력값을 확인해주세요.",
  SAVE_IN_PROGRESS: "진행 목록 저장이 진행 중입니다.",
  SAVE_SUCCESS: "진행 목록 설정이 저장되었습니다.",
  SAVE_FAILED: "진행 목록 설정 저장에 실패했습니다.",
} as const;

const getQueryKeysToInvalidate = (missionId: string) => [
  actionQueryKeys.actions({ missionId }),
  missionCompletionQueryKeys.missionCompletion(missionId),
  missionQueryKeys.mission(missionId),
];

interface UseActionSaveFlowParams {
  missionId: string;
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  orderedActionItems: ActionListItem[];
  isActionsLoading: boolean;
  isBusy: boolean;
  hasPendingChanges: boolean;
  getActionDraftSnapshot: () => ActionSectionDraftSnapshot;
}

export interface UseActionSaveFlowReturn {
  isApplying: boolean;
  executeSave: (options?: SectionSaveOptions) => Promise<SectionSaveResult>;
  saveHandle: SectionSaveHandle;
}

export function useActionSaveFlow(params: UseActionSaveFlowParams): UseActionSaveFlowReturn {
  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useAtom(actionIsApplyingAtom);
  const setDraftItems = useSetAtom(actionDraftItemsAtom);
  const setItemOrderKeys = useSetAtom(actionItemOrderKeysAtom);
  const setOpenItemKey = useSetAtom(actionOpenItemKeyAtom);
  const setDirtyByItemKey = useSetAtom(actionDirtyByItemKeyAtom);
  const setExistingFormVersionById = useSetAtom(actionFormVersionByIdAtom);
  const setActionTypeByItemKey = useSetAtom(actionTypeByItemKeyAtom);
  const setDraftFormSnapshotByItemKey = useSetAtom(actionFormSnapshotByItemKeyAtom);
  const setValidationIssueCountByItemKey = useSetAtom(actionValidationIssueCountByItemKeyAtom);
  const setDraftHydrationVersion = useSetAtom(actionDraftHydrationVersionAtom);
  const dispatchRemoveCompletionDraftById = useSetAtom(removeCompletionDraftByIdAtom);

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
    messages: ACTION_SAVE_MESSAGES,
    getQueryKeysToInvalidate,
    onAfterApply: result => {
      for (const tempId of Object.keys(result.tempToRealCompletionIdMap)) {
        dispatchRemoveCompletionDraftById(tempId);
      }
    },
  });

  return { isApplying, executeSave, saveHandle };
}
