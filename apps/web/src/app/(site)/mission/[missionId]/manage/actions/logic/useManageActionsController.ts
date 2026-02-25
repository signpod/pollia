"use client";

import { updateMission } from "@/actions/mission/update";
import type { ActionDetail } from "@/types/dto";
import type { ActionType } from "@prisma/client";
import { toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import type { ActionFormValues } from "../components/ActionForm";
import {
  useManageConnectAction,
  useManageConnectBranchOption,
  useManageCreateAction,
  useManageDeleteAction,
  useManageReorderActions,
  useManageUpdateAction,
} from "../hooks";
import { mapCreateActionInput, mapEditInitialValues, mapUpdateActionInput } from "./mappers";
import type { ConnectionIntent, DrawerMode, UseManageActionsControllerParams } from "./types";

export function useManageActionsController({
  missionId,
  actions,
}: UseManageActionsControllerParams) {
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [selectedType, setSelectedType] = useState<ActionType | null>(null);
  const [editingAction, setEditingAction] = useState<ActionDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActionDetail | null>(null);
  const [pendingConnection, setPendingConnection] = useState<ConnectionIntent>(null);

  const closeDrawer = useCallback(() => {
    setDrawerMode("closed");
    setSelectedType(null);
    setEditingAction(null);
  }, []);

  const connectAction = useManageConnectAction({
    onError: error => {
      toast({
        message: error.message || "액션 연결에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const connectBranchOption = useManageConnectBranchOption({
    onError: error => {
      toast({
        message: error.message || "분기 옵션 연결에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const createAction = useManageCreateAction({
    onSuccess: async data => {
      const createdActionId = data?.data?.id;

      if (actions.length === 0 && createdActionId) {
        try {
          await updateMission(missionId, { entryActionId: createdActionId });
        } catch {
          toast({
            message: "시작 액션 설정 중 오류가 발생했습니다.",
            icon: AlertCircle,
            iconClassName: "text-red-500",
          });
        }
      }

      if (pendingConnection && createdActionId) {
        try {
          if (pendingConnection.kind === "action") {
            await connectAction.mutateAsync({
              sourceActionId: pendingConnection.sourceActionId,
              targetId: createdActionId,
              isCompletion: false,
              missionId,
            });
          }

          if (pendingConnection.kind === "branch-option") {
            await connectBranchOption.mutateAsync({
              actionId: pendingConnection.sourceActionId,
              optionId: pendingConnection.sourceOptionId,
              targetId: createdActionId,
              isCompletion: false,
              missionId,
            });
          }
        } catch {
          // onError에서 공통 토스트 처리
        }
      }

      setPendingConnection(null);
      toast({ message: "액션이 추가되었습니다." });
      closeDrawer();
    },
    onError: error => {
      toast({
        message: error.message || "액션 추가에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const updateAction = useManageUpdateAction({
    onSuccess: () => {
      toast({ message: "액션이 수정되었습니다." });
      closeDrawer();
    },
    onError: error => {
      toast({
        message: error.message || "액션 수정에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const deleteAction = useManageDeleteAction({
    onSuccess: () => {
      toast({ message: "액션이 삭제되었습니다." });
      setDeleteTarget(null);
    },
    onError: error => {
      toast({
        message: error.message || "액션 삭제에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const reorderActions = useManageReorderActions({
    onError: error => {
      toast({
        message: error.message || "순서 변경에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const handleTypeSelect = useCallback((type: ActionType) => {
    setSelectedType(type);
    setDrawerMode("create");
  }, []);

  const openTypeSelector = useCallback(() => {
    setPendingConnection(null);
    setDrawerMode("type-select");
  }, []);

  const requestConnectFromAction = useCallback((sourceActionId: string) => {
    setPendingConnection({ kind: "action", sourceActionId });
    setDrawerMode("type-select");
  }, []);

  const requestConnectFromBranchOption = useCallback(
    (sourceActionId: string, sourceOptionId: string) => {
      setPendingConnection({
        kind: "branch-option",
        sourceActionId,
        sourceOptionId,
      });
      setDrawerMode("type-select");
    },
    [],
  );

  const handleEdit = useCallback((action: ActionDetail) => {
    setEditingAction(action);
    setSelectedType(action.type);
    setDrawerMode("edit");
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteAction.mutate({ actionId: deleteTarget.id, missionId });
  }, [deleteTarget, deleteAction, missionId]);

  const handleMoveUp = useCallback(
    (action: ActionDetail) => {
      const idx = actions.findIndex(a => a.id === action.id);
      if (idx <= 0) return;

      const newActions = [...actions];
      const prev = newActions[idx - 1];
      const curr = newActions[idx];
      if (!prev || !curr) return;
      newActions[idx - 1] = curr;
      newActions[idx] = prev;

      reorderActions.mutate({
        missionId,
        actionOrders: newActions.map((item, order) => ({ id: item.id, order })),
      });
    },
    [actions, missionId, reorderActions],
  );

  const handleMoveDown = useCallback(
    (action: ActionDetail) => {
      const idx = actions.findIndex(a => a.id === action.id);
      if (idx < 0 || idx >= actions.length - 1) return;

      const newActions = [...actions];
      const curr = newActions[idx];
      const next = newActions[idx + 1];
      if (!curr || !next) return;
      newActions[idx] = next;
      newActions[idx + 1] = curr;

      reorderActions.mutate({
        missionId,
        actionOrders: newActions.map((item, order) => ({ id: item.id, order })),
      });
    },
    [actions, missionId, reorderActions],
  );

  const handleCreateSubmit = useCallback(
    (values: ActionFormValues) => {
      if (!selectedType) return;

      createAction.mutate(
        mapCreateActionInput({
          missionId,
          selectedType,
          values,
          order: actions.length,
        }),
      );
    },
    [actions.length, createAction, missionId, selectedType],
  );

  const handleEditSubmit = useCallback(
    (values: ActionFormValues) => {
      if (!editingAction) return;

      updateAction.mutate(
        mapUpdateActionInput({
          missionId,
          editingActionId: editingAction.id,
          values,
        }),
      );
    },
    [editingAction, missionId, updateAction],
  );

  const getEditInitialValues = useCallback((action: ActionDetail) => {
    return mapEditInitialValues(action);
  }, []);

  return {
    drawerMode,
    selectedType,
    editingAction,
    deleteTarget,
    pendingConnection,
    isCreateLoading: createAction.isPending,
    isUpdateLoading: updateAction.isPending,
    isDeleteLoading: deleteAction.isPending,
    openTypeSelector,
    handleTypeSelect,
    handleEdit,
    handleDeleteConfirm,
    handleMoveUp,
    handleMoveDown,
    handleCreateSubmit,
    handleEditSubmit,
    closeDrawer,
    setDeleteTarget,
    requestConnectFromAction,
    requestConnectFromBranchOption,
    getEditInitialValues,
  };
}
