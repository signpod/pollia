import type { MissionCompletion } from "@prisma/client";

export type MissionCompletionData = Omit<MissionCompletion, "links"> & {
  links: Record<string, string> | null;
  imageFileUpload: { id: string; publicUrl: string } | null;
};

export interface CreateMissionCompletionRequest {
  title: string;
  description: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  links?: Record<string, string>;
  missionId: string;
}

export interface UpdateMissionCompletionRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  links?: Record<string, string>;
}

export interface GetMissionCompletionResponse {
  data: MissionCompletionData;
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
