import type { ColumnDef, SubmissionRow } from "@/server/services/submission-list";
import type { Action, ActionAnswer, ActionOption, FileUpload } from "@prisma/client";

export interface StartMissionResponseRequest {
  missionId: string;
}

export interface CompleteMissionResponseRequest {
  responseId: string;
}

export interface MissionResponseActor {
  userId: string | null;
  guestId: string | null;
}

export interface MissionResponseBase extends MissionResponseActor {
  id: string;
  missionId: string;
  startedAt: Date;
  completedAt: Date | null;
  selectedCompletionId: string | null;
  createdAt: Date;
}

export interface StartMissionResponseResponse {
  data: MissionResponseBase;
}

export interface CompleteMissionResponseResponse {
  data: MissionResponseBase & {
    updatedAt: Date;
  };
}

export interface GetMissionResponseResponse {
  data: MissionResponseBase & {
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

export interface MissionResponseListItem extends MissionResponseBase {
  user?: {
    name: string;
    phone: string | null;
  } | null;
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
    nextCompletionId: string | null;
  };
  options: Array<{
    id: string;
    title: string;
    order: number;
    nextCompletionId: string | null;
  }>;
  fileUploads: Array<{
    id: string;
    publicUrl: string;
    originalFileName: string;
  }>;
}

export interface MyMissionResponse extends MissionResponseBase {
  mission: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    estimatedMinutes: number | null;
    category: string;
    deadline: Date | null;
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
  data: MissionResponseListItem[];
}

export interface GetMissionStatsResponse {
  data: {
    total: number;
    completed: number;
    completionRate: number;
  };
}

export interface GetMissionResponsesPageResponse {
  data: {
    columns: ColumnDef[];
    rows: SubmissionRow[];
    pagination: {
      page: number;
      pageSize: number;
      totalRows: number;
      totalPages: number;
    };
  };
}

export interface DeleteMissionResponseResponse {
  message: string;
}
