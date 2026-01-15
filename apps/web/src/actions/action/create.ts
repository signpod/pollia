"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type { ActionCreatedResult } from "@/server/services/action/types";
import type {
  BaseActionResponse,
  CreateDateActionRequest,
  CreateDateActionResponse,
  CreateImageActionRequest,
  CreateImageActionResponse,
  CreateMultipleChoiceActionRequest,
  CreateMultipleChoiceActionResponse,
  CreatePdfActionRequest,
  CreatePdfActionResponse,
  CreateRatingActionRequest,
  CreateRatingActionResponse,
  CreateScaleActionRequest,
  CreateScaleActionResponse,
  CreateShortTextActionRequest,
  CreateShortTextActionResponse,
  CreateSubjectiveActionRequest,
  CreateSubjectiveActionResponse,
  CreateTagActionRequest,
  CreateTagActionResponse,
  CreateTimeActionRequest,
  CreateTimeActionResponse,
  CreateVideoActionRequest,
  CreateVideoActionResponse,
} from "@/types/dto";
import { revalidatePath } from "next/cache";

async function createActionHandler<TRequest, TResponse extends BaseActionResponse>(
  request: TRequest,
  serviceMethod: (req: TRequest, userId: string) => Promise<ActionCreatedResult>,
  errorMessage: string,
): Promise<TResponse> {
  try {
    const user = await requireAuth();
    const action = await serviceMethod(request, user.id);

    if (action.missionId) {
      revalidatePath(`/mission/${action.missionId}`);
    }

    return { data: action } as TResponse;
  } catch (error) {
    console.error(`${errorMessage} error:`, error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(`${errorMessage} 생성 중 오류가 발생했습니다.`);
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createMultipleChoiceAction(
  request: CreateMultipleChoiceActionRequest,
): Promise<CreateMultipleChoiceActionResponse> {
  return createActionHandler(
    request,
    actionService.createMultipleChoiceAction.bind(actionService),
    "질문",
  );
}

export async function createScaleAction(
  request: CreateScaleActionRequest,
): Promise<CreateScaleActionResponse> {
  return createActionHandler(request, actionService.createScaleAction.bind(actionService), "질문");
}

export async function createSubjectiveAction(
  request: CreateSubjectiveActionRequest,
): Promise<CreateSubjectiveActionResponse> {
  return createActionHandler(
    request,
    actionService.createSubjectiveAction.bind(actionService),
    "질문",
  );
}

export async function createShortTextAction(
  request: CreateShortTextActionRequest,
): Promise<CreateShortTextActionResponse> {
  return createActionHandler(
    request,
    actionService.createShortTextAction.bind(actionService),
    "짧은 텍스트",
  );
}

export async function createTagAction(
  request: CreateTagActionRequest,
): Promise<CreateTagActionResponse> {
  return createActionHandler(
    request,
    actionService.createTagAction.bind(actionService),
    "태그 액션",
  );
}

export async function createRatingAction(
  request: CreateRatingActionRequest,
): Promise<CreateRatingActionResponse> {
  return createActionHandler(
    request,
    actionService.createRatingAction.bind(actionService),
    "평가 액션",
  );
}

export async function createImageAction(
  request: CreateImageActionRequest,
): Promise<CreateImageActionResponse> {
  return createActionHandler(
    request,
    actionService.createImageAction.bind(actionService),
    "이미지 액션",
  );
}

export async function createPdfAction(
  request: CreatePdfActionRequest,
): Promise<CreatePdfActionResponse> {
  return createActionHandler(
    request,
    actionService.createPdfAction.bind(actionService),
    "PDF 액션",
  );
}

export async function createVideoAction(
  request: CreateVideoActionRequest,
): Promise<CreateVideoActionResponse> {
  return createActionHandler(
    request,
    actionService.createVideoAction.bind(actionService),
    "Video 액션",
  );
}

export async function createDateAction(
  request: CreateDateActionRequest,
): Promise<CreateDateActionResponse> {
  return createActionHandler(
    request,
    actionService.createDateAction.bind(actionService),
    "날짜 액션",
  );
}

export async function createTimeAction(
  request: CreateTimeActionRequest,
): Promise<CreateTimeActionResponse> {
  return createActionHandler(
    request,
    actionService.createTimeAction.bind(actionService),
    "시간 액션",
  );
}
