"use server";

import { ResultMode, FileStatus, RelatedEntityType } from "@prisma/client";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import prisma from "@/database/utils/prisma/client";
import {
  CreatePollRequest,
  CreatePollResponse,
  GetUserPollsResponse,
} from "@/types/dto";

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

    const validationError = validatePollRequest(request);
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

      await tx.pollOption.createMany({
        data: request.options.map((option) => ({
          pollId: createdPoll.id,
          content: option.content,
          description: option.description,
          imageUrl: option.imageUrl,
          link: option.link,
          order: option.order,
        })),
      });

      // 파일 확정 처리 - 폴 대표 이미지
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

      // 파일 확정 처리 - 옵션 이미지들
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

function validatePollRequest(request: CreatePollRequest): string | null {
  if (!request.title || request.title.trim().length === 0) {
    return "제목을 입력해주세요.";
  }
  if (request.title.length > 100) {
    return "제목은 100자를 초과할 수 없습니다.";
  }

  if (request.description && request.description.length > 500) {
    return "설명은 500자를 초과할 수 없습니다.";
  }

  if (request.startDate < new Date()) {
    return "시작 날짜는 현재 시간 이후여야 합니다.";
  }

  if (request.endDate && request.endDate <= request.startDate) {
    return "종료 날짜는 시작 날짜보다 늦어야 합니다.";
  }

  // 이진 투표가 아닌 경우에만 옵션 검증
  const isBinaryPoll =
    request.type === "YES_NO" || request.type === "LIKE_DISLIKE";

  if (!isBinaryPoll) {
    if (!request.options || request.options.length === 0) {
      return "최소 1개의 옵션을 추가해주세요.";
    }

    if (request.options.length > 10) {
      return "옵션은 최대 10개까지 추가할 수 있습니다.";
    }

    for (const option of request.options) {
      if (!option.content || option.content.trim().length === 0) {
        return "모든 옵션에 내용을 입력해주세요.";
      }
      if (option.content.length > 100) {
        return "옵션 내용은 100자를 초과할 수 없습니다.";
      }
    }

    if (
      request.maxSelections &&
      request.maxSelections > request.options.length
    ) {
      return "최대 선택 개수는 옵션 개수를 초과할 수 없습니다.";
    }
  }

  return null;
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
            content: true,
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
