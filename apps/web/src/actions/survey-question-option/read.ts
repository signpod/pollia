"use server";

import { surveyQuestionOptionService } from "@/server/services/survey-question-option/surveyQuestionOptionService";
import type { SurveyQuestionOption } from "@prisma/client";

/**
 * Option ID로 Option 조회 Server Action
 * @param optionId - Option ID
 * @returns Option 정보
 */
export async function getOptionById(optionId: string): Promise<{ data: SurveyQuestionOption }> {
  try {
    const option = await surveyQuestionOptionService.getOptionById(optionId);
    return { data: option };
  } catch (error) {
    console.error("❌ 옵션 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Question ID로 Option 목록 조회 Server Action
 * @param questionId - Question ID
 * @returns Option 목록
 */
export async function getOptionsByQuestionId(
  questionId: string,
): Promise<{ data: SurveyQuestionOption[] }> {
  try {
    const options = await surveyQuestionOptionService.getOptionsByQuestionId(questionId);
    return { data: options };
  } catch (error) {
    console.error("❌ 질문 옵션 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

