"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";

export async function bookmarkPoll(pollId: string) {
  try {
    const user = await requireAuth();

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true },
    });

    if (!poll) {
      const error = new Error("존재하지 않는 투표입니다.");
      error.cause = 404;
      throw error;
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
      const error = new Error("이미 북마크한 투표입니다.");
      error.cause = 409; // Conflict
      throw error;
    }

    await prisma.pollBookmark.create({
      data: {
        pollId: pollId,
        userId: user.id,
      },
    });

    return {
      message: "북마크가 추가되었습니다.",
    };
  } catch (error) {
    console.error("❌ 북마크 추가 에러:", error);
    if (error instanceof Error && error.cause) {
      throw error; // 기존 에러 다시 throw
    }
    const serverError = new Error("북마크 처리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function unbookmarkPoll(pollId: string) {
  try {
    const user = await requireAuth();

    const result = await prisma.pollBookmark.deleteMany({
      where: {
        pollId: pollId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      const error = new Error("북마크하지 않은 투표입니다.");
      error.cause = 404;
      throw error;
    }

    return {
      message: "북마크가 취소되었습니다.",
    };
  } catch (error) {
    console.error("❌ 북마크 취소 에러:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("북마크 취소 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function toggleBookmarkPoll(pollId: string) {
  try {
    const user = await requireAuth();

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true },
    });

    if (!poll) {
      const error = new Error("존재하지 않는 투표입니다.");
      error.cause = 404;
      throw error;
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
      isBookmarked,
      message: isBookmarked ? "북마크가 추가되었습니다." : "북마크가 취소되었습니다.",
    };
  } catch (error) {
    console.error("❌ 북마크 토글 에러:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("북마크 처리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
