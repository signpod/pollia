import { bannerRepository } from "@/server/repositories/banner/bannerRepository";
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
    if (!input.title?.trim()) {
      const error = new Error("배너 제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (!input.imageUrl?.trim()) {
      const error = new Error("배너 이미지 URL은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    const maxOrder = await this.repo.getMaxOrder();

    return this.repo.create({
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      imageFileUploadId: input.imageFileUploadId ?? null,
      order: maxOrder + 1,
    });
  }

  async updateBanner(id: string, input: UpdateBannerInput) {
    await this.getBanner(id);
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
