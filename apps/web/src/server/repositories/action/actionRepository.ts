import prisma from "@/database/utils/prisma/client";
import type { ActionType, FileStatus } from "@prisma/client";

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
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        imageUrl: true,
        maxSelections: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        missionId: true,
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
    data: {
      missionId?: string;
      title: string;
      description?: string;
      imageUrl?: string;
      type: ActionType;
      order: number;
      maxSelections?: number;
    },
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
          missionId: data.missionId ?? undefined,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          type: data.type,
          order: data.order,
          maxSelections: data.maxSelections,
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

      const optionFileUploadIds = options
        .map(option => option.imageFileUploadId)
        .filter(Boolean) as string[];

      if (optionFileUploadIds.length > 0) {
        await tx.fileUpload.updateMany({
          where: {
            id: { in: optionFileUploadIds },
            userId: userId,
            status: "TEMPORARY" as FileStatus,
          },
          data: {
            status: "CONFIRMED" as FileStatus,
            confirmedAt: new Date(),
          },
        });
      }

      return createdAction;
    });
  }

  async create(data: {
    missionId?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    type: ActionType;
    order: number;
  }) {
    return prisma.action.create({
      data: {
        missionId: data.missionId ?? undefined,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        type: data.type,
        order: data.order,
      },
    });
  }

  async update(
    actionId: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
      maxSelections?: number;
    },
  ) {
    return prisma.action.update({
      where: { id: actionId },
      data,
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
