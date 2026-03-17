import prisma from "@/database/utils/prisma/client";
import { bannerRepository } from "@/server/repositories/banner/bannerRepository";
import { confirmFileUploads } from "@/server/repositories/common/confirmFileUploads";
import type { CreateBannerInput, UpdateBannerInput } from "./types";

export class BannerService {
  constructor(private repo = bannerRepository) {}

  async getBanner(id: string) {
    const banner = await this.repo.findById(id);

    if (!banner) {
      const error = new Error("배너를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return banner;
  }

  async listBanners() {
    return this.repo.findAll();
  }

  async createBanner(input: CreateBannerInput) {
    if (!input.imageUrl?.trim()) {
      const error = new Error("배너 이미지 URL은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    const maxOrder = await this.repo.getMaxOrder();

    const data = {
      title: input.title?.trim() ?? "",
      subtitle: input.subtitle?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      linkUrl: input.linkUrl?.trim() || null,
      imageFileUploadId: input.imageFileUploadId ?? null,
      order: maxOrder + 1,
    };

    return prisma.$transaction(async tx => {
      const banner = await this.repo.create(data, tx);
      if (data.imageFileUploadId) {
        await confirmFileUploads(tx, undefined, data.imageFileUploadId);
      }
      return banner;
    });
  }

  async updateBanner(id: string, input: UpdateBannerInput) {
    await this.getBanner(id);

    const fileUploadId =
      typeof input.imageFileUploadId === "string" ? input.imageFileUploadId : undefined;

    if (fileUploadId) {
      return prisma.$transaction(async tx => {
        const banner = await this.repo.update(id, input, tx);
        await confirmFileUploads(tx, undefined, fileUploadId);
        return banner;
      });
    }

    return this.repo.update(id, input);
  }

  async deleteBanner(id: string) {
    await this.getBanner(id);
    return this.repo.delete(id);
  }

  async reorderBanners(orders: Array<{ id: string; order: number }>) {
    if (orders.length === 0) {
      const error = new Error("순서 변경할 배너가 없습니다.");
      error.cause = 400;
      throw error;
    }

    return this.repo.updateManyOrders(orders);
  }
}

export const bannerService = new BannerService();
