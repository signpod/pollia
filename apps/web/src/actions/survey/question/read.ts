'use server';

import prisma from '@/database/utils/prisma/client';
import type { GetSurveyQuestionsResponse } from '@/types/dto';
import { SurveyQuestionType } from '@prisma/client';

export async function getSurveyQuestions(options?: {
  searchQuery?: string;
  selectedQuestionTypes?: SurveyQuestionType[];
}): Promise<GetSurveyQuestionsResponse> {
  try {
    const questions = await prisma.surveyQuestion.findMany({
      where: {
        ...(options?.searchQuery && {
          title: {
            contains: options.searchQuery,
            mode: 'insensitive',
          },
        }),
        ...(options?.selectedQuestionTypes && {
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
        createdAt: 'desc',
      },
    });

    return {
      data: questions,
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error('설문 질문 목록을 불러올 수 없습니다.');
    serverError.cause = 500;
    throw serverError;
  }
}
