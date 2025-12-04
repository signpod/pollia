import type { ActionAnswer } from "../action-answer";

export interface StartMissionResponseRequest {
  surveyId: string;
}

export interface CompleteMissionResponseRequest {
  responseId: string;
}

export interface StartMissionResponseResponse {
  data: {
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  };
}

export interface CompleteMissionResponseResponse {
  data: {
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    updatedAt: Date;
  };
}

export interface GetMissionResponseResponse {
  data: {
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    answers: ActionAnswer[];
  };
}

export interface GetMyMissionResponsesResponse {
  data: Array<{
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  }>;
}

export interface GetMissionResponsesResponse {
  data: Array<{
    id: string;
    surveyId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  }>;
}

export interface GetMissionStatsResponse {
  data: {
    total: number;
    completed: number;
    completionRate: number;
  };
}

export interface DeleteMissionResponseResponse {
  message: string;
}
