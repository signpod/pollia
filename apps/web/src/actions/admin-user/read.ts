"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { userService } from "@/server/services/user/userService";
import type { GetAdminUsersRequest, GetAdminUsersResponse } from "@/types/dto/admin-user";

export async function getAdminUsers(
  request?: GetAdminUsersRequest,
): Promise<GetAdminUsersResponse> {
  try {
    await requireAdmin();
    const result = await userService.listUsers(request);
    return { data: result.users, total: result.total };
  } catch (error) {
    return handleActionError(error, "유저 목록 조회 중 오류가 발생했습니다.");
  }
}
