"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import { multipleChoiceInfoSchema } from "@/schemas/survey/question/multipleChoiceInfoSchema";
import type {
  CreateMultipleChoiceQuestionRequest,
  CreateMultipleChoiceQuestionResponse,
} from "@/types/dto/survey";
import { FileStatus, SurveyQuestionType } from "@prisma/client";

function validateMultipleChoiceQuestion(
  request: CreateMultipleChoiceQuestionRequest,
): string | null {
  try {
    const formData = {
      title: request.title,
      description: request.description || "",
      imageUrl: request.imageUrl || "",
      maxSelections: request.maxSelections,
      options: request.options.map(opt => ({
        id: `temp-${opt.order}`,
        description: opt.description,
        imageUrl: opt.imageUrl,
        order: opt.order,
        fileUploadId: opt.imageFileUploadId,
      })),
    };

    const result = multipleChoiceInfoSchema.safeParse(formData);
    if (!result.success) {
      return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
    }

    return null;
  } catch {
    return "유효성 검사 중 오류가 발생했습니다.";
  }
}

export async function createMultipleChoiceQuestion(
  request: CreateMultipleChoiceQuestionRequest,
): Promise<CreateMultipleChoiceQuestionResponse> {
  try {
    const user = await requireAuth();

    const validationError = validateMultipleChoiceQuestion(request);
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
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: request.order,
          maxSelections: request.maxSelections,
        },
      });

      await tx.surveyOption.createMany({
        data: request.options.map(option => ({
          questionId: createdQuestion.id,
          description: option.description,
          imageUrl: option.imageUrl,
          order: option.order,
          fileUploadId: option.imageFileUploadId,
        })),
      });

      const optionFileUploadIds = request.options
        .map(option => option.imageFileUploadId)
        .filter(Boolean) as string[];

      if (optionFileUploadIds.length > 0) {
        await tx.fileUpload.updateMany({
          where: {
            id: { in: optionFileUploadIds },
            userId: user.id,
            status: FileStatus.TEMPORARY,
          },
          data: {
            status: FileStatus.CONFIRMED,
            confirmedAt: new Date(),
          },
        });
      }

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
    console.error("❌ 객관식 질문 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
