import prisma from "@/database/utils/prisma/client";
import type { FileStatus, SurveyQuestionType } from "@prisma/client";

/**
 * Survey Question Repository
 * Survey Question 도메인의 데이터 접근 계층
 */
export class SurveyQuestionRepository {
  /**
   * Question ID로 Question 조회 (옵션 포함)
   * @param questionId - Question ID
   * @returns Question 또는 null
   */
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

  /**
   * Question ID로 Question 조회 (기본)
   * @param questionId - Question ID
   * @returns Question 또는 null
   */
  async findById(questionId: string) {
    return prisma.surveyQuestion.findUnique({
      where: { id: questionId },
    });
  }

  /**
   * Survey ID로 Question ID 목록 조회
   * @param surveyId - Survey ID
   * @returns Question ID 배열
   */
  async findQuestionIdsBySurveyId(surveyId: string) {
    const questions = await prisma.surveyQuestion.findMany({
      where: { surveyId },
      select: { id: true },
      orderBy: { order: "asc" },
    });
    return questions.map(q => q.id);
  }

  /**
   * Survey ID로 Question 상세 목록 조회
   * @param surveyId - Survey ID
   * @returns Question 상세 목록
   */
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

  /**
   * Question 목록 조회 (필터링 및 페이지네이션)
   * @param options - 조회 옵션
   * @returns Question 목록
   */
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

  /**
   * Multiple Choice Question 생성
   * @param data - 생성할 Question 데이터
   * @param options - Option 데이터 목록
   * @param userId - 생성자 User ID
   * @returns 생성된 Question
   */
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

  /**
   * Scale/Subjective/EitherOr Question 생성
   * @param data - 생성할 Question 데이터
   * @returns 생성된 Question
   */
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

  /**
   * Question 수정
   * @param questionId - Question ID
   * @param data - 수정할 데이터
   * @returns 수정된 Question
   */
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

  /**
   * Question 삭제
   * @param questionId - Question ID
   * @returns 삭제된 Question
   */
  async delete(questionId: string) {
    return prisma.surveyQuestion.delete({
      where: { id: questionId },
    });
  }
}

export const surveyQuestionRepository = new SurveyQuestionRepository();
