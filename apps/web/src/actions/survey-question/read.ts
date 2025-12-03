"use server";

import { surveyQuestionService } from "@/server/services/action";
import type { GetQuestionsOptions } from "@/server/services/action/types";
import type {
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyQuestionsResponse,
} from "@/types/dto";
import type { SurveyQuestionType } from "@prisma/client";

export interface GetSurveyQuestionsRequest {
  searchQuery?: string;
  selectedQuestionTypes?: SurveyQuestionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}

function toGetQuestionsOptions(dto: GetSurveyQuestionsRequest): GetQuestionsOptions {
  return {
    searchQuery: dto.searchQuery,
    selectedQuestionTypes: dto.selectedQuestionTypes,
    isDraft: dto.isDraft,
    cursor: dto.cursor,
    limit: dto.limit,
  };
}

export async function getQuestionById(questionId: string): Promise<GetQuestionByIdResponse> {
  try {
    const question = await surveyQuestionService.getQuestionById(questionId);
    return { data: question };
  } catch (error) {
    console.error("getQuestionById error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurveyQuestionIds(
  surveyId: string,
): Promise<GetSurveyQuestionIdsResponse> {
  try {
    const data = await surveyQuestionService.getSurveyQuestionIds(surveyId);
    return { data };
  } catch (error) {
    console.error("getSurveyQuestionIds error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurveyQuestionsDetail(
  surveyId: string,
): Promise<GetSurveyQuestionsDetailResponse> {
  try {
    const questions = await surveyQuestionService.getSurveyQuestionsDetail(surveyId);
    return { data: questions };
  } catch (error) {
    console.error("getSurveyQuestionsDetail error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 상세 정보를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurveyQuestions(
  request?: GetSurveyQuestionsRequest,
): Promise<GetSurveyQuestionsResponse & { nextCursor?: string }> {
  try {
    const limit = request?.limit ?? 10;
    const options = request
      ? toGetQuestionsOptions({ ...request, limit: limit + 1 })
      : { limit: limit + 1 };

    const questions = await surveyQuestionService.getQuestions(options);

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
    console.error("getSurveyQuestions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문 질문 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
