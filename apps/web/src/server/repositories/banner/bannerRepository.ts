import prisma from "@/database/utils/prisma/client";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { Prisma } from "@prisma/client";

export class BannerRepository {
  async findById(id: string) {
    return prisma.banner.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.banner.findMany({ orderBy: { order: "asc" } });
  }

  async create(data: Prisma.BannerUncheckedCreateInput) {
    return prisma.$transaction(async tx => {
      const banner = await tx.banner.create({ data });
      if (data.imageFileUploadId) {
        await confirmFileUploads(tx, undefined, data.imageFileUploadId as string);
      }
      return banner;
    });
  }

  async update(id: string, data: Prisma.BannerUncheckedUpdateInput) {
    return prisma.$transaction(async tx => {
      const banner = await tx.banner.update({ where: { id }, data });
      if (data.imageFileUploadId && typeof data.imageFileUploadId === "string") {
        await confirmFileUploads(tx, undefined, data.imageFileUploadId);
      }
      return banner;
    });
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
