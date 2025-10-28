import type { SurveyQuestionType } from "@prisma/client";

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
