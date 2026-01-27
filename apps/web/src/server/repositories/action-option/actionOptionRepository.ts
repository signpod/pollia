import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { Prisma } from "@prisma/client";

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
    data: Omit<Prisma.ActionOptionUncheckedCreateInput, "id" | "createdAt" | "updatedAt">,
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      const createdOption = await tx.actionOption.create({
        data: {
          ...data,
          fileUploadId: data.fileUploadId ?? undefined,
        },
      });

      if (data.fileUploadId) {
        await confirmFileUploads(tx, userId, data.fileUploadId);
      }

      return createdOption;
    });
  }

  async createMany(
    actionId: string,
    options: Array<
      Omit<Prisma.ActionOptionUncheckedCreateInput, "id" | "actionId" | "createdAt" | "updatedAt">
    >,
    userId: string,
  ) {
    return prisma.$transaction(async tx => {
      await tx.actionOption.createMany({
        data: options.map(option => ({
          actionId,
          ...option,
          fileUploadId: option.fileUploadId ?? undefined,
        })),
      });

      const fileUploadIds = options.map(option => option.fileUploadId).filter(Boolean) as string[];

      await confirmFileUploads(tx, userId, fileUploadIds);

      return tx.actionOption.findMany({
        where: { actionId },
        orderBy: { order: "asc" },
      });
    });
  }

  async update(optionId: string, data: Prisma.ActionOptionUncheckedUpdateInput, userId?: string) {
    const fileUploadId = typeof data.fileUploadId === "string" ? data.fileUploadId : undefined;

    if (fileUploadId && userId) {
      return prisma.$transaction(async tx => {
        const updatedOption = await tx.actionOption.update({
          where: { id: optionId },
          data,
        });

        await confirmFileUploads(tx, userId, fileUploadId);

        return updatedOption;
      });
    }

    return prisma.actionOption.update({
      where: { id: optionId },
      data,
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
