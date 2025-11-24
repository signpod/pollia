"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionOptionService } from "@/server/services/survey-question-option/surveyQuestionOptionService";
import type { SurveyQuestionOption } from "@prisma/client";

/**
 * Option 생성 Server Action
 * @param data - 생성할 Option 데이터
 * @returns 생성된 Option 정보
 */
export async function createOption(data: {
  questionId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
  fileUploadId?: string;
}): Promise<{ data: SurveyQuestionOption }> {
  try {
    const user = await requireAuth();

    const option = await surveyQuestionOptionService.createOption(data, user.id);

    return { data: option };
  } catch (error) {
    console.error("❌ 옵션 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * 여러 Option 생성 Server Action
 * @param questionId - Question ID
 * @param options - 생성할 Option 데이터 목록
 * @returns 생성된 Option 목록
 */
export async function createOptions(
  questionId: string,
  options: Array<{
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
    fileUploadId?: string;
  }>,
): Promise<{ data: SurveyQuestionOption[] }> {
  try {
    const user = await requireAuth();

    const createdOptions = await surveyQuestionOptionService.createOptions(
      questionId,
      options,
      user.id,
    );

    return { data: createdOptions };
  } catch (error) {
    console.error("❌ 옵션 목록 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 목록 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

