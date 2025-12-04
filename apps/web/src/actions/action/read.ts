"use server";

import { actionService } from "@/server/services/action";
import type { GetActionsOptions } from "@/server/services/action/types";
import type {
  GetActionByIdResponse,
  GetActionIdsResponse,
  GetActionResponse,
  GetMissionActionsDetailResponse,
} from "@/types/dto";
import type { ActionType } from "@prisma/client";

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
    const data = { ...question, surveyId: question.missionId };
    return { data };
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

export async function getMissionActionsDetail(
  missionId: string,
): Promise<GetMissionActionsDetailResponse> {
  try {
    const questions = await actionService.getMissionActionsDetail(missionId);
    const data = questions.map(question => ({ ...question, surveyId: question.missionId }));
    return { data };
  } catch (error) {
    console.error("getMissionActionsDetail error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 상세 정보를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

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
      data: questions.map(question => ({ ...question, surveyId: question.missionId })),
      nextCursor,
    };
  } catch (error) {
    console.error("getMissionActions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 질문 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
