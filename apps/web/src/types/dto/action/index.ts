import type {
  DateInput,
  ImageInput,
  MultipleChoiceInput,
  PdfInput,
  RatingInput,
  ScaleInput,
  ShortTextInput,
  SubjectiveInput,
  TagInput,
  TimeInput,
  VideoInput,
} from "@/schemas/action";
import type { ActionUpdate } from "@/schemas/action";
import type { OptionItem } from "@/schemas/action-option";
import type { Action, ActionOption } from "@prisma/client";

// Response Types - Prisma 기반

export type ActionDetail = Action & {
  options: Pick<
    ActionOption,
    "id" | "title" | "description" | "imageUrl" | "fileUploadId" | "order"
  >[];
};

export interface GetActionResponse {
  data: Action[];
}

export interface GetActionIdsResponse {
  data: {
    actionIds: string[];
  };
}

export interface GetActionByIdResponse {
  data: Action & {
    options: Pick<
      ActionOption,
      "id" | "title" | "description" | "imageUrl" | "fileUploadId" | "order"
    >[];
  };
}

export interface GetMissionActionsDetailResponse {
  data: ActionDetail[];
}

export interface BaseActionResponse {
  data: {
    id: string;
    missionId: string | null;
    title: string;
    type: Action["type"];
    order: number;
    isRequired: boolean;
    createdAt: Date;
  };
}

export interface CreateMultipleChoiceActionResponse extends BaseActionResponse {}
export interface CreateScaleActionResponse extends BaseActionResponse {}
export interface CreateTagActionResponse extends BaseActionResponse {}
export type CreateSubjectiveActionResponse = BaseActionResponse;
export type CreateShortTextActionResponse = BaseActionResponse;
export type CreateRatingActionResponse = BaseActionResponse;
export type CreateImageActionResponse = BaseActionResponse;
export type CreatePdfActionResponse = BaseActionResponse;
export type CreateVideoActionResponse = BaseActionResponse;
export type CreateDateActionResponse = BaseActionResponse;
export type CreateTimeActionResponse = BaseActionResponse;

// Request Types - Schema 기반

export type CreateMultipleChoiceActionRequest = MultipleChoiceInput;
export type CreateScaleActionRequest = ScaleInput;
export type CreateTagActionRequest = TagInput;
export type CreateSubjectiveActionRequest = SubjectiveInput;
export type CreateShortTextActionRequest = ShortTextInput;
export type CreateRatingActionRequest = RatingInput;
export type CreateImageActionRequest = ImageInput;
export type CreatePdfActionRequest = PdfInput;
export type CreateVideoActionRequest = VideoInput;
export type CreateDateActionRequest = DateInput;
export type CreateTimeActionRequest = TimeInput;

export type UpdateActionRequest = ActionUpdate;
export type UpdateActionOptionRequest = OptionItem;

// 하위 호환성을 위한 타입 alias
export type BaseActionRequest = SubjectiveInput;
export type ActionOptionInput = OptionItem;
