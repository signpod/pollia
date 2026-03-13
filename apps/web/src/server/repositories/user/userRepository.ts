import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import { type Prisma, UserStatus } from "@prisma/client";

export class UserRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { profileImageFileUpload: { select: { publicUrl: true } } },
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

  async startWithdrawal(userId: string, reason?: string) {
    return prisma.user.update({
      where: { id: userId, status: UserStatus.ACTIVE },
      data: {
        status: UserStatus.WITHDRAWING,
        withdrawalReason: reason ?? null,
      },
    });
  }

  async completeWithdrawal(userId: string) {
    return prisma.user.update({
      where: { id: userId, status: UserStatus.WITHDRAWING },
      data: {
        status: UserStatus.WITHDRAWN,
        email: `withdrawn+${userId}@withdrawn.local`,
        name: "탈퇴한 사용자",
        phone: null,
        profileImageFileUploadId: null,
        withdrawnAt: new Date(),
        authDeletedAt: new Date(),
      },
    });
  }
}

export const userRepository = new UserRepository();
