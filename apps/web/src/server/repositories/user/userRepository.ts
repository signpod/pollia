import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { SortOrderType } from "@/types/common/sort";
import { type Prisma, UserStatus } from "@prisma/client";

export class UserRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { profileImageFileUpload: { select: { publicUrl: true } } },
    });
  }

  async findMany(options?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortOrder?: SortOrderType;
    status?: UserStatus;
  }) {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const where = this.buildWhere(options?.search, options?.status);

    return prisma.user.findMany({
      where,
      orderBy: { createdAt: options?.sortOrder === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async count(options?: { search?: string; status?: UserStatus }) {
    const where = this.buildWhere(options?.search, options?.status);
    return prisma.user.count({ where });
  }

  private buildWhere(search?: string, status?: UserStatus): Prisma.UserWhereInput {
    const conditions: Prisma.UserWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      });
    }

    if (status) {
      conditions.push({ status });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
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

  async forceWithdrawal(userId: string) {
    return prisma.user.update({
      where: { id: userId },
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
