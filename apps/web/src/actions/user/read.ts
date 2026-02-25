"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { userService } from "@/server/services/user/userService";
import type { GetCurrentUserResponse } from "@/types/dto/user";
import { cache } from "react";

/**
 * Request Memoization을 사용하여 동일한 요청 내에서 중복 호출을 방지합니다.
 * 요청 간 캐시 공유는 되지 않으므로, ISR과 함께 사용할 때는 unstable_cache를 고려하세요.
 * 비로그인·탈퇴 계정 시 401/403이면 throw하지 않고 { data: null }을 반환합니다.
 */
export const getCurrentUser = cache(async (): Promise<GetCurrentUserResponse> => {
  try {
    const user = await requireActiveUser();
    const dbUser = await userService.getUserById(user.id);
    return { data: dbUser };
  } catch (error) {
    if (error instanceof Error && (error.cause === 401 || error.cause === 403)) {
      return { data: null };
    }
    console.error("getCurrentUser error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("사용자 정보를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
});
