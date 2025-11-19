import prisma from "@/database/utils/prisma/client";
import type { PaymentType } from "@prisma/client";

/**
 * Reward Repository
 * Reward 도메인의 데이터 접근 계층
 */
export class RewardRepository {
  /**
   * Reward ID로 Reward 조회
   * @param rewardId - Reward ID
   * @returns Reward 또는 null
   */
  async findById(rewardId: string) {
    return prisma.reward.findUnique({
      where: { id: rewardId },
    });
  }

  /**
   * 모든 Reward 목록 조회
   * @returns Reward 배열
   */
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

  /**
   * Reward 생성
   * @param data - 생성할 Reward 데이터
   * @returns 생성된 Reward
   */
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

  /**
   * Reward 수정
   * @param rewardId - Reward ID
   * @param data - 수정할 Reward 데이터
   * @returns 수정된 Reward
   */
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

  /**
   * Reward 삭제
   * @param rewardId - Reward ID
   * @returns 삭제된 Reward
   */
  async delete(rewardId: string) {
    return prisma.reward.delete({
      where: { id: rewardId },
    });
  }
}

export const rewardRepository = new RewardRepository();
