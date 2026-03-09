"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { userService } from "@/server/services/user/userService";

export async function deleteUser() {
  try {
    const user = await requireActiveUser();
    await userService.deleteUser(user.id);
    return { message: "사용자가 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "사용자 삭제 중 오류가 발생했습니다.");
  }
}
