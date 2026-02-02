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
import { toast } from "sonner";

export function useFlowConnections(missionId: string) {
  const queryClient = useQueryClient();
  const updateMission = useUpdateMission({
    onError: error => {
      toast.error(error.message || "미션 수정 중 오류가 발생했습니다");
    },
  });
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
        try {
          await connectAction(actionId, targetId, isCompletion, missionId);
          await invalidateFlowQueries();
          toast.success("액션이 연결되었습니다");
        } catch (error) {
          console.error("액션 연결 실패:", error);
          toast.error(error instanceof Error ? error.message : "액션 연결 중 오류가 발생했습니다");
        }
      });
    },
    [missionId, invalidateFlowQueries],
  );

  const connectBranchOptionToTarget = useCallback(
    (actionId: string, optionId: string, targetId: string, isCompletion: boolean) => {
      startTransition(async () => {
        try {
          await connectBranchOption(actionId, optionId, targetId, isCompletion, missionId);
          await invalidateFlowQueries();
          toast.success("브랜치 옵션이 연결되었습니다");
        } catch (error) {
          console.error("브랜치 옵션 연결 실패:", error);
          toast.error(
            error instanceof Error ? error.message : "브랜치 옵션 연결 중 오류가 발생했습니다",
          );
        }
      });
    },
    [missionId, invalidateFlowQueries],
  );

  const disconnectAction = useCallback(
    (actionId: string) => {
      startTransition(async () => {
        try {
          await disconnectActionWithCleanup(actionId, missionId);
          await invalidateFlowQueries();
          toast.success("액션 연결이 해제되었습니다");
        } catch (error) {
          console.error("액션 연결 해제 실패:", error);
          toast.error(
            error instanceof Error ? error.message : "액션 연결 해제 중 오류가 발생했습니다",
          );
        }
      });
    },
    [missionId, invalidateFlowQueries],
  );

  const disconnectBranchOption = useCallback(
    (actionId: string, optionId: string) => {
      startTransition(async () => {
        try {
          await disconnectBranchOptionWithCleanup(actionId, optionId, missionId);
          await invalidateFlowQueries();
          toast.success("브랜치 옵션 연결이 해제되었습니다");
        } catch (error) {
          console.error("브랜치 옵션 연결 해제 실패:", error);
          toast.error(
            error instanceof Error ? error.message : "브랜치 옵션 연결 해제 중 오류가 발생했습니다",
          );
        }
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
