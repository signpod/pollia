"use client";

import { getMissionActionsDetail } from "@/actions/action";
import { getMyResponseForMission } from "@/actions/mission-response";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useCurrentUser } from "@/hooks/user";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useReadMissionResponseForMission({ missionId }: { missionId: string }) {
  const { data: currentUser } = useCurrentUser();
  const isLoggedIn = !!currentUser?.id;

  const results = useQueries({
    queries: [
      {
        queryKey: missionQueryKeys.missionResponseForMission(missionId),
        queryFn: () => getMyResponseForMission(missionId),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: !!missionId && isLoggedIn,
      },
      {
        queryKey: actionQueryKeys.actions({ missionId }),
        queryFn: () => getMissionActionsDetail(missionId),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: !!missionId && isLoggedIn,
      },
    ],
  });

  const [missionResponseResult, actionsResult] = results;

  const data = useMemo(() => {
    const responseData = missionResponseResult.data;
    const actionsData = actionsResult.data?.data;

    if (!responseData?.data || !actionsData) {
      return responseData;
    }

    const actionsMap = new Map(actionsData.map(action => [action.id, action]));

    const answersWithScaleOption = responseData.data.answers.map(answer => {
      if (answer.scaleAnswer === null) {
        return answer;
      }

      const action = actionsMap.get(answer.actionId);
      if (!action || action.options.length === 0) {
        return answer;
      }

      const sortedOptions = [...action.options].sort((a, b) => a.order - b.order);
      const selectedOption = sortedOptions[answer.scaleAnswer];

      if (!selectedOption) return answer;

      return {
        ...answer,
        options: [selectedOption],
      };
    });

    return {
      ...responseData,
      data: {
        ...responseData.data,
        answers: answersWithScaleOption,
      },
    };
  }, [missionResponseResult.data, actionsResult.data]);

  return {
    data,
    isLoading: missionResponseResult.isLoading || actionsResult.isLoading,
    isError: missionResponseResult.isError || actionsResult.isError,
    error: missionResponseResult.error || actionsResult.error,
    isPending: missionResponseResult.isPending || actionsResult.isPending,
    isSuccess: missionResponseResult.isSuccess && actionsResult.isSuccess,
    refetch: () => {
      missionResponseResult.refetch();
      actionsResult.refetch();
    },
  };
}

export type UseReadMissionResponseForMissionReturn = ReturnType<
  typeof useReadMissionResponseForMission
>;
