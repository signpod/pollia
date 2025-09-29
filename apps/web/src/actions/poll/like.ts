"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";

export async function likePoll(pollId: string) {
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

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true },
    });

    if (!poll) {
      return {
        success: false,
        error: "존재하지 않는 투표입니다.",
      };
    }

    const existingLike = await prisma.pollLike.findUnique({
      where: {
        pollId_userId: {
          pollId: pollId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      return {
        success: false,
        error: "이미 좋아요를 누른 투표입니다.",
      };
    }

    await prisma.pollLike.create({
      data: {
        pollId: pollId,
        userId: user.id,
      },
    });

    return {
      success: true,
      data: {
        message: "좋아요가 추가되었습니다.",
      },
    };
  } catch (error) {
    console.error("❌ 좋아요 추가 에러:", error);
    return {
      success: false,
      error: "좋아요 처리 중 오류가 발생했습니다.",
    };
  }
}

export async function unlikePoll(pollId: string) {
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

    const result = await prisma.pollLike.deleteMany({
      where: {
        pollId: pollId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "좋아요를 누르지 않은 투표입니다.",
      };
    }

    return {
      success: true,
      data: {
        message: "좋아요가 취소되었습니다.",
      },
    };
  } catch (error) {
    console.error("❌ 좋아요 취소 에러:", error);
    return {
      success: false,
      error: "좋아요 취소 중 오류가 발생했습니다.",
    };
  }
}

export async function toggleLikePoll(pollId: string) {
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

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true },
    });

    if (!poll) {
      return {
        success: false,
        error: "존재하지 않는 투표입니다.",
      };
    }

    const existingLike = await prisma.pollLike.findUnique({
      where: {
        pollId_userId: {
          pollId: pollId,
          userId: user.id,
        },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      await prisma.pollLike.delete({
        where: {
          pollId_userId: {
            pollId: pollId,
            userId: user.id,
          },
        },
      });
      isLiked = false;
    } else {
      await prisma.pollLike.create({
        data: {
          pollId: pollId,
          userId: user.id,
        },
      });
      isLiked = true;
    }

    return {
      success: true,
      data: {
        isLiked,
        message: isLiked
          ? "좋아요가 추가되었습니다."
          : "좋아요가 취소되었습니다.",
      },
    };
  } catch (error) {
    console.error("❌ 좋아요 토글 에러:", error);
    return {
      success: false,
      error: "좋아요 처리 중 오류가 발생했습니다.",
    };
  }
}
