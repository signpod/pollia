import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";

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

  async create(
    data: {
      responseId: string;
      actionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
      imageUrl?: string;
      imageFileUploadId?: string;
    },
    userId?: string,
  ) {
    if (data.imageFileUploadId && userId) {
      return prisma.$transaction(async tx => {
        const createdAnswer = await tx.actionAnswer.create({
          data: {
            responseId: data.responseId,
            actionId: data.actionId,
            optionId: data.optionId,
            textAnswer: data.textAnswer,
            scaleAnswer: data.scaleAnswer,
            imageUrl: data.imageUrl,
            imageFileUploadId: data.imageFileUploadId,
          },
          include: {
            action: true,
            option: true,
          },
        });

        await confirmFileUploads(tx, userId, data.imageFileUploadId);

        return createdAnswer;
      });
    }

    return prisma.actionAnswer.create({
      data: {
        responseId: data.responseId,
        actionId: data.actionId,
        optionId: data.optionId,
        textAnswer: data.textAnswer,
        scaleAnswer: data.scaleAnswer,
        imageUrl: data.imageUrl,
        imageFileUploadId: data.imageFileUploadId,
      },
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
      imageUrl?: string;
      imageFileUploadId?: string;
    }>,
    userId?: string,
  ) {
    const fileUploadIds = answers.map(a => a.imageFileUploadId).filter(Boolean) as string[];

    if (fileUploadIds.length > 0 && userId) {
      return prisma.$transaction(async tx => {
        await tx.actionAnswer.createMany({
          data: answers.map(a => ({
            responseId: a.responseId,
            actionId: a.actionId,
            optionId: a.optionId,
            textAnswer: a.textAnswer,
            scaleAnswer: a.scaleAnswer,
            imageUrl: a.imageUrl,
            imageFileUploadId: a.imageFileUploadId,
          })),
        });

        await confirmFileUploads(tx, userId, fileUploadIds);

        return { count: answers.length };
      });
    }

    return prisma.actionAnswer.createMany({
      data: answers.map(a => ({
        responseId: a.responseId,
        actionId: a.actionId,
        optionId: a.optionId,
        textAnswer: a.textAnswer,
        scaleAnswer: a.scaleAnswer,
        imageUrl: a.imageUrl,
        imageFileUploadId: a.imageFileUploadId,
      })),
    });
  }

  async update(
    id: string,
    data: {
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
      imageUrl?: string;
      imageFileUploadId?: string;
    },
    userId?: string,
  ) {
    if (data.imageFileUploadId && userId) {
      return prisma.$transaction(async tx => {
        const updatedAnswer = await tx.actionAnswer.update({
          where: { id },
          data: {
            optionId: data.optionId,
            textAnswer: data.textAnswer,
            scaleAnswer: data.scaleAnswer,
            imageUrl: data.imageUrl,
            imageFileUploadId: data.imageFileUploadId,
          },
          include: {
            action: true,
            option: true,
          },
        });

        await confirmFileUploads(tx, userId, data.imageFileUploadId);

        return updatedAnswer;
      });
    }

    return prisma.actionAnswer.update({
      where: { id },
      data: {
        optionId: data.optionId,
        textAnswer: data.textAnswer,
        scaleAnswer: data.scaleAnswer,
        imageUrl: data.imageUrl,
        imageFileUploadId: data.imageFileUploadId,
      },
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
