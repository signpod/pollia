"use client";

import { useUpdateAction } from "@/app/admin/hooks/action/use-update-action";
import { useUpdateMission } from "@/app/admin/hooks/mission/use-update-mission";
import type { ActionOption } from "@prisma/client";
import { useCallback } from "react";

export function useFlowConnections(missionId: string) {
  const updateMission = useUpdateMission();
  const updateAction = useUpdateAction();

  const connectStartToAction = useCallback(
    (targetActionId: string) => {
      updateMission.mutate({
        missionId,
        data: { entryActionId: targetActionId },
      });
    },
    [missionId, updateMission],
  );

  const connectActionToTarget = useCallback(
    (actionId: string, targetId: string, isCompletion: boolean) => {
      updateAction.mutate({
        actionId,
        missionId,
        ...(isCompletion
          ? { nextCompletionId: targetId, nextActionId: null }
          : { nextActionId: targetId, nextCompletionId: null }),
      });
    },
    [missionId, updateAction],
  );

  const connectBranchOptionToTarget = useCallback(
    (
      actionId: string,
      optionId: string,
      options: ActionOption[],
      targetId: string,
      isCompletion: boolean,
    ) => {
      const updatedOptions = options.map(opt =>
        opt.id === optionId
          ? {
              ...opt,
              nextActionId: isCompletion ? null : targetId,
              nextCompletionId: isCompletion ? targetId : null,
            }
          : opt,
      );

      updateAction.mutate({
        actionId,
        missionId,
        options: updatedOptions,
      });
    },
    [missionId, updateAction],
  );

  const disconnectAction = useCallback(
    (actionId: string) => {
      updateAction.mutate({
        actionId,
        missionId,
        nextActionId: null,
        nextCompletionId: null,
      });
    },
    [missionId, updateAction],
  );

  const disconnectBranchOption = useCallback(
    (actionId: string, optionId: string, options: ActionOption[]) => {
      const updatedOptions = options.map(opt =>
        opt.id === optionId
          ? {
              ...opt,
              nextActionId: null,
              nextCompletionId: null,
            }
          : opt,
      );

      updateAction.mutate({
        actionId,
        missionId,
        options: updatedOptions,
      });
    },
    [missionId, updateAction],
  );

  const disconnectStart = useCallback(() => {
    updateMission.mutate({
      missionId,
      data: { entryActionId: null },
    });
  }, [missionId, updateMission]);

  return {
    connectStartToAction,
    connectActionToTarget,
    connectBranchOptionToTarget,
    disconnectAction,
    disconnectBranchOption,
    disconnectStart,
  };
}

export type UseFlowConnectionsReturn = ReturnType<typeof useFlowConnections>;
