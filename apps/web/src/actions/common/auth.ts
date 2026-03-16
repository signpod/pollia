"use server";

import { GUEST_ID_COOKIE_MAX_AGE_SECONDS, GUEST_ID_COOKIE_NAME } from "@/constants/cookie";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { userService } from "@/server/services/user/userService";
import { type GetCurrentUserResponse, UserRole } from "@/types/dto/user";
import { UserStatus } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
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

  if (!authError && user) {
    return user;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return session.user;
  }

  const error = new Error("로그인이 필요합니다.");
  error.cause = 401;
  throw error;
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

export const requireContentManager = cache(async (): Promise<{ user: User; isAdmin: boolean }> => {
  const user = await requireActiveUser();
  const dbUser = await userService.getUserById(user.id);
  return { user, isAdmin: dbUser.role === UserRole.ADMIN };
});

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

export type MissionActor =
  | { userId: string; guestId: null; isGuest: false }
  | {
      userId: null;
      guestId: string;
      isGuest: true;
    };

export async function resolveMissionActor(): Promise<MissionActor> {
  try {
    const user = await requireActiveUser();
    return {
      userId: user.id,
      guestId: null,
      isGuest: false,
    };
  } catch (error) {
    if (!(error instanceof Error) || error.cause !== 401) {
      throw error;
    }
  }

  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(GUEST_ID_COOKIE_NAME)?.value;
  const guestId = existingGuestId || crypto.randomUUID();

  if (!existingGuestId) {
    cookieStore.set(GUEST_ID_COOKIE_NAME, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: GUEST_ID_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return {
    userId: null,
    guestId,
    isGuest: true,
  };
}
