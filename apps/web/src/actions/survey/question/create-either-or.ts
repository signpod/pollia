"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import { eitherOrInfoSchema } from "@/schemas/survey/eitherOrInfoSchema";
import type {
  CreateEitherOrQuestionRequest,
  CreateEitherOrQuestionResponse,
} from "@/types/dto/survey";
import { SurveyQuestionType } from "@prisma/client";

function validateEitherOrQuestion(request: CreateEitherOrQuestionRequest): string | null {
  try {
    const formData = {
      title: request.title,
      description: request.description || "",
      imageUrl: request.imageUrl || "",
    };

    const result = eitherOrInfoSchema.safeParse(formData);
    if (!result.success) {
      return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
    }

    return null;
  } catch {
    return "유효성 검사 중 오류가 발생했습니다.";
  }
}

export async function createEitherOrQuestion(
  request: CreateEitherOrQuestionRequest,
): Promise<CreateEitherOrQuestionResponse> {
  try {
    const user = await requireAuth();

    const validationError = validateEitherOrQuestion(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    if (request.surveyId) {
      const survey = await prisma.survey.findUnique({
        where: { id: request.surveyId },
        select: { id: true, creatorId: true },
      });

      if (!survey) {
        const error = new Error("존재하지 않는 설문조사입니다.");
        error.cause = 404;
        throw error;
      }

      if (survey.creatorId !== user.id) {
        const error = new Error("질문을 추가할 권한이 없습니다.");
        error.cause = 403;
        throw error;
      }
    }

    const question = await prisma.$transaction(async tx => {
      const createdQuestion = await tx.surveyQuestion.create({
        data: {
          surveyId: request.surveyId ?? undefined,
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          type: SurveyQuestionType.EITHER_OR,
          order: request.order,
          maxSelections: 1,
        },
      });

      await tx.surveyOption.createMany({
        data: [
          {
            questionId: createdQuestion.id,
            description: "예",
            order: 0,
          },
          {
            questionId: createdQuestion.id,
            description: "아니오",
            order: 1,
          },
        ],
      });

      return createdQuestion;
    });

    return {
      data: {
        id: question.id,
        surveyId: question.surveyId || "",
        title: question.title,
        type: question.type,
        order: question.order,
        createdAt: question.createdAt,
      },
    };
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
