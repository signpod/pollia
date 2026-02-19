"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { userService } from "@/server/services/user/userService";

export async function deleteUser() {
  try {
    const user = await requireActiveUser();
    await userService.deleteUser(user.id);
    return { message: "사용자가 삭제되었습니다." };
  } catch (error) {
    console.error("deleteUser error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("사용자 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
