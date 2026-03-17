import prisma from "@/database/utils/prisma/client";
import type { Prisma, PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class BannerRepository {
  async findById(id: string, client: TransactionClient = prisma) {
    return client.banner.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.banner.findMany({ orderBy: { order: "asc" } });
  }

  async create(data: Prisma.BannerUncheckedCreateInput, client: TransactionClient = prisma) {
    return client.banner.create({ data });
  }

  async update(
    id: string,
    data: Prisma.BannerUncheckedUpdateInput,
    client: TransactionClient = prisma,
  ) {
    return client.banner.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.banner.delete({ where: { id } });
  }

  async updateManyOrders(orders: Array<{ id: string; order: number }>) {
    return prisma.$transaction(
      orders.map(({ id, order }) => prisma.banner.update({ where: { id }, data: { order } })),
    );
  }

  async getMaxOrder() {
    const result = await prisma.banner.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return result?.order ?? -1;
  }
}

export const bannerRepository = new BannerRepository();
