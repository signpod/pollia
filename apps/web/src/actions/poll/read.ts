"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";
import { GetUserPollsResponse } from "@/types/dto";

export async function getPoll(pollId: string) {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        options: {
          select: {
            id: true,
            description: true,
            imageUrl: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!poll) {
      return {
        success: false,
        error: "투표를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
    console.error("❌ 폴 조회 에러:", error);
    return {
      success: false,
      error: "투표를 불러올 수 없습니다.",
    };
  }
}

export async function getUserPolls(
  userId?: string
): Promise<GetUserPollsResponse> {
  try {
    if (!userId) {
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
      userId = user.id;
    }

    const polls = await prisma.poll.findMany({
      where: {
        creatorId: userId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        startDate: true,
        endDate: true,
        isIndefinite: true,
        createdAt: true,
        _count: {
          select: {
            votes: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: polls,
    };
  } catch (error) {
    console.error("❌ 폴 목록 조회 에러:", error);
    return {
      success: false,
      error: "폴 목록을 불러올 수 없습니다.",
    };
  }
}

export async function getBookmarkedPolls(
  userId?: string
): Promise<GetUserPollsResponse> {
  try {
    if (!userId) {
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
      userId = user.id;
    }

    const polls = await prisma.poll.findMany({
      where: {
        bookmarks: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        startDate: true,
        endDate: true,
        isIndefinite: true,
        createdAt: true,
        _count: {
          select: {
            votes: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: polls,
    };
  } catch (error) {
    console.error("❌ 북마크 폴 목록 조회 에러:", error);
    return {
      success: false,
      error: "북마크 폴 목록을 불러올 수 없습니다.",
    };
  }
}

export async function getLikedPolls(
  userId?: string
): Promise<GetUserPollsResponse> {
  try {
    if (!userId) {
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
      userId = user.id;
    }

    const polls = await prisma.poll.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        startDate: true,
        endDate: true,
        isIndefinite: true,
        createdAt: true,
        _count: {
          select: {
            votes: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: polls,
    };
  } catch (error) {
    console.error("❌ 좋아요 폴 목록 조회 에러:", error);
    return {
      success: false,
      error: "좋아요 폴 목록을 불러올 수 없습니다.",
    };
  }
}

// 투표 결과 실시간 조회
export async function getPollResults(pollId: string) {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        startDate: true,
        endDate: true,
        isIndefinite: true,
        maxSelections: true,
        options: {
          select: {
            id: true,
            description: true,
            imageUrl: true,
            order: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!poll) {
      return {
        success: false,
        error: "투표를 찾을 수 없습니다.",
      };
    }

    // 고유 참여자 수 계산 (최적화된 COUNT DISTINCT)
    const [participantCountResult] = await prisma.$queryRaw<
      [{ count: bigint }]
    >`
      SELECT COUNT(DISTINCT user_id) as count
      FROM votes
      WHERE poll_id = ${pollId}
    `;

    const uniqueParticipants = Number(participantCountResult?.count || 0);

    return {
      success: true,
      data: {
        ...poll,
        _count: {
          votes: poll._count.votes,
          participants: uniqueParticipants,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching poll results:", error);
    return {
      success: false,
      error: "투표 결과를 불러올 수 없습니다.",
    };
  }
}
