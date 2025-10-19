import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
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
 *     // 401 에러 처리
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
 * Server Action에서 인증된 사용자를 가져옵니다.
 * 인증되지 않은 경우 null을 반환합니다.
 *
 * Response 패턴 ({ success, error, data })을 사용하는 함수에서 사용하세요.
 *
 * @returns {Promise<User | null>} 인증된 사용자 객체 또는 null
 *
 * @example
 * ```typescript
 * export async function myServerAction() {
 *   const user = await getAuthUserOrNull();
 *
 *   if (!user) {
 *     return {
 *       success: false,
 *       error: "로그인이 필요합니다.",
 *     };
 *   }
 *
 *   return {
 *     success: true,
 *     data: { ... },
 *   };
 * }
 * ```
 */
export async function getAuthUserOrNull(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
