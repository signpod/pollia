import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { SortOrderType } from "@/types/common/sort";
import { type ActionType, type MissionCategory, type MissionType, Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

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
      category?: MissionCategory;
    },
  ) {
    const limit = options?.limit ?? 10;
    const sortOrder = options?.sortOrder ?? "latest";

    return prisma.mission.findMany({
      where: {
        creatorId: userId,
        ...(options?.category && { category: options.category }),
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

  async findAll(options?: {
    cursor?: string;
    limit?: number;
    sortOrder?: SortOrderType;
    category?: MissionCategory;
    type?: MissionType;
  }) {
    const limit = options?.limit ?? 10;
    const sortOrder = options?.sortOrder ?? "latest";

    return prisma.mission.findMany({
      where: {
        ...(options?.category && { category: options.category }),
        ...(options?.type && { type: options.type }),
      },
      orderBy: {
        createdAt: sortOrder === "latest" ? "desc" : "asc",
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

  async createWithActions(
    data: Prisma.MissionUncheckedCreateInput,
    actionIds: string[],
    client: TransactionClient = prisma,
  ) {
    const createdMission = await client.mission.create({
      data,
    });

    if (actionIds.length > 0) {
      const whenClauses = actionIds.map((id, index) => Prisma.sql`WHEN ${id} THEN ${index}`);

      await client.$executeRaw`
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

    await confirmFileUploads(client, data.creatorId, fileUploadIds);

    return createdMission;
  }

  async updateLikesCount(missionId: string, delta: number, client: TransactionClient = prisma) {
    return client.mission.update({
      where: { id: missionId },
      data: { likesCount: { increment: delta } },
    });
  }

  async incrementViewCount(missionId: string, client: TransactionClient = prisma) {
    return client.mission.update({
      where: { id: missionId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async update(
    missionId: string,
    data: Prisma.MissionUncheckedUpdateInput,
    userId?: string,
    client: TransactionClient = prisma,
  ) {
    const fileUploadIds = [
      typeof data.imageFileUploadId === "string" ? data.imageFileUploadId : undefined,
      typeof data.brandLogoFileUploadId === "string" ? data.brandLogoFileUploadId : undefined,
    ].filter(Boolean) as string[];

    const updatedMission = await client.mission.update({
      where: { id: missionId },
      data,
    });

    if (fileUploadIds.length > 0 && userId) {
      await confirmFileUploads(client, userId, fileUploadIds);
    }

    return updatedMission;
  }

  async delete(missionId: string, client: TransactionClient = prisma) {
    return client.mission.delete({
      where: { id: missionId },
    });
  }

  async duplicateMission(
    missionData: {
      title: string;
      choseong?: string;
      description?: string | null;
      target?: string | null;
      imageUrl?: string | null;
      brandLogoUrl?: string | null;
      deadline?: Date | null;
      estimatedMinutes?: number | null;
      isActive: boolean;
      type: MissionType;
      creatorId: string;
      entryActionId?: string | null;
    },
    actionsData: Array<{
      title: string;
      description?: string | null;
      imageUrl?: string | null;
      type: ActionType;
      order: number | null;
      maxSelections?: number | null;
      nextActionId?: string | null;
      nextCompletionId?: string | null;
      options: Array<{
        title: string;
        description?: string | null;
        imageUrl?: string | null;
        order: number;
        nextActionId?: string | null;
        nextCompletionId?: string | null;
      }>;
    }>,
    client: TransactionClient = prisma,
  ) {
    const newMission = await client.mission.create({
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
        entryActionId: missionData.entryActionId,
      },
    });

    for (const actionData of actionsData) {
      const newAction = await client.action.create({
        data: {
          missionId: newMission.id,
          title: actionData.title,
          description: actionData.description,
          imageUrl: actionData.imageUrl,
          type: actionData.type,
          order: actionData.order,
          maxSelections: actionData.maxSelections,
          nextActionId: actionData.nextActionId,
          nextCompletionId: actionData.nextCompletionId,
        },
      });

      if (actionData.options.length > 0) {
        await client.actionOption.createMany({
          data: actionData.options.map(opt => ({
            actionId: newAction.id,
            title: opt.title,
            description: opt.description,
            imageUrl: opt.imageUrl,
            order: opt.order,
            nextActionId: opt.nextActionId,
            nextCompletionId: opt.nextCompletionId,
          })),
        });
      }
    }

    return newMission;
  }
}

export const missionRepository = new MissionRepository();
