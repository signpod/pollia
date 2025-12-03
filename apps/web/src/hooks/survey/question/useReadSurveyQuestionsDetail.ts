"use client";

import { getSurveyQuestionsDetail } from "@/actions/action";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useReadSurveyQuestionsDetail = (surveyId: string) => {
  return useQuery({
    queryKey: surveyQueryKeys.surveyQuestions({ surveyId }),
    queryFn: () => getSurveyQuestionsDetail(surveyId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialData: { data: [] },
  });
};

export type UseReadSurveyQuestionsDetailReturn = ReturnType<typeof useReadSurveyQuestionsDetail>;
