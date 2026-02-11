import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { Prisma } from "@prisma/client";

export class UserRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  async update(userId: string, data: Prisma.UserUncheckedUpdateInput) {
    const fileUploadId =
      typeof data.profileImageFileUploadId === "string" ? data.profileImageFileUploadId : undefined;

    if (fileUploadId) {
      return prisma.$transaction(async tx => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data,
        });

        await confirmFileUploads(tx, userId, fileUploadId);
        return updatedUser;
      });
    }

    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async delete(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const userRepository = new UserRepository();
