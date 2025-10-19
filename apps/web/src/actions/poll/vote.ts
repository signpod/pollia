"use server";

import { requireAuth } from "@/actions/auth";
import prisma from "@/database/utils/prisma/client";
import {
  SubmitVoteRequest,
  SubmitVoteResponse,
  RemoveVoteRequest,
  RemoveVoteResponse,
  SubmitMultipleVoteRequest,
  SubmitMultipleVoteResponse,
  RemoveMultipleVoteRequest,
  RemoveMultipleVoteResponse,
} from "@/types/dto";

// 사용자의 특정 투표 참여 상태 확인
export async function getUserVoteStatus(pollId: string) {
  try {
    const user = await requireAuth();

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
      hasVoted: votes.length > 0,
      votes: votes.map((vote) => ({
        id: vote.id,
        option: vote.option,
      })),
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("투표 상태를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

// Individual Poll 투표 제출 (Binary Poll용)
export async function submitIndividualVote(
  request: SubmitVoteRequest
): Promise<SubmitVoteResponse> {
  try {
    const user = await requireAuth();

    // 투표 검증
    const validationError = await validateVoteRequest(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
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
      data: {
        id: vote.id,
        pollId: vote.pollId,
        optionId: vote.optionId,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("투표 처리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

// Individual Poll 투표 취소 (Binary Poll용)
export async function removeIndividualVote(
  request: RemoveVoteRequest
): Promise<RemoveVoteResponse> {
  try {
    const user = await requireAuth();

    const whereClause = {
      pollId: request.pollId,
      userId: user.id,
      ...(request.optionId && { optionId: request.optionId }),
    };

    const result = await prisma.vote.deleteMany({
      where: whereClause,
    });

    return {
      data: {
        removed: result.count > 0,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("투표 취소 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
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

// Multiple Choice Poll 투표 제출
export async function submitMultipleVote(
  request: SubmitMultipleVoteRequest
): Promise<SubmitMultipleVoteResponse> {
  try {
    const user = await requireAuth();

    // 투표 검증
    const validationError = await validateVoteRequest(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    // 이미 해당 옵션에 투표했는지 확인
    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId: request.pollId,
        userId: user.id,
        optionId: request.optionId,
      },
    });

    if (existingVote) {
      const error = new Error("이미 해당 옵션에 투표하셨습니다.");
      error.cause = 400;
      throw error;
    }

    // 새 투표 생성 (기존 투표는 유지)
    const newVote = await prisma.vote.create({
      data: {
        pollId: request.pollId,
        userId: user.id,
        optionId: request.optionId,
      },
    });

    return {
      data: {
        id: newVote.id,
        pollId: newVote.pollId,
        optionId: newVote.optionId,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("투표 처리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

// Multiple Choice Poll 투표 취소
export async function removeMultipleVote(
  request: RemoveMultipleVoteRequest
): Promise<RemoveMultipleVoteResponse> {
  try {
    const user = await requireAuth();

    // 특정 옵션의 투표만 제거
    const deletedVote = await prisma.vote.deleteMany({
      where: {
        pollId: request.pollId,
        userId: user.id,
        optionId: request.optionId,
      },
    });

    if (deletedVote.count === 0) {
      const error = new Error("취소할 투표가 없습니다.");
      error.cause = 404;
      throw error;
    }

    return {
      data: {
        pollId: request.pollId,
        optionId: request.optionId,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("투표 취소 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
