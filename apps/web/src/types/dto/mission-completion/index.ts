import type { MissionCompletion } from "@prisma/client";

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
  data: MissionCompletion & {
    imageFileUpload: { id: string; publicUrl: string } | null;
  };
}

export interface CreateMissionCompletionResponse {
  data: MissionCompletion & {
    imageFileUpload: { id: string; publicUrl: string } | null;
  };
}

export interface UpdateMissionCompletionResponse {
  data: MissionCompletion & {
    imageFileUpload: { id: string; publicUrl: string } | null;
  };
}

export interface DeleteMissionCompletionResponse {
  message: string;
}
