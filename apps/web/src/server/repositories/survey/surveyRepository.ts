import prisma from "@/database/utils/prisma/client";

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
}

export const surveyRepository = new SurveyRepository();
