"use client";

import { submitAnswers } from "@/actions/action-answer";
import { completeMissionResponse } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { SubmitActionAnswersRequest, SubmitActionAnswersResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseSubmitMissionAnswersOptions {
  missionId: string;
  onSuccess?: (data: SubmitActionAnswersResponse) => void;
  onError?: (error: Error) => void;
}

export function useSubmitMissionAnswers(options: UseSubmitMissionAnswersOptions) {
  const queryClient = useQueryClient();
  const { missionId } = options;

  return useMutation({
    mutationFn: async (
      payload: SubmitActionAnswersRequest,
    ): Promise<SubmitActionAnswersResponse> => {
      const submitResult = await submitAnswers(payload);

      await completeMissionResponse({ responseId: payload.responseId });

      return submitResult;
    },
    onSuccess: data => {
      options.onSuccess?.(data);
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.missionResponseForMission(missionId),
      });
    },
    onError: error => {
      console.error("❌ 설문 답변 제출 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseSubmitSurveyAnswersReturn = ReturnType<typeof useSubmitMissionAnswers>;
