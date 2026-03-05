"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { userUpdateSchema } from "@/schemas/user";
import { userService } from "@/server/services/user/userService";
import type { UpdateUserRequest } from "@/types/dto/user";

export async function updateUser(request: UpdateUserRequest) {
  try {
    const user = await requireActiveUser();

    const validated = userUpdateSchema.parse(request);

    const updatedUser = await userService.updateUser(user.id, validated);
    return { data: updatedUser };
  } catch (error) {
    console.error("updateUser error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("사용자 정보 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
