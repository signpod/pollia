import prisma from "@/database/utils/prisma/client";
import type { FileStatus } from "@prisma/client";

/**
 * Survey Question Option Repository
 * Survey Question Option 도메인의 데이터 접근 계층
 */
export class SurveyQuestionOptionRepository {
  /**
   * Option ID로 Option 조회
   * @param optionId - Option ID
   * @returns Option 또는 null
   */
  async findById(optionId: string) {
    return prisma.surveyQuestionOption.findUnique({
      where: { id: optionId },
    });
  }

  /**
   * Question ID로 Option 목록 조회
   * @param questionId - Question ID
   * @returns Option 목록
   */
  async findByQuestionId(questionId: string) {
    return prisma.surveyQuestionOption.findMany({
      where: { questionId },
      orderBy: { order: "asc" },
    });
  }

  /**
   * Option 목록 조회
   * @param options - 조회 옵션
   * @returns Option 목록
   */
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

  /**
   * Option 생성 (FileUpload 처리 포함)
   * @param data - 생성할 Option 데이터
   * @param userId - 생성자 User ID
   * @returns 생성된 Option
   */
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

  /**
   * 여러 Option 생성 (FileUpload 처리 포함)
   * @param questionId - Question ID
   * @param options - 생성할 Option 데이터 목록
   * @param userId - 생성자 User ID
   * @returns 생성된 Option 목록
   */
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

  /**
   * Option 수정
   * @param optionId - Option ID
   * @param data - 수정할 데이터
   * @returns 수정된 Option
   */
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

  /**
   * Option 삭제
   * @param optionId - Option ID
   * @returns 삭제된 Option
   */
  async delete(optionId: string) {
    return prisma.surveyQuestionOption.delete({
      where: { id: optionId },
    });
  }

  /**
   * Question의 모든 Option 삭제
   * @param questionId - Question ID
   * @returns 삭제된 Option 개수
   */
  async deleteByQuestionId(questionId: string) {
    return prisma.surveyQuestionOption.deleteMany({
      where: { questionId },
    });
  }
}

export const surveyQuestionOptionRepository = new SurveyQuestionOptionRepository();
