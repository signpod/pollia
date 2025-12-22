import prisma from "@/database/utils/prisma/client";
import type { Prisma } from "@prisma/client";

export class TrackingActionEntryRepository {
  async create(data: Prisma.TrackingActionEntryUncheckedCreateInput) {
    return prisma.trackingActionEntry.create({ data });
  }

  async findBySessionId(sessionId: string) {
    return prisma.trackingActionEntry.findMany({
      where: { sessionId },
      orderBy: { enteredAt: "desc" },
    });
  }

  async findByMissionId(missionId: string) {
    return prisma.trackingActionEntry.findMany({
      where: { missionId },
      orderBy: { enteredAt: "desc" },
    });
  }

  async findByActionId(actionId: string) {
    return prisma.trackingActionEntry.findMany({
      where: { actionId },
      orderBy: { enteredAt: "desc" },
    });
  }

  async findByUserId(userId: string) {
    return prisma.trackingActionEntry.findMany({
      where: { userId },
      orderBy: { enteredAt: "desc" },
    });
  }

  async count(options?: {
    missionId?: string;
    actionId?: string;
    userId?: string;
    sessionId?: string;
  }) {
    return prisma.trackingActionEntry.count({
      where: options,
    });
  }
}

export const trackingActionEntryRepository = new TrackingActionEntryRepository();
