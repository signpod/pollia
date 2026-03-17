"use server";

import { handleActionError } from "@/actions/common/error";
import { bannerService } from "@/server/services/banner/bannerService";
import type { GetBannersResponse } from "@/types/dto/banner";

export async function getBanners(): Promise<GetBannersResponse> {
  try {
    const banners = await bannerService.listBanners();
    return { data: banners };
  } catch (error) {
    return handleActionError(error, "배너 목록 조회 중 오류가 발생했습니다.");
  }
}
