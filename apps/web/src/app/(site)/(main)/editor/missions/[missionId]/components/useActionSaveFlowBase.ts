import { applyMissionActionSectionDraft } from "@/actions/mission/apply-draft";
import type {
  ActionFormHandle,
  ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { actionSectionDraftSnapshotSchema } from "@/server/services/action/actionSectionDraftSchema";
import type { SaveActionSectionResult } from "@/server/services/action/types";
import type { ActionType } from "@prisma/client";
import { toast } from "@repo/ui/components";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import type {
  ActionListItem,
  ActionSectionDraftSnapshot,
  DraftActionItem,
} from "./actionSettingsCard.types";
import { DRAFT_ITEM_PREFIX, getDraftItemKey } from "./actionSettingsCard.utils";
import type { SectionSaveHandle, SectionSaveOptions, SectionSaveResult } from "./editor-save.types";

export interface ActionSaveFlowMessages {
  FORM_NOT_READY: string;
  UPLOAD_IN_PROGRESS: string;
  INVALID_INPUT: string;
  SAVE_IN_PROGRESS: string;
  SAVE_SUCCESS: string;
  SAVE_FAILED: string;
}

type AtomSetter<T> = (value: T | ((prev: T) => T)) => void;

export interface ActionSaveFlowAtomSetters {
  setIsApplying: AtomSetter<boolean>;
  setDraftItems: AtomSetter<DraftActionItem[]>;
  setItemOrderKeys: AtomSetter<string[]>;
  setOpenItemKey: AtomSetter<string | null>;
  setDirtyByItemKey: AtomSetter<Record<string, boolean>>;
  setExistingFormVersionById: AtomSetter<Record<string, number>>;
  setActionTypeByItemKey: AtomSetter<Record<string, ActionType>>;
  setDraftFormSnapshotByItemKey: AtomSetter<Record<string, ActionFormRawSnapshot>>;
  setValidationIssueCountByItemKey: AtomSetter<Record<string, number>>;
  setDraftHydrationVersion: AtomSetter<number>;
}

export interface UseActionSaveFlowBaseParams {
  missionId: string;
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  orderedActionItems: ActionListItem[];
  isActionsLoading: boolean;
  isBusy: boolean;
  hasPendingChanges: boolean;
  getActionDraftSnapshot: () => ActionSectionDraftSnapshot;
  queryClient: QueryClient;
  atomSetters: ActionSaveFlowAtomSetters;
  messages: ActionSaveFlowMessages;
  getQueryKeysToInvalidate: (missionId: string) => QueryKey[];
  onAfterApply?: (result: SaveActionSectionResult) => void;
}

export interface UseActionSaveFlowBaseReturn {
  executeSave: (options?: SectionSaveOptions) => Promise<SectionSaveResult>;
  saveHandle: SectionSaveHandle;
}

export function useActionSaveFlowBase({
  missionId,
  formRefs,
  orderedActionItems,
  isActionsLoading,
  isBusy,
  hasPendingChanges,
  getActionDraftSnapshot,
  queryClient,
  atomSetters,
  messages,
  getQueryKeysToInvalidate,
  onAfterApply,
}: UseActionSaveFlowBaseParams): UseActionSaveFlowBaseReturn {
  const {
    setIsApplying,
    setDraftItems,
    setOpenItemKey,
    setDirtyByItemKey,
    setExistingFormVersionById,
    setActionTypeByItemKey,
    setDraftFormSnapshotByItemKey,
    setValidationIssueCountByItemKey,
  } = atomSetters;

  const latestRef = useRef({ missionId, formRefs, orderedActionItems, isActionsLoading, isBusy });
  latestRef.current = { missionId, formRefs, orderedActionItems, isActionsLoading, isBusy };

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const onAfterApplyRef = useRef(onAfterApply);
  onAfterApplyRef.current = onAfterApply;
  const getQueryKeysRef = useRef(getQueryKeysToInvalidate);
  getQueryKeysRef.current = getQueryKeysToInvalidate;

  // biome-ignore lint/correctness/useExhaustiveDependencies: latestRef/messagesRef/onAfterApplyRef/getQueryKeysRef로 최신 값 참조. atom setter들은 안정 참조
  const executeSave = useCallback(
    async ({
      silent = false,
      showValidationUi = true,
      trigger = "manual",
    }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
      const { missionId, formRefs, orderedActionItems, isActionsLoading, isBusy } =
        latestRef.current;
      const msgs = messagesRef.current;

      if (isActionsLoading || isBusy) {
        return { status: "failed", message: msgs.SAVE_IN_PROGRESS };
      }

      const strictMode = trigger === "publish";

      for (const item of orderedActionItems) {
        const formRef = formRefs.current[item.key];
        if (!formRef) {
          if (showValidationUi) setOpenItemKey(item.key);
          if (strictMode) return { status: "failed", message: msgs.FORM_NOT_READY };
          continue;
        }

        if (formRef.isUploading()) {
          if (showValidationUi) setOpenItemKey(item.key);
          if (strictMode) return { status: "failed", message: msgs.UPLOAD_IN_PROGRESS };
          continue;
        }

        const submission = formRef.validateAndGetSubmission({ showErrors: showValidationUi });
        if (!submission) {
          if (showValidationUi) setOpenItemKey(item.key);
          if (strictMode) return { status: "invalid", message: msgs.INVALID_INPUT };
        }
      }

      setIsApplying(true);
      try {
        const response = await applyMissionActionSectionDraft(missionId);
        const result = response.data;

        onAfterApplyRef.current?.(result);

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

        const queryKeys = getQueryKeysRef.current(missionId);
        await Promise.all(queryKeys.map(queryKey => queryClient.invalidateQueries({ queryKey })));

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
          toast({ message: msgs.SAVE_SUCCESS });
        }

        return savedCount > 0 ? { status: "saved", savedCount } : { status: "no_changes" };
      } catch (error) {
        const message = error instanceof Error ? error.message : msgs.SAVE_FAILED;
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: atom setter들은 안정 참조
  const importDraftSnapshot = useCallback(async (snapshot: unknown) => {
    const parsed = actionSectionDraftSnapshotSchema.safeParse(snapshot);
    if (!parsed.success) return;

    const next = parsed.data;
    atomSetters.setDraftItems(next.draftItems);
    atomSetters.setItemOrderKeys(next.itemOrderKeys ?? []);
    atomSetters.setOpenItemKey(null);
    atomSetters.setDirtyByItemKey(next.dirtyByItemKey);
    atomSetters.setActionTypeByItemKey(next.actionTypeByItemKey);

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
    atomSetters.setDraftFormSnapshotByItemKey(sanitizedSnapshots);
    atomSetters.setDraftHydrationVersion(prev => prev + 1);
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

  return { executeSave, saveHandle };
}
