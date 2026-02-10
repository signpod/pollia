import prisma from "@/database/utils/prisma/client";
import { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export class MissionLikeRepository {
  async findByMissionAndUser(missionId: string, userId: string) {
    return prisma.missionLike.findUnique({
      where: {
        missionId_userId: { missionId, userId },
      },
    });
  }

  async findManyByMissionIdsAndUser(missionIds: string[], userId: string) {
    if (missionIds.length === 0) return [];
    return prisma.missionLike.findMany({
      where: {
        missionId: { in: missionIds },
        userId,
      },
    });
  }

  async create(missionId: string, userId: string, client: TransactionClient = prisma) {
    return client.missionLike.create({
      data: { missionId, userId },
    });
  }

  async deleteByMissionAndUser(
    missionId: string,
    userId: string,
    client: TransactionClient = prisma,
  ) {
    return client.missionLike.delete({
      where: {
        missionId_userId: { missionId, userId },
      },
    });
  }

  async countByMission(missionId: string) {
    return prisma.missionLike.count({
      where: { missionId },
    });
  }
}

export const missionLikeRepository = new MissionLikeRepository();
