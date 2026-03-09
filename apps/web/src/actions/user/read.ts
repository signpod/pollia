"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { userService } from "@/server/services/user/userService";
import type { GetCurrentUserResponse } from "@/types/dto/user";
import { cache } from "react";

/**
 * Request Memoization을 사용하여 동일한 요청 내에서 중복 호출을 방지합니다.
 * 요청 간 캐시 공유는 되지 않으므로, ISR과 함께 사용할 때는 unstable_cache를 고려하세요.
 */
export const getCurrentUser = cache(async (): Promise<GetCurrentUserResponse> => {
  try {
    const user = await requireActiveUser();
    const dbUser = await userService.getUserById(user.id);
    return { data: dbUser };
  } catch (error) {
    return handleActionError(error, "사용자 정보를 불러올 수 없습니다.");
  }
});
