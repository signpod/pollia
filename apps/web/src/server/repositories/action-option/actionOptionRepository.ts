import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import { getValidFileUploadIds } from "@/server/repositories/common/sanitizeFileUploadRefs";
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
      let safeFileUploadId = data.fileUploadId ?? undefined;
      if (typeof safeFileUploadId === "string") {
        const validIds = await getValidFileUploadIds(tx, [safeFileUploadId]);
        if (!validIds.has(safeFileUploadId)) {
          safeFileUploadId = undefined;
        }
      }

      const createdOption = await tx.actionOption.create({
        data: {
          ...data,
          fileUploadId: safeFileUploadId,
        },
      });

      if (safeFileUploadId) {
        await confirmFileUploads(tx, userId, safeFileUploadId);
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
      const candidateIds = options
        .map(o => o.fileUploadId)
        .filter((id): id is string => typeof id === "string");
      const validIds = await getValidFileUploadIds(tx, candidateIds);

      const safeOptions = options.map(option => ({
        ...option,
        fileUploadId:
          typeof option.fileUploadId === "string" && !validIds.has(option.fileUploadId)
            ? undefined
            : (option.fileUploadId ?? undefined),
      }));

      await tx.actionOption.createMany({
        data: safeOptions.map(option => ({
          actionId,
          ...option,
        })),
      });

      const fileUploadIds = safeOptions
        .map(option => option.fileUploadId)
        .filter(Boolean) as string[];

      await confirmFileUploads(tx, userId, fileUploadIds);

      return tx.actionOption.findMany({
        where: { actionId },
        orderBy: { order: "asc" },
      });
    });
  }

  async update(optionId: string, data: Prisma.ActionOptionUncheckedUpdateInput, userId?: string) {
    let fileUploadId = typeof data.fileUploadId === "string" ? data.fileUploadId : undefined;
    let safeData = data;

    if (fileUploadId) {
      const validIds = await getValidFileUploadIds(prisma, [fileUploadId]);
      if (!validIds.has(fileUploadId)) {
        safeData = { ...data, fileUploadId: null };
        fileUploadId = undefined;
      }
    }

    if (fileUploadId && userId) {
      const confirmedId = fileUploadId;
      return prisma.$transaction(async tx => {
        const updatedOption = await tx.actionOption.update({
          where: { id: optionId },
          data: safeData,
        });

        await confirmFileUploads(tx, userId, confirmedId);

        return updatedOption;
      });
    }

    return prisma.actionOption.update({
      where: { id: optionId },
      data: safeData,
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
