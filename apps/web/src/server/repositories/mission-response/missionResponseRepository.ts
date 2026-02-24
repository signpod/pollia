import prisma from "@/database/utils/prisma/client";

const ANSWERS_WITH_RELATIONS = {
  include: {
    action: true,
    options: true,
    fileUploads: true,
  },
} as const;

export class MissionResponseRepository {
  async findById(id: string) {
    return prisma.missionResponse.findUnique({
      where: { id },
      include: {
        mission: true,
        user: true,
        answers: ANSWERS_WITH_RELATIONS,
      },
    });
  }

  async findByMissionAndUser(missionId: string, userId: string) {
    return prisma.missionResponse.findFirst({
      where: { missionId, userId },
      include: {
        answers: ANSWERS_WITH_RELATIONS,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByMissionAndGuest(missionId: string, guestId: string) {
    return prisma.missionResponse.findFirst({
      where: { missionId, guestId },
      include: {
        answers: ANSWERS_WITH_RELATIONS,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByMissionId(missionId: string, options?: { membersOnly?: boolean }) {
    return prisma.missionResponse.findMany({
      where: {
        missionId,
        ...(options?.membersOnly && { userId: { not: null } }),
      },
      include: {
        user: true,
        answers: ANSWERS_WITH_RELATIONS,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.missionResponse.findMany({
      where: { userId },
      include: {
        mission: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            estimatedMinutes: true,
            category: true,
            deadline: true,
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
        answers: {
          include: {
            action: {
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
                isRequired: true,
                nextCompletionId: true,
              },
            },
            options: {
              select: {
                id: true,
                title: true,
                order: true,
                nextCompletionId: true,
              },
              orderBy: {
                order: "asc",
              },
            },
            fileUploads: {
              select: {
                id: true,
                publicUrl: true,
                originalFileName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findCompletedByMissionId(missionId: string) {
    return prisma.missionResponse.findMany({
      where: {
        missionId,
        completedAt: { not: null },
      },
      include: {
        user: true,
      },
    });
  }

  async create(data: { missionId: string; userId?: string | null; guestId?: string | null }) {
    return prisma.missionResponse.create({
      data: {
        missionId: data.missionId,
        userId: data.userId ?? null,
        guestId: data.guestId ?? null,
        startedAt: new Date(),
      },
      include: {
        mission: true,
      },
    });
  }

  async updateCompletedAt(id: string) {
    return prisma.missionResponse.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
    });
  }

  async findLatestCompletedAtByActor(input: {
    missionId: string;
    userId?: string | null;
    guestId?: string | null;
  }) {
    const { missionId, userId, guestId } = input;

    if (userId) {
      const response = await prisma.missionResponse.findFirst({
        where: {
          missionId,
          userId,
          completedAt: { not: null },
        },
        select: { completedAt: true },
        orderBy: { completedAt: "desc" },
      });

      return response?.completedAt ?? null;
    }

    if (!guestId) {
      return null;
    }

    const response = await prisma.missionResponse.findFirst({
      where: {
        missionId,
        guestId,
        completedAt: { not: null },
      },
      select: { completedAt: true },
      orderBy: { completedAt: "desc" },
    });

    return response?.completedAt ?? null;
  }

  async updateCompletedAtWithAbuseMeta(
    id: string,
    input: {
      completedAt: Date;
      ipAddress?: string | null;
      userAgent?: string | null;
      submissionIntervalSeconds?: number | null;
    },
  ) {
    return prisma.missionResponse.update({
      where: { id },
      data: {
        completedAt: input.completedAt,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        submissionIntervalSeconds: input.submissionIntervalSeconds ?? null,
      },
    });
  }

  async nullifyAbuseMetaOlderThan(cutoffDate: Date) {
    const result = await prisma.missionResponse.updateMany({
      where: {
        completedAt: { lt: cutoffDate },
        OR: [
          { ipAddress: { not: null } },
          { userAgent: { not: null } },
          { submissionIntervalSeconds: { not: null } },
        ],
      },
      data: {
        ipAddress: null,
        userAgent: null,
        submissionIntervalSeconds: null,
      },
    });

    return result.count;
  }

  async delete(id: string) {
    return prisma.missionResponse.delete({
      where: { id },
    });
  }

  async deleteByMissionAndUser(missionId: string, userId: string) {
    return prisma.missionResponse.deleteMany({
      where: {
        missionId,
        userId,
      },
    });
  }

  async deleteByMissionAndGuest(missionId: string, guestId: string) {
    return prisma.missionResponse.deleteMany({
      where: {
        missionId,
        guestId,
      },
    });
  }

  async countByMissionId(missionId: string) {
    return prisma.missionResponse.count({
      where: { missionId },
    });
  }

  async countCompletedByMissionId(missionId: string) {
    return prisma.missionResponse.count({
      where: {
        missionId,
        completedAt: { not: null },
      },
    });
  }
}

export const missionResponseRepository = new MissionResponseRepository();
