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

  async findByMissionIdPaged(
    missionId: string,
    options: { page: number; pageSize: number; membersOnly?: boolean },
  ) {
    const skip = (options.page - 1) * options.pageSize;

    return prisma.missionResponse.findMany({
      where: {
        missionId,
        ...(options.membersOnly && { userId: { not: null } }),
      },
      include: {
        user: true,
        answers: ANSWERS_WITH_RELATIONS,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: options.pageSize,
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

  async completeWithSelectionAndAbuseMeta(
    id: string,
    input: {
      missionId: string;
      selectedCompletionId: string;
      completedAt: Date;
      ipAddress?: string | null;
      userAgent?: string | null;
      submissionIntervalSeconds?: number | null;
    },
  ) {
    return prisma.$transaction(async tx => {
      const updated = await tx.missionResponse.updateMany({
        where: {
          id,
          completedAt: null,
        },
        data: {
          selectedCompletionId: input.selectedCompletionId,
          completedAt: input.completedAt,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          submissionIntervalSeconds: input.submissionIntervalSeconds ?? null,
        },
      });

      if (updated.count === 0) {
        return null;
      }

      await tx.missionCompletionStat.upsert({
        where: {
          missionId_missionCompletionId: {
            missionId: input.missionId,
            missionCompletionId: input.selectedCompletionId,
          },
        },
        create: {
          missionId: input.missionId,
          missionCompletionId: input.selectedCompletionId,
          encounterCount: 1,
        },
        update: {
          encounterCount: {
            increment: 1,
          },
        },
      });

      return tx.missionResponse.findUnique({
        where: { id },
      });
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

  async countByMissionIdFiltered(missionId: string, options?: { membersOnly?: boolean }) {
    return prisma.missionResponse.count({
      where: {
        missionId,
        ...(options?.membersOnly && { userId: { not: null } }),
      },
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

  async countCompletedByMissionIdWithDateRange(
    missionId: string,
    dateRange?: { from: Date; to: Date },
  ) {
    return prisma.missionResponse.count({
      where: {
        missionId,
        completedAt: { not: null },
        ...(dateRange && {
          completedAt: { not: null, gte: dateRange.from, lte: dateRange.to },
        }),
      },
    });
  }

  async getAverageDurationMs(
    missionId: string,
    dateRange?: { from: Date; to: Date },
  ): Promise<number | null> {
    const dateFilter = dateRange ? `AND "completed_at" >= $2 AND "completed_at" <= $3` : "";

    const params: (string | Date)[] = [missionId];
    if (dateRange) {
      params.push(dateRange.from, dateRange.to);
    }

    const result = await prisma.$queryRawUnsafe<Array<{ avg_ms: number | null }>>(
      `SELECT AVG(EXTRACT(EPOCH FROM ("completed_at" - "started_at")) * 1000) as avg_ms
       FROM "mission_responses"
       WHERE "mission_id" = $1
         AND "completed_at" IS NOT NULL
         ${dateFilter}`,
      ...params,
    );

    const avgMs = result[0]?.avg_ms;
    return avgMs !== null && avgMs !== undefined ? Math.round(avgMs) : null;
  }

  async groupByStartedAtDate(
    missionId: string,
    dateRange?: { from: Date; to: Date },
  ): Promise<Array<{ date: string; count: number }>> {
    const dateFilter = dateRange ? `AND "started_at" >= $2 AND "started_at" <= $3` : "";

    const params: (string | Date)[] = [missionId];
    if (dateRange) {
      params.push(dateRange.from, dateRange.to);
    }

    const result = await prisma.$queryRawUnsafe<Array<{ date: string; count: bigint }>>(
      `SELECT DATE("started_at") as date, COUNT(*) as count
       FROM "mission_responses"
       WHERE "mission_id" = $1
         ${dateFilter}
       GROUP BY DATE("started_at")
       ORDER BY date ASC`,
      ...params,
    );

    return result.map(row => ({
      date: String(row.date),
      count: Number(row.count),
    }));
  }
}

export const missionResponseRepository = new MissionResponseRepository();
