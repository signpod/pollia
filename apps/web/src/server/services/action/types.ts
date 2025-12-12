import type { ActionType } from "@prisma/client";

export interface CreateMultipleChoiceInput {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  maxSelections: number;
  order: number;
  options: {
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
    imageFileUploadId?: string;
  }[];
}

export interface CreateScaleInput {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
  options: {
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
    imageFileUploadId?: string;
  }[];
}

export interface CreateSubjectiveInput {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface CreateEitherOrInput {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface CreateTagInput {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
  maxSelections?: number;
  options: {
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
    imageFileUploadId?: string;
  }[];
}

export interface CreateRatingInput {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
}

export interface CreateImageInput {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
}

export interface UpdateActionOptionInput {
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
  imageFileUploadId?: string;
}

export interface UpdateActionInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  maxSelections?: number;
  options?: UpdateActionOptionInput[];
}

export interface GetActionsOptions {
  searchQuery?: string;
  selectedActionTypes?: ActionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}

export interface ActionCreatedResult {
  id: string;
  missionId: string;
  title: string;
  type: ActionType;
  order: number;
  createdAt: Date;
}
