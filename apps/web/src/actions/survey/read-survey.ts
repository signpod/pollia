"use server";

import prisma from "@/database/utils/prisma/client";
import { surveyService } from "@/server/services/survey/surveyService";
import { SortOrderType } from "@/types/common/sort";
import type {
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyResponse,
  GetUserSurveysResponse,
} from "@/types/dto";
import { requireAuth } from "../common/auth";

interface GetUserSurveysOptions {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

/**
 * 1. 사용자의 설문조사 목록 조회
 * @param options - 조회 옵션
 * @returns 설문조사 목록
 */
export async function getUserSurveys(
  options?: GetUserSurveysOptions,
): Promise<GetUserSurveysResponse & { nextCursor?: string }> {
  const user = await requireAuth();
  const limit = options?.limit ?? 10;

  const surveys = await prisma.survey.findMany({
    where: { creatorId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      target: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: options?.sortOrder === "latest" ? "desc" : "asc",
    },
    take: limit + 1,
    ...(options?.cursor && {
      cursor: {
        id: options.cursor,
      },
      skip: 1,
    }),
  });

  let nextCursor: string | undefined = undefined;
  if (surveys.length > limit) {
    const nextItem = surveys.pop();
    nextCursor = nextItem?.id;
  }

  return { data: surveys, nextCursor };
}

/**
 * 1. Survey ID로 Survey 정보 조회
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
 * 2. Survey ID로 Question ID 배열 조회
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
 * 3. Question ID로 Question 상세 정보 조회
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
 * 4. Survey ID로 모든 Question 상세 정보 조회
 * Repository의 최적화된 쿼리를 사용하여 단일 쿼리로 조회
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
