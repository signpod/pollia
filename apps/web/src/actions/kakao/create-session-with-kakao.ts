"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import type { CreateSessionWithKakaoRequest } from "@/types/external/kakao";
import type { User } from "@supabase/supabase-js";

/**
 * 카카오 ID Token으로 Supabase 세션 생성
 *
 * @param request - ID Token
 * @returns Supabase User 객체
 * @throws Supabase 세션 생성 실패 시 에러
 */
export async function createSessionWithKakao(
  request: CreateSessionWithKakaoRequest,
): Promise<User> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: request.idToken,
  });

  if (error) {
    throw new Error(`Supabase 세션 생성 실패: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("사용자 정보를 가져올 수 없습니다.");
  }

  return data.user;
}
