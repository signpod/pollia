"use client";

import { useUpdateAction } from "@/app/admin/hooks/action/use-update-action";
import { useUpdateMission } from "@/app/admin/hooks/mission/use-update-mission";
import type { FlowNode } from "@/app/admin/missions/[id]/flow/utils/flowTransform";
import type { ActionOption } from "@prisma/client";
import type { Connection } from "@xyflow/react";
import { useCallback } from "react";

export function useFlowConnections(missionId: string) {
  const updateMission = useUpdateMission();
  const updateAction = useUpdateAction();

  const handleStartConnection = useCallback(
    (connection: Connection) => {
      if (!connection.target) return;

      updateMission.mutate({
        missionId,
        data: { entryActionId: connection.target },
      });
    },
    [missionId, updateMission],
  );

  const handleBranchConnection = useCallback(
    (connection: Connection, sourceNode: FlowNode, isCompletion: boolean) => {
      if (!connection.target || !connection.source) return;

      const action = sourceNode.data.action;
      if (!action) return;

      const updatedOptions = action.options.map((opt: ActionOption) =>
        opt.id === connection.sourceHandle
          ? {
              ...opt,
              nextActionId: isCompletion ? null : connection.target,
              nextCompletionId: isCompletion ? connection.target : null,
            }
          : opt,
      );

      updateAction.mutate({
        actionId: connection.source,
        missionId,
        options: updatedOptions,
      });
    },
    [missionId, updateAction],
  );

  const handleActionConnection = useCallback(
    (connection: Connection, isCompletion: boolean) => {
      if (!connection.target || !connection.source) return;

      updateAction.mutate({
        actionId: connection.source,
        missionId,
        ...(isCompletion
          ? { nextCompletionId: connection.target, nextActionId: null }
          : { nextActionId: connection.target, nextCompletionId: null }),
      });
    },
    [missionId, updateAction],
  );

  return {
    handleStartConnection,
    handleBranchConnection,
    handleActionConnection,
  };
}

export type UseFlowConnectionsReturn = ReturnType<typeof useFlowConnections>;
