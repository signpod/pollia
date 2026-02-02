"use client";

import {
  connectAction,
  connectBranchOption,
  disconnectActionWithCleanup,
  disconnectBranchOptionWithCleanup,
} from "@/actions/action";
import { useUpdateMission } from "@/app/admin/hooks/mission/use-update-mission";
import { useCallback } from "react";
import { useTransition } from "react";

export function useFlowConnections(missionId: string) {
  const updateMission = useUpdateMission();
  const [isPending, startTransition] = useTransition();

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
      startTransition(async () => {
        await connectAction(actionId, targetId, isCompletion, missionId);
      });
    },
    [missionId],
  );

  const connectBranchOptionToTarget = useCallback(
    (actionId: string, optionId: string, targetId: string, isCompletion: boolean) => {
      startTransition(async () => {
        await connectBranchOption(actionId, optionId, targetId, isCompletion, missionId);
      });
    },
    [missionId],
  );

  const disconnectAction = useCallback(
    (actionId: string) => {
      startTransition(async () => {
        await disconnectActionWithCleanup(actionId, missionId);
      });
    },
    [missionId],
  );

  const disconnectBranchOption = useCallback(
    (actionId: string, optionId: string) => {
      startTransition(async () => {
        await disconnectBranchOptionWithCleanup(actionId, optionId, missionId);
      });
    },
    [missionId],
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
    isPending,
  };
}

export type UseFlowConnectionsReturn = ReturnType<typeof useFlowConnections>;
