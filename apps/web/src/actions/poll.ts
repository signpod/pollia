"use server";

import { ResultMode, FileStatus, RelatedEntityType } from "@prisma/client";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";
import {
  CreatePollRequest,
  CreatePollResponse,
  GetUserPollsResponse,
  SubmitVoteRequest,
  SubmitVoteResponse,
  RemoveVoteRequest,
  RemoveVoteResponse,
} from "@/types/dto";
import { BINARY_POLL_OPTIONS, isBinaryPollType } from "@/constants/poll";
import { binaryPollSchema } from "@/schemas/binaryPollSchema";
import { multiplePollSchema } from "@/schemas/multiplePollSchema";
import { PollType } from "@prisma/client";

function validatePollRequestWithClientSchema(
  request: CreatePollRequest
): string | null {
  try {
    if (!request.startDate) {
      return "시작 날짜는 필수입니다.";
    }

    const startDateTime = request.startDate!;
    const startDate = startDateTime.toISOString().split("T")[0];
    const startTime =
      startDateTime.toISOString().split("T")[1]?.slice(0, 5) || "";

    const endDate = request.endDate?.toISOString().split("T")[0];
    const endTime = request.endDate
      ? request.endDate.toISOString().split("T")[1]?.slice(0, 5) || ""
      : "";

    const baseFormData = {
      category: request.category,
      title: request.title,
      description: request.description || "",
      thumbnailUrl: request.imageUrl || "",
      isUnlimited: request.isIndefinite ?? false,
      startDate,
      startTime,
      endDate: endDate || "",
      endTime: endTime || "",
    };

    if (isBinaryPollType(request.type)) {
      const result = binaryPollSchema.safeParse(baseFormData);
      if (!result.success) {
        return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
      }
    } else if (request.type === PollType.MULTIPLE_CHOICE) {
      const multipleFormData = {
        ...baseFormData,
        maxSelections: request.maxSelections || 1,
        options: request.options.map((opt) => ({
          id: `temp-${opt.order}`,
          description: opt.description,
          imageUrl: opt.imageUrl,
          link: opt.link,
          order: opt.order,
          fileUploadId: opt.imageFileUploadId,
        })),
      };

      const result = multiplePollSchema.safeParse(multipleFormData);
      if (!result.success) {
        return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
      }
    }

    return null;
  } catch {
    return "유효성 검사 중 오류가 발생했습니다.";
  }
}

export async function createPoll(
  request: CreatePollRequest
): Promise<CreatePollResponse> {
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

    const validationError = validatePollRequestWithClientSchema(request);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const poll = await prisma.$transaction(async (tx) => {
      const createdPoll = await tx.poll.create({
        data: {
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          type: request.type,
          category: request.category,
          startDate: request.startDate,
          endDate: request.endDate,
          isIndefinite: request.isIndefinite ?? false,
          maxSelections: request.maxSelections,
          showResultsMode: request.showResultsMode ?? ResultMode.IMMEDIATE,
          isPublic: request.isPublic ?? true,
          creatorId: user.id,
        },
      });

      if (isBinaryPollType(request.type)) {
        const binaryOptions =
          BINARY_POLL_OPTIONS[request.type as keyof typeof BINARY_POLL_OPTIONS];
        await tx.pollOption.createMany({
          data: binaryOptions.map(
            (option: { description: string; order: number }) => ({
              pollId: createdPoll.id,
              description: option.description,
              order: option.order,
            })
          ),
        });
      } else {
        await tx.pollOption.createMany({
          data: request.options.map((option) => ({
            pollId: createdPoll.id,
            description: option.description,
            imageUrl: option.imageUrl,
            link: option.link,
            order: option.order,
          })),
        });
      }

      if (request.imageFileUploadId) {
        await tx.fileUpload.update({
          where: {
            id: request.imageFileUploadId,
            userId: user.id,
            status: FileStatus.TEMPORARY,
          },
          data: {
            status: FileStatus.CONFIRMED,
            confirmedAt: new Date(),
            relatedEntityType: RelatedEntityType.POLL,
            relatedEntityId: createdPoll.id,
          },
        });
      }

      if (!isBinaryPollType(request.type) && request.options) {
        const optionFileUploadIds = request.options
          .map((option) => option.imageFileUploadId)
          .filter(Boolean) as string[];

        if (optionFileUploadIds.length > 0) {
          await tx.fileUpload.updateMany({
            where: {
              id: { in: optionFileUploadIds },
              userId: user.id,
              status: FileStatus.TEMPORARY,
            },
            data: {
              status: FileStatus.CONFIRMED,
              confirmedAt: new Date(),
              relatedEntityType: RelatedEntityType.POLL_OPTION,
              relatedEntityId: createdPoll.id,
            },
          });
        }
      }

      return createdPoll;
    });

    return {
      success: true,
      data: {
        id: poll.id,
        title: poll.title,
        type: poll.type,
        category: poll.category,
        createdAt: poll.createdAt,
      },
    };
  } catch (error) {
    console.error("❌ 폴 생성 에러:", error);
    return {
      success: false,
      error: "폴 생성 중 오류가 발생했습니다.",
    };
  }
}

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

    return {
      success: true,
      data: poll,
    };
  } catch (error) {
    console.error("Error fetching poll results:", error);
    return {
      success: false,
      error: "투표 결과를 불러올 수 없습니다.",
    };
  }
}

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
