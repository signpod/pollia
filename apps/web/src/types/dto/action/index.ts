import type { ActionType } from "@/types/domain/action";
import type { Action, ActionOption } from "@prisma/client";

// ============================================================================
// Action Creation DTOs
// ============================================================================

// Multiple Choice Question
export interface CreateMultipleChoiceActionRequest {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  maxSelections: number;
  order: number;
  isRequired?: boolean;
  options: {
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
    imageFileUploadId?: string;
  }[];
}

export interface CreateMultipleChoiceActionResponse {
  data: {
    id: string;
    missionId: string;
    title: string;
    type: ActionType;
    order: number;
    createdAt: Date;
  };
}

// Scale Action
export interface CreateScaleActionRequest {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
  isRequired?: boolean;
  options: {
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
    imageFileUploadId?: string;
  }[];
}

export interface CreateScaleActionResponse {
  data: {
    id: string;
    missionId: string;
    title: string;
    type: ActionType;
    order: number;
    createdAt: Date;
  };
}

// Subjective Action
export interface CreateSubjectiveActionRequest {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
  isRequired?: boolean;
}

export interface CreateSubjectiveActionResponse {
  data: {
    id: string;
    missionId: string;
    title: string;
    type: ActionType;
    order: number;
    createdAt: Date;
  };
}

// Tag Action
export interface CreateTagActionRequest {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
  maxSelections?: number;
  isRequired?: boolean;
  options: {
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
    imageFileUploadId?: string;
  }[];
}

export interface CreateTagActionResponse {
  data: {
    id: string;
    missionId: string;
    title: string;
    type: ActionType;
    order: number;
    createdAt: Date;
  };
}

// Rating Action
export interface CreateRatingActionRequest {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
  isRequired?: boolean;
}

export interface CreateRatingActionResponse {
  data: {
    id: string;
    missionId: string;
    title: string;
    type: ActionType;
    order: number;
    createdAt: Date;
  };
}

// Image Action
export interface CreateImageActionRequest {
  missionId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
  isRequired?: boolean;
}

export interface CreateImageActionResponse {
  data: {
    id: string;
    missionId: string;
    title: string;
    type: ActionType;
    order: number;
    createdAt: Date;
  };
}

// ============================================================================
// Action Update DTOs
// ============================================================================

export interface UpdateActionOptionRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
  imageFileUploadId?: string;
}

export interface UpdateActionRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order?: number;
  maxSelections?: number;
  isRequired?: boolean;
  options?: UpdateActionOptionRequest[];
}

// ============================================================================
// Action Read DTOs
// ============================================================================

// Action 목록 조회 응답 (options 제외)
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

// Mission의 Action ID 배열 조회 응답 타입
export interface GetActionIdsResponse {
  data: {
    actionIds: string[];
  };
}

// Action 상세 조회 응답 타입 (options 포함)
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

// Action 상세 타입 (surveyId는 missionId의 별칭)
export interface ActionDetail {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  type: ActionType;
  order: number;
  maxSelections: number | null;
  isRequired: boolean;
  surveyId: string | null;
  options: Pick<ActionOption, "id" | "title" | "description" | "imageUrl" | "order">[];
  createdAt: Date;
  updatedAt: Date;
}

// Mission의 모든 Action 상세 조회 응답 타입
export interface GetMissionActionsDetailResponse {
  data: ActionDetail[];
}
