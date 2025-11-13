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
  data: Pick<Survey, "id" | "title" | "description" | "imageUrl" | "createdAt" | "updatedAt">[];
}

// ============================================================================
// Survey Answer Submission (임시)
// ============================================================================
// TODO: 아직 답변 제출 관련 스펙이 확정되지 않았습니다.
// 현재는 임시로 작성된 타입이며, 추후 요구사항에 따라 변경될 예정입니다.
// 현재는 클라이언트 상태 관리 및 로깅 용도로만 사용 중입니다.
// ============================================================================

export type SurveyAnswerItem =
  | {
      questionId: string;
      type: "SCALE";
      scaleValue: number;
    }
  | {
      questionId: string;
      type: "SUBJECTIVE";
      textResponse: string;
    }
  | {
      questionId: string;
      type: "MULTIPLE_CHOICE";
      selectedOptionIds: string[];
    };

export interface SubmitSurveyAnswersRequest {
  surveyId: string;
  answers: SurveyAnswerItem[];
}

export interface SubmitSurveyAnswersResponse {
  data: {
    surveyId: string;
    answersCount: number;
    submittedAt: Date;
  };
}
