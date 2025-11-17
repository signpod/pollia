import type { SurveyQuestionType } from "@prisma/client";

// ============================================================================
// Question Creation DTOs
// ============================================================================

// Multiple Choice Question
export interface CreateMultipleChoiceQuestionRequest {
  surveyId?: string;
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

export interface CreateMultipleChoiceQuestionResponse {
  data: {
    id: string;
    surveyId: string;
    title: string;
    type: SurveyQuestionType;
    order: number;
    createdAt: Date;
  };
}

// Scale Question
export interface CreateScaleQuestionRequest {
  surveyId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface CreateScaleQuestionResponse {
  data: {
    id: string;
    surveyId: string;
    title: string;
    type: SurveyQuestionType;
    order: number;
    createdAt: Date;
  };
}

// Subjective Question
export interface CreateSubjectiveQuestionRequest {
  surveyId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface CreateSubjectiveQuestionResponse {
  data: {
    id: string;
    surveyId: string;
    title: string;
    type: SurveyQuestionType;
    order: number;
    createdAt: Date;
  };
}

// Either Or Question
export interface CreateEitherOrQuestionRequest {
  surveyId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface CreateEitherOrQuestionResponse {
  data: {
    id: string;
    surveyId: string;
    title: string;
    type: SurveyQuestionType;
    order: number;
    createdAt: Date;
  };
}

// ============================================================================
// Question Read DTOs
// ============================================================================

export interface GetSurveyQuestionsResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    type: SurveyQuestionType;
    order: number;
    maxSelections: number | null;
    createdAt: Date;
    updatedAt: Date;
    surveyId: string | null;
  }[];
}

// Survey의 Question ID 배열 조회 응답 타입
export interface GetSurveyQuestionIdsResponse {
  data: {
    questionIds: string[];
  };
}

// Question 상세 조회 응답 타입
export interface GetQuestionByIdResponse {
  data: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    type: SurveyQuestionType;
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
  };
}

// Survey의 모든 Question 상세 조회 응답 타입
export interface GetSurveyQuestionsDetailResponse {
  data: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    type: SurveyQuestionType;
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
  }[];
}
