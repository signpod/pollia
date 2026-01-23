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

  async createWithActions(data: Prisma.MissionUncheckedCreateInput, actionIds: string[]) {
    return prisma.$transaction(async tx => {
      const createdMission = await tx.mission.create({
        data,
      });

      if (actionIds.length > 0) {
        const whenClauses = actionIds.map((id, index) => Prisma.sql`WHEN ${id} THEN ${index}`);

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
