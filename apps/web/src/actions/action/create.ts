"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type {
  CreateImageActionRequest,
  CreateImageActionResponse,
  CreateMultipleChoiceActionRequest,
  CreateMultipleChoiceActionResponse,
  CreateRatingActionRequest,
  CreateRatingActionResponse,
  CreateScaleActionRequest,
  CreateScaleActionResponse,
  CreateSubjectiveActionRequest,
  CreateSubjectiveActionResponse,
  CreateTagActionRequest,
  CreateTagActionResponse,
} from "@/types/dto";

export async function createMultipleChoiceAction(
  request: CreateMultipleChoiceActionRequest,
): Promise<CreateMultipleChoiceActionResponse> {
  try {
    const user = await requireAuth();
    const question = await actionService.createMultipleChoiceAction(request, user.id);
    const data = { ...question, surveyId: question.missionId };
    return { data };
  } catch (error) {
    console.error("createMultipleChoiceAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createScaleAction(
  request: CreateScaleActionRequest,
): Promise<CreateScaleActionResponse> {
  try {
    const user = await requireAuth();
    const question = await actionService.createScaleAction(request, user.id);
    const data = { ...question, surveyId: question.missionId };

    return { data };
  } catch (error) {
    console.error("createScaleAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createSubjectiveAction(
  request: CreateSubjectiveActionRequest,
): Promise<CreateSubjectiveActionResponse> {
  try {
    const user = await requireAuth();
    const question = await actionService.createSubjectiveAction(request, user.id);

    const data = { ...question, surveyId: question.missionId };
    return { data };
  } catch (error) {
    console.error("createSubjectiveAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createTagAction(
  request: CreateTagActionRequest,
): Promise<CreateTagActionResponse> {
  try {
    const user = await requireAuth();
    const question = await actionService.createTagAction(request, user.id);

    const data = { ...question, surveyId: question.missionId };
    return { data };
  } catch (error) {
    console.error("createTagAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("태그 액션 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createRatingAction(
  request: CreateRatingActionRequest,
): Promise<CreateRatingActionResponse> {
  try {
    const user = await requireAuth();
    const question = await actionService.createRatingAction(request, user.id);

    const data = { ...question, surveyId: question.missionId };
    return { data };
  } catch (error) {
    console.error("createRatingAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("평가 액션 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createImageAction(
  request: CreateImageActionRequest,
): Promise<CreateImageActionResponse> {
  try {
    const user = await requireAuth();
    const question = await actionService.createImageAction(request, user.id);

    const data = { ...question, surveyId: question.missionId };
    return { data };
  } catch (error) {
    console.error("createImageAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("이미지 액션 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
