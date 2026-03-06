import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import { Prisma } from "@prisma/client";

export class MissionCompletionRepository {
  async findById(id: string) {
    return prisma.missionCompletion.findUnique({
      where: { id },
      include: {
        imageFileUpload: {
          select: {
            id: true,
            publicUrl: true,
          },
        },
        mission: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
    });
  }

  //TODO: "다중미션완료" 서비스로 마이그레이션 이후 삭제
  async findByMissionId(missionId: string) {
    return prisma.missionCompletion.findFirst({
      where: { missionId },
      include: {
        imageFileUpload: {
          select: {
            id: true,
            publicUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findAllByMissionId(missionId: string) {
    return prisma.missionCompletion.findMany({
      where: { missionId },
      include: {
        imageFileUpload: {
          select: {
            id: true,
            publicUrl: true,
          },
        },
        mission: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(
    data: Prisma.MissionCompletionUncheckedCreateInput,
    userId?: string,
    client?: Prisma.TransactionClient,
  ) {
    const imageFileUploadId =
      typeof data.imageFileUploadId === "string" ? data.imageFileUploadId : undefined;

    const execute = async (tx: Prisma.TransactionClient) => {
      const missionCompletion = await tx.missionCompletion.create({
        data,
        include: {
          imageFileUpload: {
            select: {
              id: true,
              publicUrl: true,
            },
          },
        },
      });

      if (imageFileUploadId && userId) {
        await confirmFileUploads(tx, userId, imageFileUploadId);
      }

      return missionCompletion;
    };

    if (client) {
      return execute(client);
    }

    if (imageFileUploadId && userId) {
      return prisma.$transaction(execute);
    }

    return prisma.missionCompletion.create({
      data,
      include: {
        imageFileUpload: {
          select: {
            id: true,
            publicUrl: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.MissionCompletionUncheckedUpdateInput, userId?: string) {
    const imageFileUploadId =
      typeof data.imageFileUploadId === "string" ? data.imageFileUploadId : undefined;

    if (imageFileUploadId && userId) {
      return prisma.$transaction(async tx => {
        const missionCompletion = await tx.missionCompletion.update({
          where: { id },
          data,
          include: {
            imageFileUpload: {
              select: {
                id: true,
                publicUrl: true,
              },
            },
            mission: {
              select: {
                id: true,
                creatorId: true,
              },
            },
          },
        });

        await confirmFileUploads(tx, userId, imageFileUploadId);

        return missionCompletion;
      });
    }

    return prisma.missionCompletion.update({
      where: { id },
      data,
      include: {
        imageFileUpload: {
          select: {
            id: true,
            publicUrl: true,
          },
        },
        mission: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.missionCompletion.delete({
      where: { id },
    });
  }
}

export const missionCompletionRepository = new MissionCompletionRepository();
