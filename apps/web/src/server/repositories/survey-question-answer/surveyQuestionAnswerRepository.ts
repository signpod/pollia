import prisma from "@/database/utils/prisma/client";

export class SurveyQuestionAnswerRepository {
  async findById(id: string) {
    return prisma.surveyQuestionAnswer.findUnique({
      where: { id },
      include: {
        question: true,
        option: true,
        response: {
          select: {
            id: true,
            userId: true,
            surveyId: true,
          },
        },
      },
    });
  }

  async findByResponseId(responseId: string) {
    return prisma.surveyQuestionAnswer.findMany({
      where: { responseId },
      include: {
        question: true,
        option: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findByQuestionId(questionId: string) {
    return prisma.surveyQuestionAnswer.findMany({
      where: { questionId },
      include: {
        response: {
          select: {
            userId: true,
          },
        },
        option: true,
      },
    });
  }

  async findByResponseAndQuestion(responseId: string, questionId: string) {
    return prisma.surveyQuestionAnswer.findMany({
      where: {
        responseId,
        questionId,
      },
      include: {
        option: true,
      },
    });
  }

  async create(data: {
    responseId: string;
    questionId: string;
    optionId?: string;
    textAnswer?: string;
    scaleAnswer?: number;
  }) {
    return prisma.surveyQuestionAnswer.create({
      data,
      include: {
        question: true,
        option: true,
      },
    });
  }

  async createMany(
    answers: Array<{
      responseId: string;
      questionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    }>,
  ) {
    return prisma.surveyQuestionAnswer.createMany({
      data: answers,
    });
  }

  async update(
    id: string,
    data: {
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    },
  ) {
    return prisma.surveyQuestionAnswer.update({
      where: { id },
      data,
      include: {
        question: true,
        option: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.surveyQuestionAnswer.delete({
      where: { id },
    });
  }

  async deleteByResponseId(responseId: string) {
    return prisma.surveyQuestionAnswer.deleteMany({
      where: { responseId },
    });
  }

  async deleteByResponseAndQuestions(responseId: string, questionIds: string[]) {
    return prisma.surveyQuestionAnswer.deleteMany({
      where: {
        responseId,
        questionId: { in: questionIds },
      },
    });
  }
}

export const surveyQuestionAnswerRepository = new SurveyQuestionAnswerRepository();
