import prisma from "@/database/utils/prisma/client";
import type { FileStatus } from "@prisma/client";

export class ActionOptionRepository {
  async findById(optionId: string) {
    return prisma.actionOption.findUnique({
      where: { id: optionId },
    });
  }

  async findByActionId(actionId: string) {
    return prisma.actionOption.findMany({
      where: { actionId },
      orderBy: { order: "asc" },
    });
  }

  async findMany(options?: {
    actionIds?: string[];
    cursor?: string;
    limit?: number;
  }) {
    const limit = options?.limit ?? 10;

    return prisma.actionOption.findMany({
      where: {
        ...(options?.actionIds &&
          options.actionIds.length > 0 && {
            actionId: {
              in: options.actionIds,
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

  async create(
    data: {
      actionId: string;
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      imageFileUploadId?: string;
    },
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      const createdOption = await tx.actionOption.create({
        data: {
          actionId: data.actionId,
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl,
          order: data.order,
          fileUploadId: data.imageFileUploadId,
        },
      });

      if (data.imageFileUploadId) {
        await tx.fileUpload.updateMany({
          where: {
            id: data.imageFileUploadId,
            userId: userId,
            status: "TEMPORARY" as FileStatus,
          },
          data: {
            status: "CONFIRMED" as FileStatus,
            confirmedAt: new Date(),
          },
        });
      }

      return createdOption;
    });
  }

  async createMany(
    actionId: string,
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

      const fileUploadIds = options
        .map(option => option.imageFileUploadId)
        .filter(Boolean) as string[];

      if (fileUploadIds.length > 0) {
        await tx.fileUpload.updateMany({
          where: {
            id: { in: fileUploadIds },
            userId: userId,
            status: "TEMPORARY" as FileStatus,
          },
          data: {
            status: "CONFIRMED" as FileStatus,
            confirmedAt: new Date(),
          },
        });
      }

      return tx.actionOption.findMany({
        where: { actionId },
        orderBy: { order: "asc" },
      });
    });
  }

  async update(
    optionId: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
      imageFileUploadId?: string;
    },
    userId?: string,
  ) {
    if (data.imageFileUploadId && userId) {
      return prisma.$transaction(async tx => {
        const updatedOption = await tx.actionOption.update({
          where: { id: optionId },
          data: {
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
            order: data.order,
            fileUploadId: data.imageFileUploadId,
          },
        });

        await tx.fileUpload.updateMany({
          where: {
            id: data.imageFileUploadId,
            userId: userId,
            status: "TEMPORARY" as FileStatus,
          },
          data: {
            status: "CONFIRMED" as FileStatus,
            confirmedAt: new Date(),
          },
        });

        return updatedOption;
      });
    }

    return prisma.actionOption.update({
      where: { id: optionId },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        order: data.order,
        fileUploadId: data.imageFileUploadId,
      },
    });
  }

  async delete(optionId: string) {
    return prisma.actionOption.delete({
      where: { id: optionId },
    });
  }

  async deleteByActionId(actionId: string) {
    return prisma.actionOption.deleteMany({
      where: { actionId },
    });
  }
}

export const actionOptionRepository = new ActionOptionRepository();
