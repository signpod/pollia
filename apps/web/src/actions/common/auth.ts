import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { userService } from "@/server/services/user/userService";
import { type GetCurrentUserResponse, UserRole } from "@/types/dto/user";
import type { User } from "@supabase/supabase-js";

export async function requireAuth(): Promise<User> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    const error = new Error("로그인이 필요합니다.");
    error.cause = 401;
    throw error;
  }

  return user;
}

export async function requireAdmin(): Promise<{
  supabaseUser: User;
  dbUser: GetCurrentUserResponse["data"];
}> {
  const supabaseUser = await requireAuth();

  try {
    const dbUser = await userService.getUserById(supabaseUser.id);

    if (dbUser.role !== UserRole.ADMIN) {
      const error = new Error("관리자 권한이 필요합니다.");
      error.cause = 403;
      throw error;
    }

    return { supabaseUser, dbUser };
  } catch (error) {
    if (error instanceof Error && error.cause === 404) {
      const authError = new Error("사용자 정보를 찾을 수 없습니다.");
      authError.cause = 401;
      throw authError;
    }

    if (error instanceof Error && error.cause === 403) {
      throw error;
    }

    const serverError = new Error("권한 확인 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
