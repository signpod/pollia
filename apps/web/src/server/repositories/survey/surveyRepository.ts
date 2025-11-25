import prisma from "@/database/utils/prisma/client";
import type { SortOrderType } from "@/types/common/sort";
import { Prisma } from "@prisma/client";

/**
 * Survey Repository
 * Survey 도메인의 데이터 접근 계층
 */
export class SurveyRepository {
  /**
   * Survey ID로 Survey 조회
   * @param surveyId - Survey ID
   * @returns Survey 또는 null
   */
  async findById(surveyId: string) {
    return prisma.survey.findUnique({
      where: { id: surveyId },
    });
  }

  /**
   * User ID로 Survey 목록 조회
   * @param userId - User ID
   * @param options - 조회 옵션
   * @returns Survey 목록
   */
  async findByUserId(
    userId: string,
    options?: {
      cursor?: string;
      limit?: number;
      sortOrder?: SortOrderType;
    },
  ) {
    const limit = options?.limit ?? 10;

    return prisma.survey.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        target: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: options?.sortOrder === "latest" ? "desc" : "asc",
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
   * Question ID로 Question 상세 조회 (options 포함)
   * @param questionId - Question ID
   * @returns Question 또는 null
   */
  async findQuestionById(questionId: string) {
    return prisma.surveyQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        type: true,
        order: true,
        maxSelections: true,
        surveyId: true,
        options: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Survey ID로 모든 Question 상세 조회 (options 포함)
   * @param surveyId - Survey ID
   * @returns Question 배열
   */
  async findQuestionsBySurveyId(surveyId: string) {
    return prisma.surveyQuestion.findMany({
      where: { surveyId },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        type: true,
        order: true,
        maxSelections: true,
        surveyId: true,
        options: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  /**
   * Survey 생성 및 Question 연결
   * @param data - Survey 생성 데이터
   * @param questionIds - 연결할 Question ID 목록
   * @returns 생성된 Survey
   */
  async createWithQuestions(
    data: {
      title: string;
      description?: string;
      target?: string;
      imageUrl?: string;
      deadline?: Date;
      estimatedMinutes?: number;
      creatorId: string;
    },
    questionIds: string[],
  ) {
    return prisma.$transaction(async tx => {
      const createdSurvey = await tx.survey.create({
        data: {
          title: data.title,
          description: data.description,
          target: data.target,
          imageUrl: data.imageUrl,
          deadline: data.deadline,
          estimatedMinutes: data.estimatedMinutes,
          creatorId: data.creatorId,
        },
      });

      if (questionIds.length > 0) {
        const whenClauses = questionIds.map(
          (id, index) => Prisma.sql`WHEN ${id} THEN ${index + 1}`,
        );

        await tx.$executeRaw`
          UPDATE "survey_questions"
          SET "survey_id" = ${createdSurvey.id},
              "order" = CASE "id" ${Prisma.join(whenClauses, " ")} END
          WHERE "id" IN (${Prisma.join(
            questionIds.map(id => Prisma.sql`${id}`),
            ",",
          )})
        `;
      }

      return createdSurvey;
    });
  }

  /**
   * Survey 수정
   * @param surveyId - Survey ID
   * @param data - 수정할 데이터
   * @returns 수정된 Survey
   */
  async update(
    surveyId: string,
    data: {
      title?: string;
      description?: string;
      target?: string;
      imageUrl?: string;
      deadline?: Date;
      estimatedMinutes?: number;
    },
  ) {
    return prisma.survey.update({
      where: { id: surveyId },
      data,
    });
  }

  /**
   * Survey 삭제
   * @param surveyId - Survey ID
   * @returns 삭제된 Survey
   */
  async delete(surveyId: string) {
    return prisma.survey.delete({
      where: { id: surveyId },
    });
  }
}

export const surveyRepository = new SurveyRepository();
