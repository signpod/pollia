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
        options: ActionOption[];
        fileUploads: FileUpload[];
      }
    >;
  };
}

export interface MyMissionResponseAnswer {
  id: string;
  actionId: string;
  textAnswer: string | null;
  scaleAnswer: number | null;
  booleanAnswer: boolean | null;
  dateAnswers: Date[];
  action: {
    id: string;
    title: string;
    type: string;
    order: number | null;
    isRequired: boolean;
  };
  options: Array<{
    id: string;
    title: string;
    order: number;
  }>;
  fileUploads: Array<{
    id: string;
    publicUrl: string;
    originalFileName: string;
  }>;
}

export interface MyMissionResponse {
  id: string;
  missionId: string;
  userId: string;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  mission: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    estimatedMinutes: number | null;
    _count: {
      questions: number;
    };
  };
  answers: MyMissionResponseAnswer[];
}

export interface GetMyMissionResponsesResponse {
  data: MyMissionResponse[];
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
