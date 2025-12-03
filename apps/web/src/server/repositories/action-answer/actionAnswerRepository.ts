import prisma from "@/database/utils/prisma/client";

export class ActionAnswerRepository {
  async findById(id: string) {
    return prisma.actionAnswer.findUnique({
      where: { id },
      include: {
        action: true,
        option: true,
        response: {
          select: {
            id: true,
            userId: true,
            missionId: true,
          },
        },
      },
    });
  }

  async findByResponseId(responseId: string) {
    return prisma.actionAnswer.findMany({
      where: { responseId },
      include: {
        action: true,
        option: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.actionAnswer.findMany({
      where: {
        response: {
          userId,
        },
      },
      include: {
        action: true,
        option: true,
        response: {
          select: {
            id: true,
            missionId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByActionId(actionId: string) {
    return prisma.actionAnswer.findMany({
      where: { actionId },
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

  async findByResponseAndAction(responseId: string, actionId: string) {
    return prisma.actionAnswer.findMany({
      where: {
        responseId,
        actionId,
      },
      include: {
        option: true,
      },
    });
  }

  async create(data: {
    responseId: string;
    actionId: string;
    optionId?: string;
    textAnswer?: string;
    scaleAnswer?: number;
  }) {
    return prisma.actionAnswer.create({
      data,
      include: {
        action: true,
        option: true,
      },
    });
  }

  async createMany(
    answers: Array<{
      responseId: string;
      actionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    }>,
  ) {
    return prisma.actionAnswer.createMany({
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
    return prisma.actionAnswer.update({
      where: { id },
      data,
      include: {
        action: true,
        option: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.actionAnswer.delete({
      where: { id },
    });
  }

  async deleteByResponseId(responseId: string) {
    return prisma.actionAnswer.deleteMany({
      where: { responseId },
    });
  }

  async deleteByResponseAndActions(responseId: string, actionIds: string[]) {
    return prisma.actionAnswer.deleteMany({
      where: {
        responseId,
        actionId: { in: actionIds },
      },
    });
  }
}

export const actionAnswerRepository = new ActionAnswerRepository();
