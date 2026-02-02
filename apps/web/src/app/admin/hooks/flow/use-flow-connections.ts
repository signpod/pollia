"use client";

import {
  connectAction,
  connectBranchOption,
  disconnectActionWithCleanup,
  disconnectBranchOptionWithCleanup,
} from "@/actions/action";
import {
  adminActionQueryKeys,
  adminMissionCompletionQueryKeys,
  adminMissionQueryKeys,
} from "@/app/admin/constants/queryKeys";
import { useUpdateMission } from "@/app/admin/hooks/mission/use-update-mission";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTransition } from "react";

export function useFlowConnections(missionId: string) {
  const queryClient = useQueryClient();
  const updateMission = useUpdateMission();
  const [isPending, startTransition] = useTransition();

  const invalidateFlowQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminMissionQueryKeys.detail(missionId) }),
      queryClient.invalidateQueries({ queryKey: adminActionQueryKeys.actions(missionId) }),
      queryClient.invalidateQueries({
        queryKey: adminMissionCompletionQueryKeys.completionList(missionId),
      }),
    ]);
  }, [queryClient, missionId]);

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
        await invalidateFlowQueries();
      });
    },
    [missionId, invalidateFlowQueries],
  );

  const connectBranchOptionToTarget = useCallback(
    (actionId: string, optionId: string, targetId: string, isCompletion: boolean) => {
      startTransition(async () => {
        await connectBranchOption(actionId, optionId, targetId, isCompletion, missionId);
        await invalidateFlowQueries();
      });
    },
    [missionId, invalidateFlowQueries],
  );

  const disconnectAction = useCallback(
    (actionId: string) => {
      startTransition(async () => {
        await disconnectActionWithCleanup(actionId, missionId);
        await invalidateFlowQueries();
      });
    },
    [missionId, invalidateFlowQueries],
  );

  const disconnectBranchOption = useCallback(
    (actionId: string, optionId: string) => {
      startTransition(async () => {
        await disconnectBranchOptionWithCleanup(actionId, optionId, missionId);
        await invalidateFlowQueries();
      });
    },
    [missionId, invalidateFlowQueries],
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
