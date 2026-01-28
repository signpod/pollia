import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import { Prisma } from "@prisma/client";

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class ActionAnswerRepository {
  async findById(id: string) {
    return prisma.actionAnswer.findUnique({
      where: { id },
      include: {
        action: true,
        options: true,
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
        options: true,
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
        options: true,
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
        options: true,
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
        options: true,
      },
    });
  }

  async create(data: Prisma.ActionAnswerCreateInput, userId?: string) {
    const fileUploadIds =
      data.fileUploads && typeof data.fileUploads === "object" && "connect" in data.fileUploads
        ? (data.fileUploads.connect as { id: string }[]).map(f => f.id)
        : [];

    if (fileUploadIds.length > 0 && userId) {
      return prisma.$transaction(async tx => {
        const createdAnswer = await tx.actionAnswer.create({
          data,
          include: {
            action: true,
            options: true,
            fileUploads: true,
          },
        });

        await confirmFileUploads(tx, userId, fileUploadIds);

        return createdAnswer;
      });
    }

    return prisma.actionAnswer.create({
      data,
      include: {
        action: true,
        options: true,
        fileUploads: true,
      },
    });
  }

  async createMany(
    answers: Array<Omit<Prisma.ActionAnswerUncheckedCreateInput, "createdAt">>,
    userId?: string,
  ) {
    const allFileUploadIds = answers.flatMap(answer => {
      if (
        answer.fileUploads &&
        typeof answer.fileUploads === "object" &&
        "connect" in answer.fileUploads
      ) {
        return (answer.fileUploads.connect as { id: string }[]).map(f => f.id);
      }
      return [];
    });

    if (allFileUploadIds.length > 0 && userId) {
      return prisma.$transaction(async tx => {
        const createdAnswers = await Promise.all(
          answers.map(data =>
            tx.actionAnswer.create({
              data,
            }),
          ),
        );

        await confirmFileUploads(tx, userId, allFileUploadIds);

        return { count: createdAnswers.length };
      });
    }

    return prisma.actionAnswer.createMany({
      data: answers,
    });
  }

  async createManyWithRelations(answersData: Prisma.ActionAnswerCreateInput[], userId?: string) {
    const allFileUploadIds = answersData.flatMap(data => {
      if (
        data.fileUploads &&
        typeof data.fileUploads === "object" &&
        "connect" in data.fileUploads
      ) {
        return (data.fileUploads.connect as { id: string }[]).map(f => f.id);
      }
      return [];
    });

    return prisma.$transaction(async tx => {
      const createdAnswers = await Promise.all(
        answersData.map(data =>
          tx.actionAnswer.create({
            data,
            include: {
              action: true,
              options: true,
              fileUploads: true,
            },
          }),
        ),
      );

      if (allFileUploadIds.length > 0 && userId) {
        await confirmFileUploads(tx, userId, allFileUploadIds);
      }

      return createdAnswers;
    });
  }

  async update(id: string, data: Prisma.ActionAnswerUncheckedUpdateInput, userId?: string) {
    const fileUploadIds =
      data.fileUploads && typeof data.fileUploads === "object" && "set" in data.fileUploads
        ? (data.fileUploads.set as { id: string }[]).map(f => f.id)
        : [];

    if (fileUploadIds.length > 0 && userId) {
      return prisma.$transaction(async tx => {
        const updatedAnswer = await tx.actionAnswer.update({
          where: { id },
          data,
          include: {
            action: true,
            options: true,
            fileUploads: true,
          },
        });

        await confirmFileUploads(tx, userId, fileUploadIds);

        return updatedAnswer;
      });
    }

    return prisma.actionAnswer.update({
      where: { id },
      data,
      include: {
        action: true,
        options: true,
        fileUploads: true,
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

  async deleteManyByIds(ids: string[]) {
    return prisma.actionAnswer.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async collectInvalidAnswersByOptions(
    responseId: string,
    optionIds: string[],
    tx?: PrismaTransaction,
  ): Promise<string[]> {
    const client = tx || prisma;
    const answersToDelete: string[] = [];
    const visitedActions = new Set<string>();

    const options = await client.actionOption.findMany({
      where: { id: { in: optionIds } },
      select: {
        id: true,
        nextActionId: true,
        nextCompletionId: true,
      },
    });

    const queue: string[] = options
      .map(opt => opt.nextActionId)
      .filter((id): id is string => id !== null);

    while (queue.length > 0) {
      const actionId = queue.shift();
      if (!actionId) continue;

      if (visitedActions.has(actionId)) continue;
      visitedActions.add(actionId);

      const userAnswer = await client.actionAnswer.findFirst({
        where: { responseId, actionId },
        include: {
          options: {
            select: {
              id: true,
              nextActionId: true,
              nextCompletionId: true,
            },
          },
        },
      });

      if (!userAnswer) continue;

      answersToDelete.push(userAnswer.id);

      const hasCompletion = userAnswer.options.some(opt => opt.nextCompletionId !== null);
      if (hasCompletion) continue;

      const nextActionIds = userAnswer.options
        .map(opt => opt.nextActionId)
        .filter((id): id is string => id !== null);
      queue.push(...nextActionIds);
    }

    return answersToDelete;
  }
}

export const actionAnswerRepository = new ActionAnswerRepository();
