"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { userService } from "@/server/services/user/userService";

export async function adminForceWithdraw(userId: string) {
  try {
    await requireAdmin();
    await userService.adminForceWithdraw(userId);
    return { message: "유저가 탈퇴 처리되었습니다." };
  } catch (error) {
    return handleActionError(error, "유저 탈퇴 처리 중 오류가 발생했습니다.");
  }
}
