"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";

export async function bookmarkPoll(pollId: string) {
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

    const existingBookmark = await prisma.pollBookmark.findUnique({
      where: {
        pollId_userId: {
          pollId: pollId,
          userId: user.id,
        },
      },
    });

    if (existingBookmark) {
      return {
        success: false,
        error: "이미 북마크한 투표입니다.",
      };
    }

    await prisma.pollBookmark.create({
      data: {
        pollId: pollId,
        userId: user.id,
      },
    });

    return {
      success: true,
      data: {
        message: "북마크가 추가되었습니다.",
      },
    };
  } catch (error) {
    console.error("❌ 북마크 추가 에러:", error);
    return {
      success: false,
      error: "북마크 처리 중 오류가 발생했습니다.",
    };
  }
}

export async function unbookmarkPoll(pollId: string) {
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

    const result = await prisma.pollBookmark.deleteMany({
      where: {
        pollId: pollId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "북마크하지 않은 투표입니다.",
      };
    }

    return {
      success: true,
      data: {
        message: "북마크가 취소되었습니다.",
      },
    };
  } catch (error) {
    console.error("❌ 북마크 취소 에러:", error);
    return {
      success: false,
      error: "북마크 취소 중 오류가 발생했습니다.",
    };
  }
}

export async function toggleBookmarkPoll(pollId: string) {
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

    const existingBookmark = await prisma.pollBookmark.findUnique({
      where: {
        pollId_userId: {
          pollId: pollId,
          userId: user.id,
        },
      },
    });

    let isBookmarked: boolean;

    if (existingBookmark) {
      await prisma.pollBookmark.delete({
        where: {
          pollId_userId: {
            pollId: pollId,
            userId: user.id,
          },
        },
      });
      isBookmarked = false;
    } else {
      await prisma.pollBookmark.create({
        data: {
          pollId: pollId,
          userId: user.id,
        },
      });
      isBookmarked = true;
    }

    return {
      success: true,
      data: {
        isBookmarked,
        message: isBookmarked
          ? "북마크가 추가되었습니다."
          : "북마크가 취소되었습니다.",
      },
    };
  } catch (error) {
    console.error("❌ 북마크 토글 에러:", error);
    return {
      success: false,
      error: "북마크 처리 중 오류가 발생했습니다.",
    };
  }
}
