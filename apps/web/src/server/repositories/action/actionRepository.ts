import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { ActionType, Prisma } from "@prisma/client";

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
      ].filter(Boolean) as string[];

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
    options: Array<{
      title: string;
      description?: string | null;
      imageUrl?: string | null;
      order: number;
      imageFileUploadId?: string | null;
    }>,
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      const updatedAction = await tx.action.update({
        where: { id: actionId },
        data,
      });

      await tx.actionOption.deleteMany({
        where: { actionId },
      });

      await tx.actionOption.createMany({
        data: options.map(option => ({
          actionId,
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
      ].filter(Boolean) as string[];

      await confirmFileUploads(tx, userId, allFileUploadIds);

      return updatedAction;
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
