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

  async findByMissionId(
    missionId: string,
    options?: { membersOnly?: boolean; dateRange?: { from: Date; to: Date } },
  ) {
    return prisma.trackingActionResponse.findMany({
      where: {
        missionId,
        ...(options?.membersOnly && { userId: { not: null } }),
        ...(options?.dateRange && {
          respondedAt: { gte: options.dateRange.from, lte: options.dateRange.to },
        }),
      },
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

  async findLatestBySessionAndAction(sessionId: string, actionId: string) {
    return prisma.trackingActionResponse.findFirst({
      where: { sessionId, actionId },
      orderBy: { respondedAt: "desc" },
    });
  }

  async findLatestByUserAndAction(userId: string, actionId: string) {
    return prisma.trackingActionResponse.findFirst({
      where: { userId, actionId },
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

  async updateUserIdBySessionId(sessionId: string, userId: string) {
    return prisma.trackingActionResponse.updateMany({
      where: {
        sessionId,
        userId: null,
      },
      data: { userId },
    });
  }
}

export const trackingActionResponseRepository = new TrackingActionResponseRepository();
