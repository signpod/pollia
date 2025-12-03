import prisma from "@/database/utils/prisma/client";
import type { SortOrderType } from "@/types/common/sort";
import { Prisma } from "@prisma/client";

/**
 * Mission Repository
 * Mission 도메인의 데이터 접근 계층
 */
export class MissionRepository {
  /**
   * Mission ID로 Mission 조회
   * @param missionId - Mission ID
   * @returns Mission 또는 null
   */
  async findById(missionId: string) {
    return prisma.mission.findUnique({
      where: { id: missionId },
    });
  }

  /**
   * User ID로 Mission 목록 조회
   * @param userId - User ID
   * @param options - 조회 옵션
   * @returns Mission 목록
   */
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

  /**
   * Mission ID로 Action ID 목록 조회
   * @param missionId - Mission ID
   * @returns Action ID 배열
   */
  async findActionIdsByMissionId(missionId: string) {
    const actions = await prisma.action.findMany({
      where: { missionId },
      select: { id: true },
      orderBy: { order: "asc" },
    });
    return actions.map(q => q.id);
  }

  /**
   * Action ID로 Action 상세 조회 (options 포함)
   * @param actionId - Action ID
   * @returns Action 또는 null
   */
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

  /**
   * Mission ID로 모든 Action 상세 조회 (options 포함)
   * @param missionId - Mission ID
   * @returns Action 배열
   */
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

  /**
   * Mission 생성 및 Action 연결
   * @param data - Mission 생성 데이터
   * @param actionIds - 연결할 Action ID 목록
   * @returns 생성된 Mission
   */
  async createWithActions(
    data: {
      title: string;
      description?: string;
      target?: string;
      imageUrl?: string;
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

  /**
   * Mission 수정
   * @param missionId - Mission ID
   * @param data - 수정할 데이터
   * @returns 수정된 Mission
   */
  async update(
    missionId: string,
    data: {
      title?: string;
      description?: string;
      target?: string;
      imageUrl?: string;
      deadline?: Date;
      estimatedMinutes?: number;
    },
  ) {
    return prisma.mission.update({
      where: { id: missionId },
      data,
    });
  }

  /**
   * Mission 삭제
   * @param missionId - Mission ID
   * @returns 삭제된 Mission
   */
  async delete(missionId: string) {
    return prisma.mission.delete({
      where: { id: missionId },
    });
  }
}

export const missionRepository = new MissionRepository();
