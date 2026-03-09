import { applyMissionActionSectionDraft } from "@/actions/mission/apply-draft";
import type {
  ActionFormHandle,
  ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ActionType } from "@prisma/client";
import { toast } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
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
import type {
  ActionListItem,
  ActionSectionDraftSnapshot,
  DraftActionItem,
} from "./actionSettingsCard.types";
import { getDraftItemKey } from "./actionSettingsCard.utils";
import type { SectionSaveHandle, SectionSaveOptions, SectionSaveResult } from "./editor-save.types";

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

export function useActionSaveFlow({
  missionId,
  formRefs,
  orderedActionItems,
  isActionsLoading,
  isBusy,
  hasPendingChanges,
  getActionDraftSnapshot,
}: UseActionSaveFlowParams): UseActionSaveFlowReturn {
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

  const latestRef = useRef({ missionId, formRefs, orderedActionItems, isActionsLoading, isBusy });
  latestRef.current = { missionId, formRefs, orderedActionItems, isActionsLoading, isBusy };

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - queryClient, setIsApplying, setDraftItems, setActionTypeByItemKey, setDirtyByItemKey, setDraftFormSnapshotByItemKey, setValidationIssueCountByItemKey, setExistingFormVersionById, dispatchRemoveCompletionDraftById, setOpenItemKey. latestRef로 missionId/formRefs/orderedActionItems/isActionsLoading/isBusy 최신 값 참조
  const executeSave = useCallback(
    async ({
      silent = false,
      showValidationUi = true,
      trigger = "manual",
    }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
      const { missionId, formRefs, orderedActionItems, isActionsLoading, isBusy } =
        latestRef.current;

      if (isActionsLoading || isBusy) {
        return { status: "failed", message: "진행 목록 저장이 진행 중입니다." };
      }

      const strictMode = trigger === "publish";

      for (const item of orderedActionItems) {
        const formRef = formRefs.current[item.key];
        if (!formRef) {
          if (showValidationUi) setOpenItemKey(item.key);
          const message = "질문 폼이 준비되지 않았습니다. 다시 시도해주세요.";
          if (strictMode) return { status: "failed", message };
          continue;
        }

        if (formRef.isUploading()) {
          if (showValidationUi) setOpenItemKey(item.key);
          const message = "이미지 업로드가 완료된 뒤 저장해주세요.";
          if (strictMode) return { status: "failed", message };
          continue;
        }

        const submission = formRef.validateAndGetSubmission({ showErrors: showValidationUi });
        if (!submission) {
          if (showValidationUi) setOpenItemKey(item.key);
          const message = "질문 입력값을 확인해주세요.";
          if (strictMode) return { status: "invalid", message };
        }
      }

      setIsApplying(true);
      try {
        const response = await applyMissionActionSectionDraft(missionId);
        const result = response.data;

        for (const tempId of Object.keys(result.tempToRealCompletionIdMap)) {
          dispatchRemoveCompletionDraftById(tempId);
        }

        const savedDraftKeys = new Set(
          Object.keys(result.tempToRealActionIdMap).map(key => key.replace(/^draft:/, "")),
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
          queryClient.invalidateQueries({
            queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
          }),
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
          toast({ message: "진행 목록 설정이 저장되었습니다." });
        }

        return savedCount > 0 ? { status: "saved", savedCount } : { status: "no_changes" };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "진행 목록 설정 저장에 실패했습니다.";
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setDraftItems, setItemOrderKeys, setOpenItemKey, setDirtyByItemKey, setActionTypeByItemKey, setDraftFormSnapshotByItemKey, setDraftHydrationVersion
  const importDraftSnapshot = useCallback(async (snapshot: unknown) => {
    if (!snapshot || typeof snapshot !== "object") {
      return;
    }

    const next = snapshot as Partial<ActionSectionDraftSnapshot>;
    const nextDraftItems = Array.isArray(next.draftItems)
      ? next.draftItems.filter(
          (item): item is DraftActionItem =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof (item as { key?: unknown }).key === "string",
        )
      : [];

    setDraftItems(nextDraftItems);
    setItemOrderKeys(
      Array.isArray(next.itemOrderKeys)
        ? next.itemOrderKeys.filter((key): key is string => typeof key === "string")
        : [],
    );
    setOpenItemKey(typeof next.openItemKey === "string" ? next.openItemKey : null);
    setDirtyByItemKey(
      next.dirtyByItemKey && typeof next.dirtyByItemKey === "object"
        ? (next.dirtyByItemKey as Record<string, boolean>)
        : {},
    );
    setActionTypeByItemKey(
      next.actionTypeByItemKey && typeof next.actionTypeByItemKey === "object"
        ? (next.actionTypeByItemKey as Record<string, ActionType>)
        : {},
    );
    setDraftFormSnapshotByItemKey(
      next.formSnapshotByItemKey && typeof next.formSnapshotByItemKey === "object"
        ? (next.formSnapshotByItemKey as Record<string, ActionFormRawSnapshot>)
        : {},
    );
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
