"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import { subjectiveInfoSchema } from "@/schemas/survey/question/creation/subjectiveInfoSchema";
import type {
  CreateSubjectiveQuestionRequest,
  CreateSubjectiveQuestionResponse,
} from "@/types/dto/survey";
import { SurveyQuestionType } from "@prisma/client";

function validateSubjectiveQuestion(request: CreateSubjectiveQuestionRequest): string | null {
  try {
    const formData = {
      title: request.title,
      description: request.description || "",
      imageUrl: request.imageUrl || "",
    };

    const result = subjectiveInfoSchema.safeParse(formData);
    if (!result.success) {
      return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
    }

    return null;
  } catch {
    return "유효성 검사 중 오류가 발생했습니다.";
  }
}

export async function createSubjectiveQuestion(
  request: CreateSubjectiveQuestionRequest,
): Promise<CreateSubjectiveQuestionResponse> {
  try {
    const user = await requireAuth();

    const validationError = validateSubjectiveQuestion(request);
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

    const question = await prisma.surveyQuestion.create({
      data: {
        surveyId: request.surveyId ?? undefined,
        title: request.title,
        description: request.description,
        imageUrl: request.imageUrl,
        type: SurveyQuestionType.SUBJECTIVE,
        order: request.order,
      },
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
    console.error("❌ 주관식 질문 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
