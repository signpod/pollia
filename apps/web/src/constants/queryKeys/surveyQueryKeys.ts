import { SurveyQuestionType } from "@prisma/client";

export const surveyQueryKeys = {
  surveyQuestions: (params?: {
    surveyId?: string;
    searchQuery?: string;
    selectedQuestionTypes?: SurveyQuestionType[];
    isDraft?: boolean;
  }) => {
    const base = params?.surveyId
      ? (["survey-questions", params.surveyId] as const)
      : (["survey-questions"] as const);

    const hasFilters =
      params?.searchQuery ||
      (params?.selectedQuestionTypes && params.selectedQuestionTypes.length > 0) ||
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
  surveyQuestionIds: (params: { surveyId: string }) =>
    ["survey-question-ids", params.surveyId] as const,
  surveyQuestion: (questionId: string) => ["survey-question", questionId] as const,
  survey: (surveyId: string) => ["survey", surveyId] as const,
  surveyResults: (surveyId: string) => ["survey-results", surveyId] as const,
  userAnswerStatus: (surveyId: string) => ["user-answer-status", surveyId] as const,
  userSurveys: (userId?: string) =>
    userId ? (["user-surveys", userId] as const) : (["user-surveys"] as const),
  all: () => ["survey"] as const,
  surveyResponseForSurvey: (surveyId: string) => ["survey-response-for-survey", surveyId] as const,
} as const;

export type SurveyQueryKeys = typeof surveyQueryKeys;
