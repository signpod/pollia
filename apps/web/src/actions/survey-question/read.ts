"use server";

import { surveyQuestionService } from "@/server/services/survey-question/surveyQuestionService";
import type {
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyQuestionsResponse,
} from "@/types/dto";
import type { SurveyQuestionType } from "@prisma/client";

/**
 * Question ID로 Question 상세 조회 Server Action
 * @param questionId - Question ID
 * @returns Question 상세 정보
 */
export async function getQuestionById(questionId: string): Promise<GetQuestionByIdResponse> {
  try {
    const question = await surveyQuestionService.getQuestionById(questionId);
    return { data: question };
  } catch (error) {
    console.error("❌ 질문 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Survey ID로 Question ID 목록 조회 Server Action
 * @param surveyId - Survey ID
 * @returns Question ID 배열
 */
export async function getSurveyQuestionIds(
  surveyId: string,
): Promise<GetSurveyQuestionIdsResponse> {
  try {
    const data = await surveyQuestionService.getSurveyQuestionIds(surveyId);
    return { data };
  } catch (error) {
    console.error("❌ 설문 질문 ID 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Survey ID로 Question 상세 목록 조회 Server Action
 * @param surveyId - Survey ID
 * @returns Question 상세 목록
 */
export async function getSurveyQuestionsDetail(
  surveyId: string,
): Promise<GetSurveyQuestionsDetailResponse> {
  try {
    const questions = await surveyQuestionService.getSurveyQuestionsDetail(surveyId);
    return { data: questions };
  } catch (error) {
    console.error("❌ 설문 질문 상세 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 상세 정보를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Question 목록 조회 Server Action (필터링 및 페이지네이션)
 * @param options - 조회 옵션
 * @returns Question 목록 및 다음 커서
 */
export async function getSurveyQuestions(options?: {
  searchQuery?: string;
  selectedQuestionTypes?: SurveyQuestionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}): Promise<GetSurveyQuestionsResponse & { nextCursor?: string }> {
  try {
    const limit = options?.limit ?? 10;

    const questions = await surveyQuestionService.getQuestions({
      ...options,
      limit: limit + 1,
    });

    let nextCursor: string | undefined = undefined;
    if (questions.length > limit) {
      const nextItem = questions.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: questions,
      nextCursor,
    };
  } catch (error) {
    console.error("❌ 설문 질문 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문 질문 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
