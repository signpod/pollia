import prisma from "@/database/utils/prisma/client";

export class SurveyResponseRepository {
  async findById(id: string) {
    return prisma.surveyResponse.findUnique({
      where: { id },
      include: {
        survey: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });
  }

  async findBySurveyAndUser(surveyId: string, userId: string) {
    return prisma.surveyResponse.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
      include: {
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });
  }

  async findBySurveyId(surveyId: string) {
    return prisma.surveyResponse.findMany({
      where: { surveyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.surveyResponse.findMany({
      where: { userId },
      include: {
        survey: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
        answers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findCompletedBySurveyId(surveyId: string) {
    return prisma.surveyResponse.findMany({
      where: {
        surveyId,
        completedAt: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: { surveyId: string; userId: string }) {
    return prisma.surveyResponse.create({
      data: {
        surveyId: data.surveyId,
        userId: data.userId,
        startedAt: new Date(),
      },
      include: {
        survey: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async updateCompletedAt(id: string) {
    return prisma.surveyResponse.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return prisma.surveyResponse.delete({
      where: { id },
    });
  }

  async deleteBySurveyAndUser(surveyId: string, userId: string) {
    return prisma.surveyResponse.deleteMany({
      where: {
        surveyId,
        userId,
      },
    });
  }

  async countBySurveyId(surveyId: string) {
    return prisma.surveyResponse.count({
      where: { surveyId },
    });
  }

  async countCompletedBySurveyId(surveyId: string) {
    return prisma.surveyResponse.count({
      where: {
        surveyId,
        completedAt: { not: null },
      },
    });
  }
}

export const surveyResponseRepository = new SurveyResponseRepository();
