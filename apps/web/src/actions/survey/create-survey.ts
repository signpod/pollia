"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import type { CreateSurveyRequest, CreateSurveyResponse } from "@/types/dto";

const SURVEY_MESSAGE = {
  TITLE_REQUIRED: "제목은 필수입니다.",
  QUESTIONS_REQUIRED: "최소 1개 이상의 질문이 필요합니다.",
  SURVEY_CREATION_FAILED: "설문지 생성 중 오류가 발생했습니다.",
};

function validateSurveyRequest(request: CreateSurveyRequest): string | null {
  if (!request.title || request.title.trim().length === 0) {
    return SURVEY_MESSAGE.TITLE_REQUIRED;
  }
  if (request.questionIds.length === 0) {
    return SURVEY_MESSAGE.QUESTIONS_REQUIRED;
  }
  return null;
}

export async function createSurvey(request: CreateSurveyRequest): Promise<CreateSurveyResponse> {
  try {
    const validationError = validateSurveyRequest(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(SURVEY_MESSAGE.SURVEY_CREATION_FAILED);
    serverError.cause = 500;
    throw serverError;
  }

  const user = await requireAuth();

  const survey = await prisma.$transaction(async tx => {
    const createdSurvey = await tx.survey.create({
      data: {
        title: request.title,
        description: request.description,
        imageUrl: request.imageUrl,
        creatorId: user.id,
      },
    });

    await tx.surveyQuestion.updateMany({
      where: {
        id: {
          in: request.questionIds,
        },
      },
      data: {
        surveyId: createdSurvey.id,
      },
    });

    return createdSurvey;
  });

  return {
    data: {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      imageUrl: survey.imageUrl,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      creatorId: user.id,
    },
  };
}
