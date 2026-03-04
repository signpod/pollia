import prisma from "@/database/utils/prisma/client";

export class MissionCompletionStatRepository {
  async findByMissionId(missionId: string) {
    return prisma.missionCompletionStat.findMany({
      where: { missionId },
      include: {
        missionCompletion: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
    });
  }
}

export const missionCompletionStatRepository = new MissionCompletionStatRepository();
