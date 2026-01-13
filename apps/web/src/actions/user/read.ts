"use server";

import { requireAuth } from "@/actions/common/auth";
import { userService } from "@/server/services/user/userService";
import type { GetCurrentUserResponse } from "@/types/dto/user";
import { cache } from "react";

export const getCurrentUser = cache(async (): Promise<GetCurrentUserResponse> => {
  try {
    const user = await requireAuth();
    const dbUser = await userService.getUserById(user.id);
    return { data: dbUser };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("사용자 정보를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
});
