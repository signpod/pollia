"use server";

import { requireAuth, signOut } from "@/actions/common/auth";
import { getSupabaseSecret } from "@/database/utils/supabase/secret";
import { userWithdrawalSchema } from "@/schemas/user";
import { userService } from "@/server/services/user/userService";
import type { WithdrawUserRequest } from "@/types/dto/user";

export async function withdrawUser(input: WithdrawUserRequest) {
  const user = await requireAuth();
  const { reason } = userWithdrawalSchema.parse(input);

  const startResult = await userService.startWithdrawal(user.id, reason);

  if (startResult.status === "already_withdrawn") {
    return { message: "이미 탈퇴 처리된 계정입니다." };
  }

  const { error } = await getSupabaseSecret().auth.admin.deleteUser(user.id);

  if (error && error.status !== 404) {
    const withdrawError = new Error("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    withdrawError.cause = 500;
    throw withdrawError;
  }

  await userService.completeWithdrawal(user.id);

  try {
    await signOut();
  } catch {
    // Auth 유저가 이미 삭제되어 실패할 수 있음
  }

  return { message: "회원 탈퇴가 완료되었습니다." };
}
