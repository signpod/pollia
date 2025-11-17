"use client";

import { getSurveyQuestionsDetail } from "@/actions/survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useReadSurveyQuestionsDetail = (surveyId: string) => {
  return useQuery({
    queryKey: surveyQueryKeys.surveyQuestions({ surveyId }),
    queryFn: () => getSurveyQuestionsDetail(surveyId),
  });
};
