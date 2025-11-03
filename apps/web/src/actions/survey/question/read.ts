"use server";

import prisma from "@/database/utils/prisma/client";
import type { GetSurveyQuestionsResponse } from "@/types/dto";
import { SurveyQuestionType } from "@prisma/client";

interface GetSurveyQuestionsOptions {
  searchQuery?: string;
  selectedQuestionTypes?: SurveyQuestionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}

export async function getSurveyQuestions(
  options?: GetSurveyQuestionsOptions,
): Promise<GetSurveyQuestionsResponse & { nextCursor?: string }> {
  try {
    const limit = options?.limit ?? 10;

    const questions = await prisma.surveyQuestion.findMany({
      where: {
        ...(options?.isDraft && {
          surveyId: null,
        }),
        ...(options?.searchQuery && {
          title: {
            contains: options.searchQuery,
            mode: "insensitive",
          },
        }),
        ...(options?.selectedQuestionTypes &&
          options.selectedQuestionTypes.length > 0 && {
            type: {
              in: options.selectedQuestionTypes,
            },
          }),
      },
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        imageUrl: true,
        maxSelections: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        surveyId: true,
      },
      orderBy: {
        createdAt: "desc",
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
