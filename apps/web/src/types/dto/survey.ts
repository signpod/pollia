import type { Survey, SurveyQuestionType } from "@prisma/client";

// Multiple Choice Question
export interface CreateMultipleChoiceQuestionRequest {
  surveyId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  maxSelections: number;
  order: number;
  options: {
    description: string;
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

export interface CreateSurveyRequest {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  questionIds: string[];
}

export interface CreateSurveyResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
  };
}

export interface GetUserSurveysResponse {
  data: Pick<
    Survey,
    "id" | "title" | "description" | "imageUrl" | "createdAt" | "updatedAt"
  >[];
}
