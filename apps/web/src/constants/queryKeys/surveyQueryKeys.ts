export const surveyQueryKeys = {
  survey: (surveyId: string) => ["survey", surveyId] as const,
  surveyQuestions: (params?: {
    surveyId?: string;
    searchQuery?: string;
    selectedQuestionTypes?: string[];
  }) => {
    const base = params?.surveyId
      ? (["survey-questions", params.surveyId] as const)
      : (["survey-questions"] as const);

    if (!params?.searchQuery && !params?.selectedQuestionTypes?.length) {
      return base;
    }

    return [
      ...base,
      {
        searchQuery: params?.searchQuery ?? "",
        selectedQuestionTypes: params?.selectedQuestionTypes ?? [],
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
