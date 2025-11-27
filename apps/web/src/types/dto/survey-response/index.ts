import { SurveyQuestionAnswer } from "@prisma/client";

export interface StartSurveyResponseRequest {
  surveyId: string;
}

export interface CompleteSurveyResponseRequest {
  responseId: string;
}

export interface StartSurveyResponseResponse {
  data: {
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  };
}

export interface CompleteSurveyResponseResponse {
  data: {
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    updatedAt: Date;
  };
}

export interface GetSurveyResponseResponse {
  data: {
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    answers: SurveyQuestionAnswer[];
  };
}

export interface GetMyResponsesResponse {
  data: Array<{
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  }>;
}

export interface GetSurveyResponsesResponse {
  data: Array<{
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  }>;
}

export interface GetSurveyStatsResponse {
  data: {
    total: number;
    completed: number;
    completionRate: number;
  };
}

export interface DeleteSurveyResponseResponse {
  message: string;
}
