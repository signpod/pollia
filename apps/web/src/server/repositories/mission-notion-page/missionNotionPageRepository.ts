import prisma from "@/database/utils/prisma/client";
import type { Prisma } from "@prisma/client";

export class MissionNotionPageRepository {
  async findByMissionId(missionId: string) {
    return prisma.missionNotionPage.findUnique({
      where: { missionId },
    });
  }

  async create(data: Prisma.MissionNotionPageUncheckedCreateInput) {
    return prisma.missionNotionPage.create({ data });
  }

  async update(missionId: string, data: Prisma.MissionNotionPageUncheckedUpdateInput) {
    return prisma.missionNotionPage.update({
      where: { missionId },
      data,
    });
  }

  async upsert(
    missionId: string,
    data: Omit<Prisma.MissionNotionPageUncheckedCreateInput, "missionId">,
  ) {
    return prisma.missionNotionPage.upsert({
      where: { missionId },
      create: { missionId, ...data },
      update: data,
    });
  }

  async delete(missionId: string) {
    return prisma.missionNotionPage.delete({
      where: { missionId },
    });
  }
}

export const missionNotionPageRepository = new MissionNotionPageRepository();
