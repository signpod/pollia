import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { SortOrderType } from "@/types/common/sort";
import { type ActionType, type MissionType, Prisma } from "@prisma/client";

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
    const sortOrder = options?.sortOrder ?? "latest";

    return prisma.mission.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        target: true,
        imageUrl: true,
        isActive: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: sortOrder === "latest" ? "desc" : "asc",
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
      imageFileUploadId?: string;
      brandLogoUrl?: string;
      brandLogoFileUploadId?: string;
      deadline?: Date;
      estimatedMinutes?: number;
      type: MissionType;
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
          imageFileUploadId: data.imageFileUploadId,
          brandLogoUrl: data.brandLogoUrl,
          brandLogoFileUploadId: data.brandLogoFileUploadId,
          deadline: data.deadline,
          estimatedMinutes: data.estimatedMinutes,
          type: data.type,
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

      const fileUploadIds = [data.imageFileUploadId, data.brandLogoFileUploadId].filter(
        Boolean,
      ) as string[];

      await confirmFileUploads(tx, data.creatorId, fileUploadIds);

      return createdMission;
    });
  }

  async update(missionId: string, data: Prisma.MissionUncheckedUpdateInput, userId?: string) {
    const fileUploadIds = [
      typeof data.imageFileUploadId === "string" ? data.imageFileUploadId : undefined,
      typeof data.brandLogoFileUploadId === "string" ? data.brandLogoFileUploadId : undefined,
    ].filter(Boolean) as string[];

    if (fileUploadIds.length > 0 && userId) {
      return prisma.$transaction(async tx => {
        const updatedMission = await tx.mission.update({
          where: { id: missionId },
          data,
        });

        await confirmFileUploads(tx, userId, fileUploadIds);

        return updatedMission;
      });
    }

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

  async updatePassword(missionId: string, password: string | null) {
    return prisma.mission.update({
      where: { id: missionId },
      data: { password },
    });
  }

  async duplicateMission(
    missionData: {
      title: string;
      description?: string | null;
      target?: string | null;
      imageUrl?: string | null;
      brandLogoUrl?: string | null;
      deadline?: Date | null;
      estimatedMinutes?: number | null;
      isActive: boolean;
      type: MissionType;
      creatorId: string;
    },
    actionsData: Array<{
      title: string;
      description?: string | null;
      imageUrl?: string | null;
      type: ActionType;
      order: number;
      maxSelections?: number | null;
      options: Array<{
        title: string;
        description?: string | null;
        imageUrl?: string | null;
        order: number;
      }>;
    }>,
  ) {
    return prisma.$transaction(async tx => {
      const newMission = await tx.mission.create({
        data: {
          title: missionData.title,
          description: missionData.description,
          target: missionData.target,
          imageUrl: missionData.imageUrl,
          brandLogoUrl: missionData.brandLogoUrl,
          deadline: missionData.deadline,
          estimatedMinutes: missionData.estimatedMinutes,
          isActive: missionData.isActive,
          type: missionData.type,
          creatorId: missionData.creatorId,
        },
      });

      for (const actionData of actionsData) {
        const newAction = await tx.action.create({
          data: {
            missionId: newMission.id,
            title: actionData.title,
            description: actionData.description,
            imageUrl: actionData.imageUrl,
            type: actionData.type,
            order: actionData.order,
            maxSelections: actionData.maxSelections,
          },
        });

        if (actionData.options.length > 0) {
          await tx.actionOption.createMany({
            data: actionData.options.map(opt => ({
              actionId: newAction.id,
              title: opt.title,
              description: opt.description,
              imageUrl: opt.imageUrl,
              order: opt.order,
            })),
          });
        }
      }

      return newMission;
    });
  }
}

export const missionRepository = new MissionRepository();
