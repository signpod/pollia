import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { userService } from "@/server/services/user/userService";
import { UserStatus } from "@prisma/client";
import type { User } from "@supabase/supabase-js";

export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  try {
    const dbUser = await userService.getUserById(user.id);
    const isActiveUser = dbUser.status === UserStatus.ACTIVE;

    return {
      isAuthenticated: isActiveUser,
      user: isActiveUser ? user : null,
    };
  } catch (error) {
    if (error instanceof Error && error.cause === 404) {
      throw error;
    }

    console.error("[checkAuthStatus] 사용자 인증 상태 확인 실패:", error);
    const serverError = new Error("인증 상태 확인 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
