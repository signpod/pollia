import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import {
  getValidFileUploadIds,
  sanitizeFileUploadRefs,
} from "@/server/repositories/common/sanitizeFileUploadRefs";
import type { ActionType, Prisma } from "@prisma/client";
import { type OptionInput, classifyOptions } from "./classifyOptions";

export class ActionRepository {
  async findByIdWithOptions(actionId: string) {
    return prisma.action.findUnique({
      where: { id: actionId },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async findById(actionId: string) {
    return prisma.action.findUnique({
      where: { id: actionId },
    });
  }

  async findActionIdsByMissionId(missionId: string) {
    const actions = await prisma.action.findMany({
      where: { missionId },
      select: { id: true },
      orderBy: { order: "asc" },
    });
    return actions.map(q => q.id);
  }

  async findDetailsByMissionId(missionId: string) {
    return prisma.action.findMany({
      where: { missionId },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async hasFileUploadActionByMissionId(missionId: string) {
    const count = await prisma.action.count({
      where: {
        missionId,
        type: {
          in: ["IMAGE", "PDF", "VIDEO"],
        },
      },
    });

    return count > 0;
  }

  async findMany(options?: {
    searchQuery?: string;
    selectedActionTypes?: ActionType[];
    isDraft?: boolean;
    cursor?: string;
    limit?: number;
  }) {
    const limit = options?.limit ?? 10;

    return prisma.action.findMany({
      where: {
        ...(options?.isDraft && {
          missionId: null,
        }),
        ...(options?.searchQuery && {
          title: {
            contains: options.searchQuery,
            mode: "insensitive",
          },
        }),
        ...(options?.selectedActionTypes &&
          options.selectedActionTypes.length > 0 && {
            type: {
              in: options.selectedActionTypes,
            },
          }),
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

  async createMultipleChoice(
    data: Omit<Prisma.ActionUncheckedCreateInput, "id" | "createdAt" | "updatedAt">,
    options: OptionInput[],
    userId: string,
    client?: Prisma.TransactionClient,
  ) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const allCandidateIds = [
        typeof data.imageFileUploadId === "string" ? data.imageFileUploadId : undefined,
        ...options.map(o => (typeof o.fileUploadId === "string" ? o.fileUploadId : undefined)),
      ].filter((id): id is string => Boolean(id));

      const validIds = await getValidFileUploadIds(tx, allCandidateIds);

      const safeData = {
        ...data,
        missionId: data.missionId ?? undefined,
        ...(typeof data.imageFileUploadId === "string" && !validIds.has(data.imageFileUploadId)
          ? { imageFileUploadId: null, imageUrl: null }
          : {}),
      };

      const safeOptions = options.map(option => ({
        ...option,
        fileUploadId:
          typeof option.fileUploadId === "string" && !validIds.has(option.fileUploadId)
            ? null
            : option.fileUploadId,
      }));

      const createdAction = await tx.action.create({ data: safeData });

      await tx.actionOption.createMany({
        data: safeOptions.map(option => ({
          ...option,
          actionId: createdAction.id,
        })),
      });

      const confirmedIds = [
        typeof safeData.imageFileUploadId === "string" ? safeData.imageFileUploadId : undefined,
        ...safeOptions.map(o => (typeof o.fileUploadId === "string" ? o.fileUploadId : undefined)),
      ].filter((id): id is string => Boolean(id));

      await confirmFileUploads(tx, userId, confirmedIds);

      return createdAction;
    };

    if (client) {
      return execute(client);
    }
    return prisma.$transaction(execute);
  }

  async create(
    data: Omit<Prisma.ActionUncheckedCreateInput, "id" | "createdAt" | "updatedAt">,
    userId?: string,
    client?: Prisma.TransactionClient,
  ) {
    const queryClient = client ?? prisma;
    const sanitizedData = await sanitizeFileUploadRefs(queryClient, data, [
      { idField: "imageFileUploadId", urlField: "imageUrl" },
    ]);
    const safeData = {
      ...sanitizedData,
      missionId: data.missionId ?? undefined,
    };

    const execute = async (tx: Prisma.TransactionClient) => {
      const createdAction = await tx.action.create({ data: safeData });

      if (safeData.imageFileUploadId && typeof safeData.imageFileUploadId === "string" && userId) {
        await confirmFileUploads(tx, userId, safeData.imageFileUploadId);
      }

      return createdAction;
    };

    if (client) {
      return execute(client);
    }

    if (safeData.imageFileUploadId && typeof safeData.imageFileUploadId === "string" && userId) {
      return prisma.$transaction(execute);
    }

    return prisma.action.create({ data: safeData });
  }

  async update(
    actionId: string,
    data: Prisma.ActionUncheckedUpdateInput,
    userId?: string,
    client?: Prisma.TransactionClient,
  ) {
    const queryClient = client ?? prisma;
    const sanitizedData = await sanitizeFileUploadRefs(queryClient, data, [
      { idField: "imageFileUploadId", urlField: "imageUrl" },
    ]);
    const safeData = sanitizedData;

    const execute = async (tx: Prisma.TransactionClient) => {
      const updatedAction = await tx.action.update({
        where: { id: actionId },
        data: safeData,
      });

      if (safeData.imageFileUploadId && typeof safeData.imageFileUploadId === "string" && userId) {
        await confirmFileUploads(tx, userId, safeData.imageFileUploadId);
      }

      return updatedAction;
    };

    if (client) {
      return execute(client);
    }

    if (safeData.imageFileUploadId && typeof safeData.imageFileUploadId === "string" && userId) {
      return prisma.$transaction(execute);
    }

    return prisma.action.update({
      where: { id: actionId },
      data: safeData,
    });
  }

  async updateWithOptions(
    actionId: string,
    data: Prisma.ActionUncheckedUpdateInput,
    options: OptionInput[],
    userId: string,
    client?: Prisma.TransactionClient,
  ) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const allCandidateIds = [
        typeof data.imageFileUploadId === "string" ? data.imageFileUploadId : undefined,
        ...options.map(o => (typeof o.fileUploadId === "string" ? o.fileUploadId : undefined)),
      ].filter((id): id is string => Boolean(id));

      const validIds = await getValidFileUploadIds(tx, allCandidateIds);

      const safeData = {
        ...data,
        ...(typeof data.imageFileUploadId === "string" && !validIds.has(data.imageFileUploadId)
          ? { imageFileUploadId: null, imageUrl: null }
          : {}),
      };

      const safeOptions = options.map(option => ({
        ...option,
        fileUploadId:
          typeof option.fileUploadId === "string" && !validIds.has(option.fileUploadId)
            ? null
            : option.fileUploadId,
      }));

      const updatedAction = await tx.action.update({
        where: { id: actionId },
        data: safeData,
      });

      const existingOptionIds = await this.getExistingOptionIds(tx, actionId);
      const { toUpdate, toCreate, toDeleteIds } = classifyOptions(existingOptionIds, safeOptions);

      await this.deleteOptions(tx, toDeleteIds);
      await this.updateOptions(tx, toUpdate);
      await this.createOptions(tx, actionId, toCreate);

      const confirmedIds = [
        typeof safeData.imageFileUploadId === "string" ? safeData.imageFileUploadId : undefined,
        ...safeOptions.map(o => (typeof o.fileUploadId === "string" ? o.fileUploadId : undefined)),
      ].filter((id): id is string => Boolean(id));

      await confirmFileUploads(tx, userId, confirmedIds);

      return updatedAction;
    };

    if (client) {
      return execute(client);
    }
    return prisma.$transaction(execute);
  }

  private async getExistingOptionIds(
    tx: Prisma.TransactionClient,
    actionId: string,
  ): Promise<Set<string>> {
    const existing = await tx.actionOption.findMany({
      where: { actionId },
      select: { id: true },
    });
    return new Set(existing.map(o => o.id));
  }

  private async deleteOptions(tx: Prisma.TransactionClient, ids: string[]) {
    if (ids.length === 0) return;
    await tx.actionOption.deleteMany({ where: { id: { in: ids } } });
  }

  private async updateOptions(tx: Prisma.TransactionClient, options: OptionInput[]) {
    if (options.length === 0) return;

    await Promise.all(
      options.map((opt, index) =>
        tx.actionOption.update({
          where: { id: opt.id },
          data: { order: 10000 + index },
        }),
      ),
    );

    await Promise.all(
      options.map(opt => {
        const { id, ...data } = opt;
        return tx.actionOption.update({
          where: { id },
          data: data as Prisma.ActionOptionUncheckedUpdateInput,
        });
      }),
    );
  }

  private async createOptions(
    tx: Prisma.TransactionClient,
    actionId: string,
    options: OptionInput[],
  ) {
    if (options.length === 0) return;
    await tx.actionOption.createMany({
      data: options.map(opt => ({
        ...opt,
        actionId,
      })),
    });
  }

  async delete(actionId: string, client: Prisma.TransactionClient = prisma) {
    return client.action.delete({
      where: { id: actionId },
    });
  }

  async findOrdersByMissionId(missionId: string, client: Prisma.TransactionClient = prisma) {
    return client.action.findMany({
      where: { missionId },
      select: { id: true, order: true, createdAt: true },
    });
  }

  async updateOrder(actionId: string, order: number, client: Prisma.TransactionClient = prisma) {
    return client.action.update({
      where: { id: actionId },
      data: { order },
    });
  }

  async updateManyOrders(updates: Array<{ id: string; order: number }>) {
    return prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.action.update({
          where: { id },
          data: { order },
        }),
      ),
    );
  }
}

export const actionRepository = new ActionRepository();
