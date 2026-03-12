import type { CompletionLinkInput } from "@/types/dto";

export type CreateMissionCompletionInput = {
  title: string;
  description: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  links?: CompletionLinkInput[];
  missionId: string;
};

export type UpdateMissionCompletionInput = {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  links?: CompletionLinkInput[];
};
