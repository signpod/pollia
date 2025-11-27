import prisma from "@/database/utils/prisma/client";
import type { FileStatus, SurveyQuestionType } from "@prisma/client";

export class SurveyQuestionRepository {
  async findByIdWithOptions(questionId: string) {
    return prisma.surveyQuestion.findUnique({
      where: { id: questionId },
      include: {
        options: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async findById(questionId: string) {
    return prisma.surveyQuestion.findUnique({
      where: { id: questionId },
    });
  }

  async findQuestionIdsBySurveyId(surveyId: string) {
    const questions = await prisma.surveyQuestion.findMany({
      where: { surveyId },
      select: { id: true },
      orderBy: { order: "asc" },
    });
    return questions.map(q => q.id);
  }

  async findDetailsBySurveyId(surveyId: string) {
    return prisma.surveyQuestion.findMany({
      where: { surveyId },
      include: {
        options: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async findMany(options?: {
    searchQuery?: string;
    selectedQuestionTypes?: SurveyQuestionType[];
    isDraft?: boolean;
    cursor?: string;
    limit?: number;
  }) {
    const limit = options?.limit ?? 10;

    return prisma.surveyQuestion.findMany({
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
  }

  async createMultipleChoice(
    data: {
      surveyId?: string;
      title: string;
      description?: string;
      imageUrl?: string;
      type: SurveyQuestionType;
      order: number;
      maxSelections?: number;
    },
    options: Array<{
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      imageFileUploadId?: string;
    }>,
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      const createdQuestion = await tx.surveyQuestion.create({
        data: {
          surveyId: data.surveyId ?? undefined,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          type: data.type,
          order: data.order,
          maxSelections: data.maxSelections,
        },
      });

      await tx.surveyQuestionOption.createMany({
        data: options.map(option => ({
          questionId: createdQuestion.id,
          title: option.title,
          description: option.description || null,
          imageUrl: option.imageUrl,
          order: option.order,
          fileUploadId: option.imageFileUploadId,
        })),
      });

      const optionFileUploadIds = options
        .map(option => option.imageFileUploadId)
        .filter(Boolean) as string[];

      if (optionFileUploadIds.length > 0) {
        await tx.fileUpload.updateMany({
          where: {
            id: { in: optionFileUploadIds },
            userId: userId,
            status: "TEMPORARY" as FileStatus,
          },
          data: {
            status: "CONFIRMED" as FileStatus,
            confirmedAt: new Date(),
          },
        });
      }

      return createdQuestion;
    });
  }

  async create(data: {
    surveyId?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    type: SurveyQuestionType;
    order: number;
  }) {
    return prisma.surveyQuestion.create({
      data: {
        surveyId: data.surveyId ?? undefined,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        type: data.type,
        order: data.order,
      },
    });
  }

  async update(
    questionId: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
      maxSelections?: number;
    },
  ) {
    return prisma.surveyQuestion.update({
      where: { id: questionId },
      data,
    });
  }

  async delete(questionId: string) {
    return prisma.surveyQuestion.delete({
      where: { id: questionId },
    });
  }
}

export const surveyQuestionRepository = new SurveyQuestionRepository();
