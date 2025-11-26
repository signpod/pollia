import { getSurvey } from "@/actions/survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useReadSurvey = (surveyId: string) => {
  return useQuery({
    queryKey: surveyQueryKeys.survey(surveyId),
    queryFn: () => getSurvey(surveyId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadSurveyReturn = ReturnType<typeof useReadSurvey>;
