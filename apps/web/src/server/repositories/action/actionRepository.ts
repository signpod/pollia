import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { ActionType, Prisma } from "@prisma/client";
import { type OptionInput, classifyOptions } from "./classifyOptions";

export class ActionRepository {
  async findByIdWithOptions(actionId: string) {
    return prisma.action.findUnique({
      where: { id: actionId },
      include: {
        options: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            fileUploadId: true,
            order: true,
          },
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
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            fileUploadId: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
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
    options: Array<{
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      imageFileUploadId?: string;
    }>,
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      const createdAction = await tx.action.create({
        data: {
          ...data,
          missionId: data.missionId ?? undefined,
        },
      });

      await tx.actionOption.createMany({
        data: options.map(option => ({
          actionId: createdAction.id,
          title: option.title,
          description: option.description || null,
          imageUrl: option.imageUrl,
          order: option.order,
          fileUploadId: option.imageFileUploadId,
        })),
      });

      const allFileUploadIds = [
        data.imageFileUploadId,
        ...options.map(option => option.imageFileUploadId),
      ].filter((id): id is string => Boolean(id));

      await confirmFileUploads(tx, userId, allFileUploadIds);

      return createdAction;
    });
  }

  async create(
    data: Omit<Prisma.ActionUncheckedCreateInput, "id" | "createdAt" | "updatedAt">,
    userId?: string,
  ) {
    if (data.imageFileUploadId && typeof data.imageFileUploadId === "string" && userId) {
      return prisma.$transaction(async tx => {
        const createdAction = await tx.action.create({
          data: {
            ...data,
            missionId: data.missionId ?? undefined,
          },
        });

        await confirmFileUploads(tx, userId, data.imageFileUploadId as string);

        return createdAction;
      });
    }

    return prisma.action.create({
      data: {
        ...data,
        missionId: data.missionId ?? undefined,
      },
    });
  }

  async update(actionId: string, data: Prisma.ActionUncheckedUpdateInput, userId?: string) {
    if (data.imageFileUploadId && typeof data.imageFileUploadId === "string" && userId) {
      return prisma.$transaction(async tx => {
        const updatedAction = await tx.action.update({
          where: { id: actionId },
          data,
        });

        await confirmFileUploads(tx, userId, data.imageFileUploadId as string);

        return updatedAction;
      });
    }

    return prisma.action.update({
      where: { id: actionId },
      data,
    });
  }

  async updateWithOptions(
    actionId: string,
    data: Prisma.ActionUncheckedUpdateInput,
    options: OptionInput[],
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      const updatedAction = await tx.action.update({
        where: { id: actionId },
        data,
      });

      const existingIds = await this.getExistingOptionIds(tx, actionId);
      const { toUpdate, toCreate, toDeleteIds } = classifyOptions(existingIds, options);

      await this.deleteOptions(tx, toDeleteIds);
      await this.updateOptions(tx, toUpdate);
      await this.createOptions(tx, actionId, toCreate);

      const allFileUploadIds = [
        data.imageFileUploadId,
        ...options.map(option => option.imageFileUploadId),
      ].filter((id): id is string => Boolean(id));

      await confirmFileUploads(tx, userId, allFileUploadIds);

      return updatedAction;
    });
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
      options.map(opt =>
        tx.actionOption.update({
          where: { id: opt.id },
          data: {
            title: opt.title,
            description: opt.description || null,
            imageUrl: opt.imageUrl,
            order: opt.order,
            fileUploadId: opt.imageFileUploadId,
          },
        }),
      ),
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
        actionId,
        title: opt.title,
        description: opt.description || null,
        imageUrl: opt.imageUrl,
        order: opt.order,
        fileUploadId: opt.imageFileUploadId,
      })),
    });
  }

  async delete(actionId: string) {
    return prisma.action.delete({
      where: { id: actionId },
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
