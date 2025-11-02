"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import type { GetCurrentUserResponse, GetUserStatsResponse } from "@/types/dto/user";

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  try {
    const user = await requireAuth();

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
      const error = new Error("사용자 정보를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return {
      data: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("사용자 정보를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getUserStats(): Promise<GetUserStatsResponse> {
  try {
    const user = await requireAuth();

    const [pollsCreated, votesCount, likesCount, bookmarksCount] = await Promise.all([
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
      data: {
        pollsCreated,
        votesCount,
        likesCount,
        bookmarksCount,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("사용자 통계를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
