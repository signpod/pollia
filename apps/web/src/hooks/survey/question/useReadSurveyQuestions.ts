import { getSurveyQuestions } from '@/actions/survey/question/read';
import { surveyQueryKeys } from '@/constants/queryKeys/surveyQueryKeys';
import { useQuery } from '@tanstack/react-query';

export const useReadSurveyQuestions = (params?: {
  options?: {
    searchQuery?: string;
  };
}) => {
  return useQuery({
    queryKey: surveyQueryKeys.surveyQuestions(),
    queryFn: () => {
      return getSurveyQuestions({
        searchQuery: params?.options?.searchQuery,
      });
    },
    select: (data) => data?.data ?? [],
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
