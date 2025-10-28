export const surveyQueryKeys = {
  survey: (surveyId: string) => ["survey", surveyId] as const,
  surveyQuestions: (surveyId: string) =>
    ["survey-questions", surveyId] as const,
  surveyResults: (surveyId: string) => ["survey-results", surveyId] as const,
  userAnswerStatus: (surveyId: string) =>
    ["user-answer-status", surveyId] as const,
  userSurveys: (userId?: string) =>
    userId ? (["user-surveys", userId] as const) : (["user-surveys"] as const),
  all: () => ["survey"] as const,
} as const;

export type SurveyQueryKeys = typeof surveyQueryKeys;
