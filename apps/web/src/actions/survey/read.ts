"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/survey/surveyService";
import type { SortOrderType } from "@/types/common/sort";
import type {
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyResponse,
  GetUserSurveysResponse,
} from "@/types/dto";

/**
 * 사용자의 Survey 목록 조회 Server Action
 * @param options - 조회 옵션
 * @returns Survey 목록
 */
export async function getUserSurveys(options?: {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}): Promise<GetUserSurveysResponse & { nextCursor?: string }> {
  try {
    const user = await requireAuth();
    const limit = options?.limit ?? 10;

    const surveys = await surveyService.getUserSurveys(user.id, {
      ...options,
      limit: limit + 1,
    });

    let nextCursor: string | undefined = undefined;
    if (surveys.length > limit) {
      const nextItem = surveys.pop();
      nextCursor = nextItem?.id;
    }

    return { data: surveys, nextCursor };
  } catch (error) {
    console.error("❌ 사용자 설문조사 목록 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Survey ID로 Survey 정보 조회 Server Action
 * @param surveyId - Survey ID
 * @returns Survey 정보
 */
export async function getSurvey(surveyId: string): Promise<GetSurveyResponse> {
  try {
    const survey = await surveyService.getSurvey(surveyId);
    return { data: survey };
  } catch (error) {
    console.error("❌ 설문조사 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Survey ID로 Question ID 배열 조회 Server Action
 * @param surveyId - Survey ID
 * @returns Question ID 배열
 */
export async function getSurveyQuestionIds(
  surveyId: string,
): Promise<GetSurveyQuestionIdsResponse> {
  try {
    const data = await surveyService.getSurveyQuestionIds(surveyId);
    return { data };
  } catch (error) {
    console.error("❌ 설문 질문 ID 목록 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문 질문 ID 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Question ID로 Question 상세 정보 조회 Server Action
 * @param questionId - Question ID
 * @returns Question 상세 정보
 */
export async function getQuestionById(questionId: string): Promise<GetQuestionByIdResponse> {
  try {
    const question = await surveyService.getQuestionById(questionId);
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
 * Survey ID로 모든 Question 상세 정보 조회 Server Action
 * @param surveyId - Survey ID
 * @returns Question 상세 정보 배열
 */
export async function getSurveyQuestionsDetail(
  surveyId: string,
): Promise<GetSurveyQuestionsDetailResponse> {
  try {
    const questions = await surveyService.getSurveyQuestionsDetail(surveyId);
    return { data: questions };
  } catch (error) {
    console.error("❌ 설문 질문 상세 목록 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문 질문 상세 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
