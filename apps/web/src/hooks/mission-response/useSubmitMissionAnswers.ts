"use client";

import { submitAnswers } from "@/actions/action-answer";
import { completeMissionResponse, getMyResponseForMission } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { SubmitActionAnswersRequest, SubmitActionAnswersResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseSubmitMissionAnswersOptions {
  missionId: string;
  onSuccess?: (data: SubmitActionAnswersResponse) => void;
  onError?: (error: Error) => void;
  onAlreadyCompleted?: () => void;
}

export function useSubmitMissionAnswers(options: UseSubmitMissionAnswersOptions) {
  const queryClient = useQueryClient();
  const { missionId } = options;

  return useMutation({
    mutationFn: async (
      payload: SubmitActionAnswersRequest,
    ): Promise<SubmitActionAnswersResponse> => {
      // Fetch fresh mission response to check completion status
      const freshResponse = await getMyResponseForMission(missionId);
      if (freshResponse?.data?.completedAt) {
        throw new Error("ALREADY_COMPLETED");
      }

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
      if (error instanceof Error && error.message === "ALREADY_COMPLETED") {
        options.onAlreadyCompleted?.();
        return;
      }
      console.error("❌ 설문 답변 제출 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseSubmitSurveyAnswersReturn = ReturnType<typeof useSubmitMissionAnswers>;
