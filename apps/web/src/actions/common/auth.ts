"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { userService } from "@/server/services/user/userService";
import { type GetCurrentUserResponse, UserRole } from "@/types/dto/user";
import { UserStatus } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * 순수 인증만 수행합니다. Supabase Auth 토큰을 검증하여 사용자를 식별합니다.
 * 탈퇴 상태 등 비즈니스 로직 인가는 포함하지 않습니다.
 */
export const requireAuth = cache(async (): Promise<User> => {
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
});

/**
 * 인증 + 활성 상태 인가를 수행합니다.
 * 탈퇴 처리된(WITHDRAWING, WITHDRAWN) 계정은 403으로 차단합니다.
 */
export const requireActiveUser = cache(async (): Promise<User> => {
  const user = await requireAuth();

  const dbUser = await userService.getUserById(user.id);

  if (dbUser.status !== UserStatus.ACTIVE) {
    const error = new Error("탈퇴 처리된 계정입니다.");
    error.cause = 403;
    throw error;
  }

  return user;
});

export async function requireAdmin(): Promise<{
  supabaseUser: User;
  dbUser: GetCurrentUserResponse["data"];
}> {
  const supabaseUser = await requireAuth();

  try {
    const dbUser = await userService.getUserById(supabaseUser.id);

    if (dbUser.status !== UserStatus.ACTIVE) {
      const error = new Error("탈퇴 처리된 계정입니다.");
      error.cause = 403;
      throw error;
    }

    if (dbUser.role !== UserRole.ADMIN) {
      const error = new Error("관리자 권한이 필요합니다.");
      error.cause = 403;
      throw error;
    }

    return { supabaseUser, dbUser };
  } catch (error) {
    if (error instanceof Error && (error.cause === 404 || error.cause === 403)) {
      throw error;
    }

    const serverError = new Error("권한 확인 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function signOut(redirectTo?: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    const serverError = new Error("로그아웃 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }

  if (redirectTo) {
    redirect(redirectTo);
  }
}
