"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { bannerService } from "@/server/services/banner/bannerService";
import type { BannerResponse, CreateBannerRequest } from "@/types/dto/banner";

export async function createBanner(request: CreateBannerRequest): Promise<BannerResponse> {
  try {
    await requireAdmin();
    const banner = await bannerService.createBanner(request);
    return { data: banner };
  } catch (error) {
    return handleActionError(error, "배너 생성 중 오류가 발생했습니다.");
  }
}
