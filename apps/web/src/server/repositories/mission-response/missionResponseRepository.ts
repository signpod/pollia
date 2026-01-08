import prisma from "@/database/utils/prisma/client";

export class MissionResponseRepository {
  async findById(id: string) {
    return prisma.missionResponse.findUnique({
      where: { id },
      include: {
        mission: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            action: true,
            options: true,
            fileUploads: true,
          },
        },
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
        answers: {
          include: {
            action: true,
            options: true,
            fileUploads: true,
          },
        },
      },
    });
  }

  async findByMissionId(missionId: string) {
    return prisma.missionResponse.findMany({
      where: { missionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            action: true,
            options: true,
            fileUploads: true,
          },
        },
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
            imageUrl: true,
          },
        },
        answers: true,
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
        user: {
          select: {
            id: true,
            name: true,
          },
        },
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
        mission: {
          select: {
            id: true,
            title: true,
          },
        },
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
