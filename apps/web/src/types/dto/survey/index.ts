import type { Survey } from "@prisma/client";

// ============================================================================
// Survey Creation DTOs
// ============================================================================

export interface CreateSurveyRequest {
  title: string;
  description?: string | null;
  target?: string | null;
  imageUrl?: string | null;
  questionIds: string[];
}

export interface CreateSurveyResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    target?: string | null;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
  };
}

// ============================================================================
// Survey Read DTOs
// ============================================================================

export interface GetUserSurveysResponse {
  data: Pick<
    Survey,
    "id" | "title" | "description" | "target" | "imageUrl" | "createdAt" | "updatedAt"
  >[];
}

// Survey 조회 응답 타입
export interface GetSurveyResponse {
  data: {
    id: string;
    title: string;
    description: string | null;
    target: string | null;
    imageUrl: string | null;
    brandLogoUrl: string | null;
    estimatedMinutes: number | null;
    deadline: Date | null;
    isActive: boolean;
    creatorId: string;
    rewardId: string | null;
    createdAt: Date;
    updatedAt: Date;
    // TODO: 대상자 DB 추가 후 수정
    // target: string | null;
  };
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
