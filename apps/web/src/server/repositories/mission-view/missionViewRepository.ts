import prisma from "@/database/utils/prisma/client";
import { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export class MissionViewRepository {
  async findByMissionActorAndDate(
    missionId: string,
    actorId: string,
    viewDate: string,
    client: TransactionClient = prisma,
  ) {
    return client.missionView.findUnique({
      where: {
        missionId_actorId_viewDate: { missionId, actorId, viewDate },
      },
    });
  }

  async create(
    missionId: string,
    actorId: string,
    viewDate: string,
    client: TransactionClient = prisma,
  ) {
    return client.missionView.create({
      data: { missionId, actorId, viewDate },
    });
  }
}

export const missionViewRepository = new MissionViewRepository();
