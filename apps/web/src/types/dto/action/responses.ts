import type { Action, ActionOption } from "@prisma/client";

export type ActionDetail = Action & {
  options: ActionOption[];
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
  data: ActionDetail;
}

export interface GetMissionActionsDetailResponse {
  data: ActionDetail[];
}

export interface BaseActionResponse {
  data: Pick<
    Action,
    | "id"
    | "missionId"
    | "title"
    | "type"
    | "order"
    | "isRequired"
    | "createdAt"
    | "nextActionId"
    | "nextCompletionId"
  >;
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
export type CreateBranchActionResponse = BaseActionResponse;
export type CreateOXActionResponse = BaseActionResponse;
