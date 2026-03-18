import type { CompletionLinkInput } from "@/types/dto";

export type CreateMissionCompletionInput = {
  title: string;
  description: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  links?: CompletionLinkInput[];
  missionId: string;
  minScoreRatio?: number | null;
  maxScoreRatio?: number | null;
};

export type UpdateMissionCompletionInput = {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  links?: CompletionLinkInput[];
  minScoreRatio?: number | null;
  maxScoreRatio?: number | null;
};
