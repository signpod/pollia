import { SurveyQuestionType } from "@prisma/client";

export const surveyQueryKeys = {
  survey: (surveyId: string) => ["survey", surveyId] as const,
  surveyQuestions: (params?: {
    surveyId?: string;
    searchQuery?: string;
    selectedQuestionTypes?: SurveyQuestionType[];
    isDraft?: boolean;
  }) => {
    const base = params?.surveyId
      ? (["survey-questions", params.surveyId] as const)
      : (["survey-questions"] as const);
      ? (["survey-questions", params.surveyId] as const)
      : (["survey-questions"] as const);

    const hasFilters =
      params?.searchQuery ||
      (params?.selectedQuestionTypes &&
        params.selectedQuestionTypes.length > 0) ||
      params?.isDraft !== undefined;

    if (!hasFilters) {
      return base;
    }

    return [
      ...base,
      {
        searchQuery: params?.searchQuery ?? "",
        selectedQuestionTypes: params?.selectedQuestionTypes ?? [],
        isDraft: params?.isDraft ?? false,
      },
    ] as const;
  },
  surveyResults: (surveyId: string) => ["survey-results", surveyId] as const,
  userAnswerStatus: (surveyId: string) => ["user-answer-status", surveyId] as const,
  userSurveys: (userId?: string) =>
    userId ? (["user-surveys", userId] as const) : (["user-surveys"] as const),
  all: () => ["survey"] as const,
} as const;

export type SurveyQueryKeys = typeof surveyQueryKeys;
