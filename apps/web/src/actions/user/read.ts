"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";
import type {
  GetCurrentUserResponse,
  GetUserStatsResponse,
} from "@/types/dto/user";

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      },
    };
  } catch (error) {
    console.error("❌ 현재 사용자 정보 조회 에러:", error);
    return {
      success: false,
      error: "사용자 정보를 불러올 수 없습니다.",
    };
  }
}

export async function getUserStats(): Promise<GetUserStatsResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const [pollsCreated, votesCount, likesCount, bookmarksCount] =
      await Promise.all([
        prisma.poll.count({
          where: { creatorId: user.id },
        }),
        prisma.vote.count({
          where: { userId: user.id },
        }),
        prisma.pollLike.count({
          where: { userId: user.id },
        }),
        prisma.pollBookmark.count({
          where: { userId: user.id },
        }),
      ]);

    return {
      success: true,
      data: {
        pollsCreated,
        votesCount,
        likesCount,
        bookmarksCount,
      },
    };
  } catch (error) {
    console.error("❌ 사용자 통계 조회 에러:", error);
    return {
      success: false,
      error: "사용자 통계를 불러올 수 없습니다.",
    };
  }
}
