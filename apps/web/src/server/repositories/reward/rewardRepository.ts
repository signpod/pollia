import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import { sanitizeFileUploadRefs } from "@/server/repositories/common/sanitizeFileUploadRefs";
import type { Prisma } from "@prisma/client";

type RewardCreateData = Omit<
  Prisma.RewardUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt" | "missions"
>;

type RewardUpdateData = Omit<
  Prisma.RewardUncheckedUpdateInput,
  "id" | "createdAt" | "updatedAt" | "missions"
>;

export class RewardRepository {
  async findById(rewardId: string) {
    return prisma.reward.findUnique({
      where: { id: rewardId },
    });
  }

  async findMany() {
    return prisma.reward.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        imageFileUploadId: true,
        paymentType: true,
        scheduledDate: true,
        paidAt: true,
        createdAt: true,
        missions: {
          select: { id: true },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(data: RewardCreateData, userId?: string) {
    const sanitizedData = await sanitizeFileUploadRefs(prisma, data as Record<string, unknown>, [
      { idField: "imageFileUploadId", urlField: "imageUrl" },
    ]);
    const safeData = sanitizedData as RewardCreateData;

    const fileUploadId =
      typeof safeData.imageFileUploadId === "string" ? safeData.imageFileUploadId : undefined;

    if (fileUploadId && userId) {
      return prisma.$transaction(async tx => {
        const reward = await tx.reward.create({
          data: safeData,
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            imageFileUploadId: true,
            paymentType: true,
            scheduledDate: true,
            createdAt: true,
          },
        });

        await confirmFileUploads(tx, userId, fileUploadId);

        return reward;
      });
    }

    return prisma.reward.create({
      data: safeData,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        imageFileUploadId: true,
        paymentType: true,
        scheduledDate: true,
        createdAt: true,
      },
    });
  }

  async update(rewardId: string, data: RewardUpdateData, userId?: string) {
    const sanitizedData = await sanitizeFileUploadRefs(prisma, data as Record<string, unknown>, [
      { idField: "imageFileUploadId", urlField: "imageUrl" },
    ]);
    const safeData = sanitizedData as RewardUpdateData;

    const fileUploadId =
      typeof safeData.imageFileUploadId === "string" ? safeData.imageFileUploadId : undefined;

    if (fileUploadId && userId) {
      return prisma.$transaction(async tx => {
        const reward = await tx.reward.update({
          where: { id: rewardId },
          data: safeData,
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            imageFileUploadId: true,
            paymentType: true,
            scheduledDate: true,
            paidAt: true,
            updatedAt: true,
          },
        });

        await confirmFileUploads(tx, userId, fileUploadId);

        return reward;
      });
    }

    return prisma.reward.update({
      where: { id: rewardId },
      data: safeData,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        imageFileUploadId: true,
        paymentType: true,
        scheduledDate: true,
        paidAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(rewardId: string) {
    return prisma.reward.delete({
      where: { id: rewardId },
    });
  }
}

export const rewardRepository = new RewardRepository();
