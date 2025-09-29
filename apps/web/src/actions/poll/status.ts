"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";
import type { GetPollUserStatusResponse } from "@/types/dto";

export async function getPollUserStatus(
  pollId: string
): Promise<GetPollUserStatusResponse> {
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

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: { id: true },
  });

  if (!poll) {
    const error = new Error("존재하지 않는 투표입니다.");
    error.cause = 404;
    throw error;
  }

  const [likeStatus, bookmarkStatus] = await Promise.all([
    prisma.pollLike.findUnique({
      where: {
        pollId_userId: {
          pollId: pollId,
          userId: user.id,
        },
      },
      select: { id: true },
    }),
    prisma.pollBookmark.findUnique({
      where: {
        pollId_userId: {
          pollId: pollId,
          userId: user.id,
        },
      },
      select: { id: true },
    }),
  ]);

  return {
    userId: user.id,
    pollId: pollId,
    isLiked: !!likeStatus,
    isBookmarked: !!bookmarkStatus,
  };
}
