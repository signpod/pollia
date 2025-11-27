import type { SurveyQuestionType } from "@prisma/client";

export interface CreateQuestionAnswerRequest {
  responseId: string;
  questionId: string;
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
}

export interface SubmitQuestionAnswersRequest {
  responseId: string;
  answers: Array<{
    questionId: string;
    type: SurveyQuestionType;
    selectedOptionIds?: string[];
    scaleValue?: number;
    textResponse?: string;
  }>;
}

export interface UpdateQuestionAnswerRequest {
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
}

export interface CreateQuestionAnswerResponse {
  data: {
    id: string;
    responseId: string;
    questionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  };
}

export interface SubmitQuestionAnswersResponse {
  data: {
    responseId: string;
    answersCount: number;
    submittedAt: Date;
  };
}

export interface GetQuestionAnswerResponse {
  data: {
    id: string;
    responseId: string;
    questionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  };
}

export interface GetAnswersByResponseResponse {
  data: Array<{
    id: string;
    responseId: string;
    questionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  }>;
}

export interface GetAnswersByUserResponse {
  data: Array<{
    id: string;
    responseId: string;
    questionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  }>;
}
