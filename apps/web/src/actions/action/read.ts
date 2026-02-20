"use server";

import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { actionService } from "@/server/services/action";
import type { GetActionsOptions } from "@/server/services/action/types";
import type {
  GetActionByIdResponse,
  GetActionIdsResponse,
  GetActionResponse,
  GetMissionActionsDetailResponse,
} from "@/types/dto";
import type { ActionType } from "@prisma/client";
import { cache } from "react";

export interface GetMissionQuestionsRequest {
  searchQuery?: string;
  selectedQuestionTypes?: ActionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}

function toGetActionsOptions(dto: GetMissionQuestionsRequest): GetActionsOptions {
  return {
    searchQuery: dto.searchQuery,
    selectedActionTypes: dto.selectedQuestionTypes,
    isDraft: dto.isDraft,
    cursor: dto.cursor,
    limit: dto.limit,
  };
}

export async function getActionById(actionId: string): Promise<GetActionByIdResponse> {
  try {
    const question = await actionService.getActionById(actionId);
    return { data: question };
  } catch (error) {
    console.error("getActionById error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getMissionActionIds(missionId: string): Promise<GetActionIdsResponse> {
  try {
    const { actionIds } = await actionService.getMissionActionIds(missionId);
    const data = { actionIds };
    return { data };
  } catch (error) {
    console.error("getMissionActionIds error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Request Memoization을 사용하여 동일한 요청 내에서 중복 호출을 방지합니다.
 * 요청 간 캐시 공유는 되지 않으므로, ISR과 함께 사용할 때는 unstable_cache를 고려하세요.
 */
export const getMissionActionsDetail = cache(
  async (missionId: string): Promise<GetMissionActionsDetailResponse> => {
    try {
      const questions = await actionService.getMissionActionsDetail(missionId);
      return { data: questions };
    } catch (error) {
      console.error("getMissionActionsDetail error:", error);
      if (error instanceof Error && error.cause) {
        throw error;
      }
      const serverError = new Error("질문 상세 정보를 불러올 수 없습니다.");
      serverError.cause = 500;
      throw serverError;
    }
  },
);

export async function getMissionActions(
  request?: GetMissionQuestionsRequest,
): Promise<GetActionResponse & { nextCursor?: string }> {
  try {
    const limit = request?.limit ?? 10;
    const options = request
      ? toGetActionsOptions({ ...request, limit: limit + 1 })
      : { limit: limit + 1 };

    const questions = await actionService.getActions(options);

    let nextCursor: string | undefined = undefined;
    if (questions.length > limit) {
      const nextItem = questions.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: questions,
      nextCursor,
    };
  } catch (error) {
    console.error("getMissionActions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(`${UBQUITOUS_CONSTANTS.MISSION} 질문 목록을 불러올 수 없습니다.`);
    serverError.cause = 500;
    throw serverError;
  }
}
