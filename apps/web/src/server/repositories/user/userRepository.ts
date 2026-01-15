import prisma from "@/database/utils/prisma/client";
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

  async update(userId: string, data: Prisma.UserUpdateInput) {
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
