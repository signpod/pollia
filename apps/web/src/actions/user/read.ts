"use server";

import { requireAuth } from "@/actions/common/auth";
import { userService } from "@/server/services/user/userService";
import type { GetCurrentUserResponse } from "@/types/dto/user";

/**
 * 현재 로그인한 사용자 정보 조회 Server Action
 * @returns 현재 사용자 정보
 */
export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  try {
    const user = await requireAuth();

    const dbUser = await userService.getCurrentUser(user.id);

    return { data: dbUser };
  } catch (error) {
    console.error("❌ 사용자 정보 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("사용자 정보를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
