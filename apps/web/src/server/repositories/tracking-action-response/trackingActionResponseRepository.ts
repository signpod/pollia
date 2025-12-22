import prisma from "@/database/utils/prisma/client";
import type { Prisma } from "@prisma/client";

export class TrackingActionResponseRepository {
  async create(data: Prisma.TrackingActionResponseUncheckedCreateInput) {
    return prisma.trackingActionResponse.create({ data });
  }

  async findBySessionId(sessionId: string) {
    return prisma.trackingActionResponse.findMany({
      where: { sessionId },
      orderBy: { respondedAt: "desc" },
    });
  }

  async findByMissionId(missionId: string) {
    return prisma.trackingActionResponse.findMany({
      where: { missionId },
      orderBy: { respondedAt: "desc" },
    });
  }

  async findByActionId(actionId: string) {
    return prisma.trackingActionResponse.findMany({
      where: { actionId },
      orderBy: { respondedAt: "desc" },
    });
  }

  async findByUserId(userId: string) {
    return prisma.trackingActionResponse.findMany({
      where: { userId },
      orderBy: { respondedAt: "desc" },
    });
  }

  async count(options?: {
    missionId?: string;
    actionId?: string;
    userId?: string;
    sessionId?: string;
  }) {
    return prisma.trackingActionResponse.count({
      where: options,
    });
  }
}

export const trackingActionResponseRepository = new TrackingActionResponseRepository();
