import prisma from "@/database/utils/prisma/client";
import type { FileStatus } from "@prisma/client";

export class SurveyQuestionOptionRepository {
  async findById(optionId: string) {
    return prisma.surveyQuestionOption.findUnique({
      where: { id: optionId },
    });
  }

  async findByQuestionId(questionId: string) {
    return prisma.surveyQuestionOption.findMany({
      where: { questionId },
      orderBy: { order: "asc" },
    });
  }

  async findMany(options?: {
    questionIds?: string[];
    cursor?: string;
    limit?: number;
  }) {
    const limit = options?.limit ?? 10;

    return prisma.surveyQuestionOption.findMany({
      where: {
        ...(options?.questionIds &&
          options.questionIds.length > 0 && {
            questionId: {
              in: options.questionIds,
            },
          }),
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

  async create(
    data: {
      questionId: string;
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      fileUploadId?: string;
    },
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      const createdOption = await tx.surveyQuestionOption.create({
        data: {
          questionId: data.questionId,
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl,
          order: data.order,
          fileUploadId: data.fileUploadId,
        },
      });

      if (data.fileUploadId) {
        await tx.fileUpload.updateMany({
          where: {
            id: data.fileUploadId,
            userId: userId,
            status: "TEMPORARY" as FileStatus,
          },
          data: {
            status: "CONFIRMED" as FileStatus,
            confirmedAt: new Date(),
          },
        });
      }

      return createdOption;
    });
  }

  async createMany(
    questionId: string,
    options: Array<{
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      fileUploadId?: string;
    }>,
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      await tx.surveyQuestionOption.createMany({
        data: options.map(option => ({
          questionId,
          title: option.title,
          description: option.description || null,
          imageUrl: option.imageUrl,
          order: option.order,
          fileUploadId: option.fileUploadId,
        })),
      });

      const fileUploadIds = options.map(option => option.fileUploadId).filter(Boolean) as string[];

      if (fileUploadIds.length > 0) {
        await tx.fileUpload.updateMany({
          where: {
            id: { in: fileUploadIds },
            userId: userId,
            status: "TEMPORARY" as FileStatus,
          },
          data: {
            status: "CONFIRMED" as FileStatus,
            confirmedAt: new Date(),
          },
        });
      }

      return tx.surveyQuestionOption.findMany({
        where: { questionId },
        orderBy: { order: "asc" },
      });
    });
  }

  async update(
    optionId: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
    },
  ) {
    return prisma.surveyQuestionOption.update({
      where: { id: optionId },
      data,
    });
  }

  async delete(optionId: string) {
    return prisma.surveyQuestionOption.delete({
      where: { id: optionId },
    });
  }

  async deleteByQuestionId(questionId: string) {
    return prisma.surveyQuestionOption.deleteMany({
      where: { questionId },
    });
  }
}

export const surveyQuestionOptionRepository = new SurveyQuestionOptionRepository();
