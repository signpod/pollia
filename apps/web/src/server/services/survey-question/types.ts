import type { SurveyQuestionType } from "@prisma/client";

export interface CreateMultipleChoiceInput {
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

export interface CreateScaleInput {
  surveyId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface CreateSubjectiveInput {
  surveyId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface CreateEitherOrInput {
  surveyId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface UpdateQuestionInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  maxSelections?: number;
}

export interface GetQuestionsOptions {
  searchQuery?: string;
  selectedQuestionTypes?: SurveyQuestionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}

export interface QuestionCreatedResult {
  id: string;
  surveyId: string;
  title: string;
  type: SurveyQuestionType;
  order: number;
  createdAt: Date;
}
