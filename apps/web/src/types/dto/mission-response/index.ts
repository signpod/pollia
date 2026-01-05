import type { Action, ActionAnswer, ActionOption, FileUpload } from "@prisma/client";

export interface StartMissionResponseRequest {
  missionId: string;
}

export interface CompleteMissionResponseRequest {
  responseId: string;
}

export interface StartMissionResponseResponse {
  data: {
    id: string;
    missionId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  };
}

export interface CompleteMissionResponseResponse {
  data: {
    id: string;
    missionId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    updatedAt: Date;
  };
}

export interface GetMissionResponseResponse {
  data: {
    id: string;
    missionId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    answers: Array<
      ActionAnswer & {
        action: Action;
        option: ActionOption | null;
        fileUploads: FileUpload[];
      }
    >;
  };
}

export interface GetMyMissionResponsesResponse {
  data: Array<{
    id: string;
    missionId: string;
    userId: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  }>;
}

export interface GetMissionResponsesResponse {
  data: Array<{
    id: string;
    missionId: string;
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
