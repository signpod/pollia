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

  /**
   * 선택된 옵션에 따라 유효하지 않게 된 답변들을 수집합니다.
   *
   * BFS 알고리즘을 사용하여 다음 로직으로 답변을 탐색합니다:
   * 1. 주어진 옵션들의 nextActionId를 시작점으로 큐에 추가
   * 2. 각 액션에 대해 사용자의 답변이 있는지 확인
   * 3. 답변이 있으면 삭제 대상에 추가
   * 4. 완료 화면으로 분기되지 않으면 다음 액션들을 큐에 추가
   * 5. 순환 참조 방지를 위해 방문한 액션은 Set으로 관리
   *
   * @param responseId - 응답 ID
   * @param optionIds - 수집을 시작할 옵션 ID 배열
   * @param tx - 트랜잭션 클라이언트 (선택)
   * @returns 삭제해야 할 답변 ID 배열
   */
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
        action: {
          select: {
            id: true,
            nextActionId: true,
          },
        },
      },
    });

    const allAnswers = await client.actionAnswer.findMany({
      where: { responseId },
      include: {
        action: {
          select: {
            id: true,
            nextActionId: true,
          },
        },
        options: {
          select: {
            id: true,
            nextActionId: true,
            nextCompletionId: true,
          },
        },
      },
    });

    const answersByActionId = new Map(allAnswers.map(answer => [answer.actionId, answer]));

    const queue: string[] = options
      .map(opt => opt.nextActionId || opt.action.nextActionId)
      .filter((id): id is string => id !== null);

    while (queue.length > 0) {
      const actionId = queue.shift();
      if (!actionId) continue;

      if (visitedActions.has(actionId)) continue;
      visitedActions.add(actionId);

      const userAnswer = answersByActionId.get(actionId);

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

  async updateWithPruning(answerId: string, updateData: Prisma.ActionAnswerUpdateInput) {
    return prisma.$transaction(async tx => {
      const answer = await tx.actionAnswer.findFirst({
        where: { id: answerId },
        include: {
          options: {
            select: { id: true },
          },
        },
      });

      if (!answer) {
        return null;
      }

      const oldOptionIds = answer.options.map(opt => opt.id);

      const invalidAnswerIds = await this.collectInvalidAnswersByOptions(
        answer.responseId,
        oldOptionIds,
        tx,
      );

      if (invalidAnswerIds.length > 0) {
        await tx.actionAnswer.deleteMany({
          where: { id: { in: invalidAnswerIds } },
        });
      }

      return tx.actionAnswer.update({
        where: { id: answerId },
        data: updateData,
        include: {
          action: true,
          options: true,
          fileUploads: true,
        },
      });
    });
  }
}

export const actionAnswerRepository = new ActionAnswerRepository();
