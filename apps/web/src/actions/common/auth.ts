import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { userService } from "@/server/services/user/userService";
import { type GetCurrentUserResponse, UserRole } from "@/types/dto/user";
import type { User } from "@supabase/supabase-js";

/**
 * Server Action에서 인증된 사용자를 가져옵니다.
 * 인증되지 않은 경우 401 에러를 throw합니다.
 *
 * @throws {Error} 로그인이 필요한 경우 (error.cause = 401)
 * @returns {Promise<User>} 인증된 사용자 객체
 *
 * @example
 * ```typescript
 * export async function myServerAction() {
 *   try {
 *     const user = await requireAuth();
 *     // user.id 사용 가능
 *   } catch (error) {
 *     if (error instanceof Error && error.cause === 401) {
 *       // 인증 에러 처리
 *     }
 *   }
 * }
 * ```
 */
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

/**
 * Server Action에서 관리자 권한을 확인합니다.
 * 인증되지 않은 경우 401 에러, 관리자가 아닌 경우 403 에러를 throw합니다.
 *
 * @throws {Error} 로그인이 필요한 경우 (error.cause = 401)
 * @throws {Error} 관리자 권한이 필요한 경우 (error.cause = 403)
 * @returns {Promise<{ supabaseUser: User; dbUser: GetCurrentUserResponse["data"] }>} Supabase 사용자와 DB 사용자 정보
 *
 * @example
 * ```typescript
 * export async function deleteUser(userId: string) {
 *   try {
 *     const { dbUser } = await requireAdmin();
 *     // 관리자만 실행 가능한 로직
 *     await userService.deleteUser(userId);
 *   } catch (error) {
 *     if (error instanceof Error && error.cause === 403) {
 *       // 권한 에러 처리
 *     }
 *   }
 * }
 * ```
 */
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
