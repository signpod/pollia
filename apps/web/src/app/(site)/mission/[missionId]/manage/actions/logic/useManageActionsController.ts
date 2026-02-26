"use client";

import type { ActionDetail } from "@/types/dto";
import { toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useManageDeleteAction, useManageReorderActions } from "../hooks";
import type { UseManageActionsControllerParams } from "./types";

export function useManageActionsController({
  missionId,
  actions,
}: UseManageActionsControllerParams) {
  const [deleteTarget, setDeleteTarget] = useState<ActionDetail | null>(null);

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

  return {
    deleteTarget,
    isDeleteLoading: deleteAction.isPending,
    setDeleteTarget,
    handleDeleteConfirm,
    handleMoveUp,
    handleMoveDown,
  };
}
