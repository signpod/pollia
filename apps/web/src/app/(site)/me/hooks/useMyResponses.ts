"use client";

import { getMissionActionsDetail } from "@/actions/action";
import { getMyResponses } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useMyResponses() {
  const responsesQuery = useQuery({
    queryKey: missionQueryKeys.myResponses(),
    queryFn: () => getMyResponses(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const missionIds = useMemo(() => {
    const responses = responsesQuery.data?.data ?? [];
    return [...new Set(responses.map(r => r.missionId))];
  }, [responsesQuery.data]);

  const actionsQueries = useQueries({
    queries: missionIds.map(missionId => ({
      queryKey: ["actions", missionId],
      queryFn: () => getMissionActionsDetail(missionId),
      staleTime: 5 * 60 * 1000,
      enabled: !!missionId,
    })),
  });

  const data = useMemo(() => {
    const responseData = responsesQuery.data;
    if (!responseData?.data) return responseData;

    const actionsMap = new Map<
      string,
      Map<
        string,
        {
          options: Array<{
            id: string;
            order: number;
            title: string;
            nextCompletionId: string | null;
          }>;
        }
      >
    >();

    actionsQueries.forEach((query, index) => {
      const missionId = missionIds[index];
      if (query.data?.data && missionId) {
        const actionMap = new Map(
          query.data.data.map(action => [action.id, { options: action.options }]),
        );
        actionsMap.set(missionId, actionMap);
      }
    });

    const responsesWithScaleOption = responseData.data.map(response => {
      const missionActionsMap = actionsMap.get(response.missionId);
      if (!missionActionsMap) return response;

      const answersWithScaleOption = response.answers.map(answer => {
        if (answer.scaleAnswer === null) return answer;

        const action = missionActionsMap.get(answer.actionId);
        if (!action?.options) return answer;

        const sortedOptions = [...action.options].sort((a, b) => a.order - b.order);
        const selectedOption = sortedOptions[answer.scaleAnswer];

        if (!selectedOption) return answer;

        return {
          ...answer,
          options: [
            {
              id: selectedOption.id,
              title: selectedOption.title,
              order: selectedOption.order,
              nextCompletionId: selectedOption.nextCompletionId,
            },
          ],
        };
      });

      return {
        ...response,
        answers: answersWithScaleOption,
      };
    });

    return {
      ...responseData,
      data: responsesWithScaleOption,
    };
  }, [responsesQuery.data, actionsQueries, missionIds]);

  return {
    data,
    isLoading: responsesQuery.isLoading || actionsQueries.some(q => q.isLoading),
    isError: responsesQuery.isError,
    error: responsesQuery.error,
    isPending: responsesQuery.isPending,
    isSuccess: responsesQuery.isSuccess,
    refetch: responsesQuery.refetch,
  };
}

export type UseMyResponsesReturn = ReturnType<typeof useMyResponses>;
