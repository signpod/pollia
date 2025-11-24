import prisma from "@/database/utils/prisma/client";

export class SurveyAnswerRepository {
  async findById(answerId: string) {
    return prisma.surveyAnswer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
        option: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByQuestionAndUser(questionId: string, userId: string) {
    return prisma.surveyAnswer.findMany({
      where: {
        questionId,
        userId,
      },
      include: {
        option: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findBySurveyAndUser(surveyId: string, userId: string) {
    return prisma.surveyAnswer.findMany({
      where: {
        userId,
        question: {
          surveyId,
        },
      },
      include: {
        question: true,
        option: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.surveyAnswer.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            survey: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        option: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(data: {
    questionId: string;
    userId: string;
    optionId?: string;
    textAnswer?: string;
    scaleAnswer?: number;
  }) {
    return prisma.surveyAnswer.create({
      data,
      include: {
        question: true,
        option: true,
      },
    });
  }

  async createMany(
    answers: Array<{
      questionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    }>,
    userId: string,
  ) {
    return prisma.surveyAnswer.createMany({
      data: answers.map(answer => ({
        ...answer,
        userId,
      })),
    });
  }

  async update(
    answerId: string,
    data: {
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    },
  ) {
    return prisma.surveyAnswer.update({
      where: { id: answerId },
      data,
      include: {
        question: true,
        option: true,
      },
    });
  }

  async delete(answerId: string) {
    return prisma.surveyAnswer.delete({
      where: { id: answerId },
    });
  }

  async deleteByQuestionsAndUser(questionIds: string[], userId: string) {
    return prisma.surveyAnswer.deleteMany({
      where: {
        questionId: { in: questionIds },
        userId,
      },
    });
  }

  async deleteBySurveyAndUser(surveyId: string, userId: string) {
    return prisma.surveyAnswer.deleteMany({
      where: {
        userId,
        question: {
          surveyId,
        },
      },
    });
  }
}

export const surveyAnswerRepository = new SurveyAnswerRepository();
