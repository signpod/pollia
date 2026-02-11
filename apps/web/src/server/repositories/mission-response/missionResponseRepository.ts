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
    return prisma.missionResponse.findUnique({
      where: {
        missionId_userId: {
          missionId,
          userId,
        },
      },
      include: {
        answers: ANSWERS_WITH_RELATIONS,
      },
    });
  }

  async findByMissionId(missionId: string) {
    return prisma.missionResponse.findMany({
      where: { missionId },
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

  async create(data: { missionId: string; userId: string }) {
    return prisma.missionResponse.create({
      data: {
        missionId: data.missionId,
        userId: data.userId,
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
