"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionService } from "@/server/services/survey-question/surveyQuestionService";
import type {
  CreateEitherOrQuestionRequest,
  CreateEitherOrQuestionResponse,
  CreateMultipleChoiceQuestionRequest,
  CreateMultipleChoiceQuestionResponse,
  CreateScaleQuestionRequest,
  CreateScaleQuestionResponse,
  CreateSubjectiveQuestionRequest,
  CreateSubjectiveQuestionResponse,
} from "@/types/dto";

/**
 * Multiple Choice Question 생성 Server Action
 * @param request - Question 생성 요청 데이터
 * @returns 생성된 Question 정보
 */
export async function createMultipleChoiceQuestion(
  request: CreateMultipleChoiceQuestionRequest,
): Promise<CreateMultipleChoiceQuestionResponse> {
  try {
    const user = await requireAuth();

    const question = await surveyQuestionService.createMultipleChoiceQuestion(request, user.id);

    return { data: question };
  } catch (error) {
    console.error("❌ 객관식 질문 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Scale Question 생성 Server Action
 * @param request - Question 생성 요청 데이터
 * @returns 생성된 Question 정보
 */
export async function createScaleQuestion(
  request: CreateScaleQuestionRequest,
): Promise<CreateScaleQuestionResponse> {
  try {
    const user = await requireAuth();

    const question = await surveyQuestionService.createScaleQuestion(request, user.id);

    return { data: question };
  } catch (error) {
    console.error("❌ 척도형 질문 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Subjective Question 생성 Server Action
 * @param request - Question 생성 요청 데이터
 * @returns 생성된 Question 정보
 */
export async function createSubjectiveQuestion(
  request: CreateSubjectiveQuestionRequest,
): Promise<CreateSubjectiveQuestionResponse> {
  try {
    const user = await requireAuth();

    const question = await surveyQuestionService.createSubjectiveQuestion(request, user.id);

    return { data: question };
  } catch (error) {
    console.error("❌ 주관식 질문 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Either Or Question 생성 Server Action
 * @param request - Question 생성 요청 데이터
 * @returns 생성된 Question 정보
 */
export async function createEitherOrQuestion(
  request: CreateEitherOrQuestionRequest,
): Promise<CreateEitherOrQuestionResponse> {
  try {
    const user = await requireAuth();

    const question = await surveyQuestionService.createEitherOrQuestion(request, user.id);

    return { data: question };
  } catch (error) {
    console.error("❌ 양자택일 질문 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
