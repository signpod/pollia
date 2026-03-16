"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { bannerService } from "@/server/services/banner/bannerService";

export async function deleteBanner(id: string) {
  try {
    await requireAdmin();
    await bannerService.deleteBanner(id);
    return { message: "배너가 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "배너 삭제 중 오류가 발생했습니다.");
  }
}
