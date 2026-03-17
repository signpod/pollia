import type { MissionCompletion } from "@prisma/client";

export type CompletionLinkData = {
  id: string;
  name: string;
  url: string;
  order: number;
  imageUrl: string | null;
  fileUploadId: string | null;
};

export type CompletionLinkInput = {
  name: string;
  url: string;
  order: number;
  imageUrl?: string | null;
  fileUploadId?: string | null;
};

export type MissionCompletionData = MissionCompletion & {
  links: CompletionLinkData[];
  imageFileUpload: { id: string; publicUrl: string } | null;
};

export type MissionCompletionWithMission = MissionCompletion & {
  links: CompletionLinkData[];
  imageFileUpload: { id: string; publicUrl: string } | null;
  mission: { id: string; creatorId: string };
};

export interface CreateMissionCompletionRequest {
  title: string;
  description: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  links?: CompletionLinkInput[];
  missionId: string;
  minScoreRatio?: number | null;
  maxScoreRatio?: number | null;
}

export interface UpdateMissionCompletionRequest {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  links?: CompletionLinkInput[];
  minScoreRatio?: number | null;
  maxScoreRatio?: number | null;
}

export interface GetMissionCompletionResponse {
  data: MissionCompletionData;
}

export interface GetMissionCompletionsResponse {
  data: MissionCompletionWithMission[];
}

export interface CreateMissionCompletionResponse {
  data: MissionCompletionData;
}

export interface UpdateMissionCompletionResponse {
  data: MissionCompletionData;
}

export interface DeleteMissionCompletionResponse {
  message: string;
}
