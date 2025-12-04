import type { ActionType } from "@/types/domain/action";

// ============================================================================
// Question Creation DTOs
// ============================================================================

// Multiple Choice Question
export interface CreateMultipleChoiceActionRequest {
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
  order: number;
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
  order: number;
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

// ============================================================================
// Action Read DTOs
// ============================================================================

export interface GetActionResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    type: ActionType;
    order: number;
    maxSelections: number | null;
    createdAt: Date;
    updatedAt: Date;
    missionId: string | null;
  }[];
}

// Mission의 Action ID 배열 조회 응답 타입
export interface GetActionIdsResponse {
  data: {
    actionIds: string[];
  };
}

// Action 상세 조회 응답 타입
export interface GetActionByIdResponse {
  data: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    type: ActionType;
    order: number;
    maxSelections: number | null;
    missionId: string | null;
    options: {
      id: string;
      title: string;
      description: string | null;
      imageUrl: string | null;
      order: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
  };
}

// Action 상세 타입
export interface ActionDetail {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  type: ActionType;
  order: number;
  maxSelections: number | null;
  surveyId: string | null;
  options: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Mission의 모든 Action 상세 조회 응답 타입
export interface GetMissionActionsDetailResponse {
  data: ActionDetail[];
}
