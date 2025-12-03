import { getMyResponseForSurvey } from "@/actions/mission-response";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadSurveyResponseForSurvey({ surveyId }: { surveyId: string }) {
  return useQuery({
    queryKey: surveyQueryKeys.surveyResponseForSurvey(surveyId),
    queryFn: () => getMyResponseForSurvey(surveyId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!surveyId,
  });
}

export type UseReadSurveyResponseForSurveyReturn = ReturnType<
  typeof useReadSurveyResponseForSurvey
>;
