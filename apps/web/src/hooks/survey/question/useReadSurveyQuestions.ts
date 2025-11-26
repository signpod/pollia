import { getSurveyQuestions } from "@/actions/survey-question";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { SurveyQuestionType } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useReadSurveyQuestions = (params?: {
  options?: {
    searchQuery?: string;
    selectedQuestionTypes?: SurveyQuestionType[];
    isDraft?: boolean;
    limit?: number;
  };
}) => {
  return useInfiniteQuery({
    queryKey: surveyQueryKeys.surveyQuestions({
      searchQuery: params?.options?.searchQuery,
      selectedQuestionTypes: params?.options?.selectedQuestionTypes ?? [],
      isDraft: params?.options?.isDraft ?? false,
    }),
    queryFn: ({ pageParam }) => {
      return getSurveyQuestions({
        searchQuery: params?.options?.searchQuery,
        selectedQuestionTypes: params?.options?.selectedQuestionTypes ?? [],
        isDraft: params?.options?.isDraft,
        cursor: pageParam,
        limit: params?.options?.limit ?? 10,
      });
    },
    select: data => {
      return data.pages.flatMap(page =>
        page.data.map(item => ({
          ...item,
          isDraft: item.surveyId === null,
        })),
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadSurveyQuestionsReturn = ReturnType<typeof useReadSurveyQuestions>;
