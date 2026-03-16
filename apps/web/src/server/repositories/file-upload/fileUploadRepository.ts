import prisma from "@/database/utils/prisma/client";
import { FileStatus } from "@prisma/client";

export class FileUploadRepository {
  async findById(id: string) {
    return prisma.fileUpload.findUnique({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.fileUpload.findFirst({
      where: { id, userId },
    });
  }

  async findByFilePathAndUserId(filePath: string, userId: string) {
    return prisma.fileUpload.findFirst({
      where: { filePath, userId },
    });
  }

  async findTemporaryByIdAndUserId(id: string, userId: string) {
    return prisma.fileUpload.findFirst({
      where: {
        id,
        userId,
        status: FileStatus.TEMPORARY,
      },
    });
  }

  async findTemporaryOlderThan(cutoffTime: Date) {
    return prisma.fileUpload.findMany({
      where: {
        status: FileStatus.TEMPORARY,
        createdAt: { lte: cutoffTime },
      },
    });
  }

  async findUnreferencedOlderThan(cutoffTime: Date) {
    return prisma.fileUpload.findMany({
      where: {
        createdAt: { lte: cutoffTime },
        actionOptions: { none: {} },
        missionImages: { none: {} },
        missionBrandLogos: { none: {} },
        actionImages: { none: {} },
        actionAnswerId: null,
        bannerImage: null,
      },
    });
  }

  async create(data: {
    userId: string;
    originalFileName: string;
    filePath: string;
    publicUrl: string;
    fileSize: number;
    mimeType: string;
    bucket: string;
    status: FileStatus;
  }) {
    return prisma.fileUpload.create({ data });
  }

  async updateStatus(id: string, status: FileStatus, confirmedAt?: Date) {
    return prisma.fileUpload.update({
      where: { id },
      data: {
        status,
        ...(confirmedAt && { confirmedAt }),
      },
    });
  }

  async delete(id: string) {
    return prisma.fileUpload.delete({
      where: { id },
    });
  }
}

export const fileUploadRepository = new FileUploadRepository();
