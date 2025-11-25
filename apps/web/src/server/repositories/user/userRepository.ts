import prisma from "@/database/utils/prisma/client";

export class UserRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findFirst(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId },
    });
  }

  async create(data: { id: string; email: string; name: string }) {
    return prisma.user.create({
      data,
    });
  }

  async update(userId: string, data: { name?: string }) {
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
