"use client";

import {
  connectAction,
  connectBranchOption,
  disconnectActionWithCleanup,
  disconnectBranchOptionWithCleanup,
  disconnectStartWithCleanup,
} from "@/actions/action";
import {
  adminActionQueryKeys,
  adminMissionCompletionQueryKeys,
  adminMissionQueryKeys,
} from "@/app/admin/constants/queryKeys";
import { useUpdateMission } from "@/app/admin/hooks/mission/use-update-mission";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useFlowConnections(missionId: string) {
  const queryClient = useQueryClient();
  const updateMission = useUpdateMission({
    onError: error => {
      toast.error(error.message || `${UBIQUITOUS_CONSTANTS.MISSION} 수정 중 오류가 발생했습니다`);
    },
  });
  const [isPending, setIsPending] = useState(false);

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
    async (actionId: string, targetId: string, isCompletion: boolean) => {
      setIsPending(true);
      try {
        await connectAction(actionId, targetId, isCompletion, missionId);
        await invalidateFlowQueries();
        toast.success("액션이 연결되었습니다");
      } catch (error) {
        console.error("액션 연결 실패:", error);
        toast.error(error instanceof Error ? error.message : "액션 연결 중 오류가 발생했습니다");
      } finally {
        setIsPending(false);
      }
    },
    [missionId, invalidateFlowQueries],
  );

  const connectBranchOptionToTarget = useCallback(
    async (actionId: string, optionId: string, targetId: string, isCompletion: boolean) => {
      setIsPending(true);
      try {
        await connectBranchOption(actionId, optionId, targetId, isCompletion, missionId);
        await invalidateFlowQueries();
        toast.success("브랜치 옵션이 연결되었습니다");
      } catch (error) {
        console.error("브랜치 옵션 연결 실패:", error);
        toast.error(
          error instanceof Error ? error.message : "브랜치 옵션 연결 중 오류가 발생했습니다",
        );
      } finally {
        setIsPending(false);
      }
    },
    [missionId, invalidateFlowQueries],
  );

  const disconnectAction = useCallback(
    async (actionId: string) => {
      setIsPending(true);
      try {
        await disconnectActionWithCleanup(actionId, missionId);
        await invalidateFlowQueries();
        toast.success("액션 연결이 해제되었습니다");
      } catch (error) {
        console.error("액션 연결 해제 실패:", error);
        toast.error(
          error instanceof Error ? error.message : "액션 연결 해제 중 오류가 발생했습니다",
        );
      } finally {
        setIsPending(false);
      }
    },
    [missionId, invalidateFlowQueries],
  );

  const disconnectBranchOption = useCallback(
    async (actionId: string, optionId: string) => {
      setIsPending(true);
      try {
        await disconnectBranchOptionWithCleanup(actionId, optionId, missionId);
        await invalidateFlowQueries();
        toast.success("브랜치 옵션 연결이 해제되었습니다");
      } catch (error) {
        console.error("브랜치 옵션 연결 해제 실패:", error);
        toast.error(
          error instanceof Error ? error.message : "브랜치 옵션 연결 해제 중 오류가 발생했습니다",
        );
      } finally {
        setIsPending(false);
      }
    },
    [missionId, invalidateFlowQueries],
  );

  const disconnectStart = useCallback(
    async (targetActionId: string) => {
      setIsPending(true);
      try {
        await disconnectStartWithCleanup(targetActionId, missionId);
        await invalidateFlowQueries();
        toast.success("시작 노드 연결이 해제되었습니다");
      } catch (error) {
        console.error("시작 노드 연결 해제 실패:", error);
        toast.error(
          error instanceof Error ? error.message : "시작 노드 연결 해제 중 오류가 발생했습니다",
        );
      } finally {
        setIsPending(false);
      }
    },
    [missionId, invalidateFlowQueries],
  );

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
