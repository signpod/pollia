import { getSurveyQuestions } from '@/actions/survey';
import { surveyQueryKeys } from '@/constants/queryKeys/surveyQueryKeys';
import { SurveyQuestionType } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export const useReadSurveyQuestions = (params?: {
  options?: {
    searchQuery?: string;
    selectedQuestionTypes?: SurveyQuestionType[];
  };
}) => {
  return useQuery({
    queryKey: surveyQueryKeys.surveyQuestions({
      searchQuery: params?.options?.searchQuery,
      selectedQuestionTypes: params?.options?.selectedQuestionTypes ?? [],
    }),
    queryFn: () => {
      return getSurveyQuestions({
        searchQuery: params?.options?.searchQuery,
        selectedQuestionTypes: params?.options?.selectedQuestionTypes ?? [],
      });
    },
    select: (data) => data?.data ?? [],
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadSurveyQuestionsReturn = ReturnType<
  typeof useReadSurveyQuestions
>;
