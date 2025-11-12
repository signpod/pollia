"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import type { CreateSessionWithKakaoRequest } from "@/types/external/kakao";
import type { User } from "@supabase/supabase-js";

/**
 * 카카오 ID Token으로 Supabase 세션 생성 및 사용자 메타데이터 설정
 *
 * @param request - ID Token과 사용자 이름
 * @returns Supabase User 객체
 * @throws Supabase 세션 생성 실패 시 에러
 */
export async function createSessionWithKakao(
  request: CreateSessionWithKakaoRequest & { userName?: string },
): Promise<User> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "kakao",
      token: request.idToken,
    });

    if (error) {
      const serverError = new Error(`Supabase 세션 생성 실패: ${error.message}`);
      serverError.cause = 401;
      throw serverError;
    }

    if (!data.user) {
      const serverError = new Error("사용자 정보를 가져올 수 없습니다.");
      serverError.cause = 500;
      throw serverError;
    }

    // Supabase Authentication의 Display Name 설정 - [25.11.12 - 러기]
    if (request.userName) {
      await supabase.auth.updateUser({
        data: {
          name: request.userName,
          full_name: request.userName,
        },
      });
    }

    return data.user;
  } catch (error) {
    console.error("❌ 카카오 세션 생성 에러:", error);

    if (error instanceof Error && error.cause) {
      throw error;
    }

    const serverError = new Error("카카오 세션 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
