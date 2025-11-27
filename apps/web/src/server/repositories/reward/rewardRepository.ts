import prisma from "@/database/utils/prisma/client";
import type { PaymentType } from "@prisma/client";

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
        paymentType: true,
        scheduledDate: true,
        paidAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    paymentType: PaymentType;
    scheduledDate?: Date;
  }) {
    return prisma.reward.create({
      data,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        paymentType: true,
        scheduledDate: true,
        createdAt: true,
      },
    });
  }

  async update(
    rewardId: string,
    data: {
      name?: string;
      description?: string;
      imageUrl?: string;
      paymentType?: PaymentType;
      scheduledDate?: Date;
    },
  ) {
    return prisma.reward.update({
      where: { id: rewardId },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        paymentType: true,
        scheduledDate: true,
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
