import prisma from "@/database/utils/prisma/client";
import type { SortOrderType } from "@/types/common/sort";
import { Prisma } from "@prisma/client";

export class MissionRepository {
  async findById(missionId: string) {
    return prisma.mission.findUnique({
      where: { id: missionId },
    });
  }

  async findByUserId(
    userId: string,
    options?: {
      cursor?: string;
      limit?: number;
      sortOrder?: SortOrderType;
    },
  ) {
    const limit = options?.limit ?? 10;

    return prisma.mission.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        target: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: options?.sortOrder === "latest" ? "desc" : "asc",
      },
      take: limit + 1,
      ...(options?.cursor && {
        cursor: {
          id: options.cursor,
        },
        skip: 1,
      }),
    });
  }

  async findActionIdsByMissionId(missionId: string) {
    const actions = await prisma.action.findMany({
      where: { missionId },
      select: { id: true },
      orderBy: { order: "asc" },
    });
    return actions.map(q => q.id);
  }

  async findActionById(actionId: string) {
    return prisma.action.findUnique({
      where: { id: actionId },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        type: true,
        order: true,
        maxSelections: true,
        missionId: true,
        options: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findActionsByMissionId(missionId: string) {
    return prisma.action.findMany({
      where: { missionId },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        type: true,
        order: true,
        maxSelections: true,
        missionId: true,
        options: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  async createWithActions(
    data: {
      title: string;
      description?: string;
      target?: string;
      imageUrl?: string;
      brandLogoUrl?: string;
      deadline?: Date;
      estimatedMinutes?: number;
      creatorId: string;
    },
    actionIds: string[],
  ) {
    return prisma.$transaction(async tx => {
      const createdMission = await tx.mission.create({
        data: {
          title: data.title,
          description: data.description,
          target: data.target,
          imageUrl: data.imageUrl,
          brandLogoUrl: data.brandLogoUrl,
          deadline: data.deadline,
          estimatedMinutes: data.estimatedMinutes,
          creatorId: data.creatorId,
        },
      });

      if (actionIds.length > 0) {
        const whenClauses = actionIds.map((id, index) => Prisma.sql`WHEN ${id} THEN ${index + 1}`);

        await tx.$executeRaw`
          UPDATE "actions"
          SET "mission_id" = ${createdMission.id},
              "order" = CASE "id" ${Prisma.join(whenClauses, " ")} END
          WHERE "id" IN (${Prisma.join(
            actionIds.map(id => Prisma.sql`${id}`),
            ",",
          )})
        `;
      }

      return createdMission;
    });
  }

  async update(
    missionId: string,
    data: {
      title?: string;
      description?: string;
      target?: string;
      imageUrl?: string;
      brandLogoUrl?: string;
      deadline?: Date;
      estimatedMinutes?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.mission.update({
      where: { id: missionId },
      data,
    });
  }

  async delete(missionId: string) {
    return prisma.mission.delete({
      where: { id: missionId },
    });
  }
}

export const missionRepository = new MissionRepository();
