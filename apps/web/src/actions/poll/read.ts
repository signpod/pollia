"use server";

import { requireAuth } from "@/actions/auth";
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
      const error = new Error("투표를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return { data: poll };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("투표를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getUserPolls(
  userId?: string
): Promise<GetUserPollsResponse> {
  try {
    if (!userId) {
      const user = await requireAuth();
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
      data: polls,
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("폴 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getBookmarkedPolls(
  userId?: string
): Promise<GetUserPollsResponse> {
  try {
    if (!userId) {
      const user = await requireAuth();
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
      data: polls,
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("북마크 폴 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getLikedPolls(
  userId?: string
): Promise<GetUserPollsResponse> {
  try {
    if (!userId) {
      const user = await requireAuth();
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
      data: polls,
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("좋아요 폴 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
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
      const error = new Error("투표를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
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
      data: {
        ...poll,
        _count: {
          votes: poll._count.votes,
          participants: uniqueParticipants,
        },
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("투표 결과를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
