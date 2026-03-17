"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { bannerService } from "@/server/services/banner/bannerService";
import type {
  BannerResponse,
  ReorderBannersRequest,
  UpdateBannerRequest,
} from "@/types/dto/banner";

export async function updateBanner(
  id: string,
  request: UpdateBannerRequest,
): Promise<BannerResponse> {
  try {
    await requireAdmin();
    const banner = await bannerService.updateBanner(id, request);
    return { data: banner };
  } catch (error) {
    return handleActionError(error, "배너 수정 중 오류가 발생했습니다.");
  }
}

export async function reorderBanners(request: ReorderBannersRequest) {
  try {
    await requireAdmin();
    await bannerService.reorderBanners(request.orders);
    return { message: "배너 순서가 변경되었습니다." };
  } catch (error) {
    return handleActionError(error, "배너 순서 변경 중 오류가 발생했습니다.");
  }
}
