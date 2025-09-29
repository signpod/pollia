"use server";

import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";
import {
  SubmitVoteRequest,
  SubmitVoteResponse,
  RemoveVoteRequest,
  RemoveVoteResponse,
} from "@/types/dto";

// 사용자의 특정 투표 참여 상태 확인
export async function getUserVoteStatus(pollId: string) {
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

    const votes = await prisma.vote.findMany({
      where: {
        pollId: pollId,
        userId: user.id,
      },
      include: {
        option: {
          select: {
            id: true,
            description: true,
            order: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        hasVoted: votes.length > 0,
        votes: votes.map((vote) => ({
          id: vote.id,
          option: vote.option,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching user vote status:", error);
    return {
      success: false,
      error: "투표 상태를 불러올 수 없습니다.",
    };
  }
}

// 투표 제출
export async function submitVote(
  request: SubmitVoteRequest
): Promise<SubmitVoteResponse> {
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

    // 투표 검증
    const validationError = await validateVoteRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const vote = await prisma.$transaction(async (tx) => {
      // 기존 투표 제거 (이진 투표는 단일 선택)
      await tx.vote.deleteMany({
        where: {
          pollId: request.pollId,
          userId: user.id,
        },
      });

      // 새 투표 생성
      const newVote = await tx.vote.create({
        data: {
          pollId: request.pollId,
          userId: user.id,
          optionId: request.optionId,
        },
      });

      return newVote;
    });

    return {
      success: true,
      data: {
        id: vote.id,
        pollId: vote.pollId,
        optionId: vote.optionId,
      },
    };
  } catch (error) {
    console.error("❌ 투표 제출 에러:", error);
    return {
      success: false,
      error: "투표 처리 중 오류가 발생했습니다.",
    };
  }
}

// 투표 취소
export async function removeVote(
  request: RemoveVoteRequest
): Promise<RemoveVoteResponse> {
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

    const whereClause = {
      pollId: request.pollId,
      userId: user.id,
      ...(request.optionId && { optionId: request.optionId }),
    };

    const result = await prisma.vote.deleteMany({
      where: whereClause,
    });

    return {
      success: true,
      data: {
        removed: result.count > 0,
      },
    };
  } catch (error) {
    console.error("❌ 투표 취소 에러:", error);
    return {
      success: false,
      error: "투표 취소 중 오류가 발생했습니다.",
    };
  }
}

// 투표 요청 검증
async function validateVoteRequest(
  request: SubmitVoteRequest
): Promise<string | null> {
  // Poll 존재 여부 및 상태 확인
  const poll = await prisma.poll.findUnique({
    where: { id: request.pollId },
    include: {
      options: {
        select: { id: true },
      },
    },
  });

  if (!poll) {
    return "존재하지 않는 투표입니다.";
  }

  // 투표 기간 확인
  const now = new Date();
  if (poll.startDate && now < poll.startDate) {
    return "아직 투표가 시작되지 않았습니다.";
  }

  if (!poll.isIndefinite && poll.endDate && now >= poll.endDate) {
    return "투표가 종료되었습니다.";
  }

  // 옵션 존재 여부 확인
  const optionExists = poll.options.some(
    (option) => option.id === request.optionId
  );
  if (!optionExists) {
    return "존재하지 않는 선택지입니다.";
  }

  return null;
}
