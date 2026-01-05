import type { ActionType } from "@/types/domain/action";
import type { Action, ActionOption } from "@prisma/client";

export interface BaseActionRequest {
  missionId?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  order: number;
  isRequired: boolean;
}

export interface ActionOptionInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  order: number;
  imageFileUploadId?: string | null;
}

export interface BaseActionResponse {
  data: {
    id: string;
    missionId: string | null;
    title: string;
    type: ActionType;
    order: number;
    isRequired: boolean;
    createdAt: Date;
  };
}

export interface CreateMultipleChoiceActionRequest extends BaseActionRequest {
  maxSelections: number;
  options: ActionOptionInput[];
}

export interface CreateMultipleChoiceActionResponse extends BaseActionResponse {}

export interface CreateScaleActionRequest extends BaseActionRequest {
  options: ActionOptionInput[];
}

export interface CreateScaleActionResponse extends BaseActionResponse {}

export interface CreateTagActionRequest extends BaseActionRequest {
  maxSelections?: number;
  options: ActionOptionInput[];
}

export interface CreateTagActionResponse extends BaseActionResponse {}

export type CreateSubjectiveActionRequest = BaseActionRequest;
export type CreateSubjectiveActionResponse = BaseActionResponse;

export type CreateShortTextActionRequest = BaseActionRequest;
export type CreateShortTextActionResponse = BaseActionResponse;

export type CreateRatingActionRequest = BaseActionRequest;
export type CreateRatingActionResponse = BaseActionResponse;

export interface CreateImageActionRequest extends BaseActionRequest {
  maxSelections?: number;
}
export type CreateImageActionResponse = BaseActionResponse;

export type CreatePdfActionRequest = BaseActionRequest;
export type CreatePdfActionResponse = BaseActionResponse;

export type CreateVideoActionRequest = BaseActionRequest;
export type CreateVideoActionResponse = BaseActionResponse;

export type CreatePrivacyConsentActionRequest = BaseActionRequest;
export type CreatePrivacyConsentActionResponse = BaseActionResponse;

export interface CreateDateActionRequest extends BaseActionRequest {
  maxSelections: number;
}
export type CreateDateActionResponse = BaseActionResponse;

export interface CreateTimeActionRequest extends BaseActionRequest {
  maxSelections: number;
}
export type CreateTimeActionResponse = BaseActionResponse;

export interface UpdateActionOptionRequest {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  order: number;
  imageFileUploadId?: string | null;
}

export interface UpdateActionRequest {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  order?: number;
  maxSelections?: number;
  isRequired?: boolean;
  options?: UpdateActionOptionRequest[];
}

export interface GetActionResponse {
  data: Pick<
    Action,
    | "id"
    | "title"
    | "description"
    | "imageUrl"
    | "type"
    | "order"
    | "maxSelections"
    | "isRequired"
    | "createdAt"
    | "updatedAt"
    | "missionId"
  >[];
}

export interface GetActionIdsResponse {
  data: {
    actionIds: string[];
  };
}

export interface GetActionByIdResponse {
  data: Pick<
    Action,
    | "id"
    | "title"
    | "description"
    | "imageUrl"
    | "type"
    | "order"
    | "maxSelections"
    | "isRequired"
    | "missionId"
    | "createdAt"
    | "updatedAt"
  > & {
    options: Pick<ActionOption, "id" | "title" | "description" | "imageUrl" | "order">[];
  };
}

export interface ActionDetail {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  type: ActionType;
  order: number;
  maxSelections: number | null;
  isRequired: boolean;
  missionId: string | null;
  options: Pick<ActionOption, "id" | "title" | "description" | "imageUrl" | "order">[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GetMissionActionsDetailResponse {
  data: ActionDetail[];
}
