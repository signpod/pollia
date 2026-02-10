import prisma from "@/database/utils/prisma/client";
import { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export class MissionLikeRepository {
  async findByMissionAndUser(
    missionId: string,
    userId: string,
    client: TransactionClient = prisma,
  ) {
    return client.missionLike.findUnique({
      where: {
        missionId_userId: { missionId, userId },
      },
    });
  }

  async findManyByUserId(userId: string) {
    return prisma.missionLike.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { createdAt: "desc" },
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
