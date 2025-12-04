"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type {
  CreateMultipleChoiceInput,
  CreateScaleInput,
  CreateSubjectiveInput,
} from "@/server/services/action/types";
import type {
  CreateMultipleChoiceActionRequest,
  CreateMultipleChoiceActionResponse,
  CreateScaleActionRequest,
  CreateScaleActionResponse,
  CreateSubjectiveActionRequest,
  CreateSubjectiveActionResponse,
} from "@/types/dto";

function toMultipleChoiceInput(dto: CreateMultipleChoiceActionRequest): CreateMultipleChoiceInput {
  return {
    missionId: dto.missionId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    maxSelections: dto.maxSelections,
    order: dto.order,
    options: dto.options.map(opt => ({
      title: opt.title,
      description: opt.description,
      imageUrl: opt.imageUrl,
      order: opt.order,
      imageFileUploadId: opt.imageFileUploadId,
    })),
  };
}

function toScaleInput(dto: CreateScaleActionRequest): CreateScaleInput {
  return {
    missionId: dto.missionId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

function toSubjectiveInput(dto: CreateSubjectiveActionRequest): CreateSubjectiveInput {
  return {
    missionId: dto.missionId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

export async function createMultipleChoiceAction(
  request: CreateMultipleChoiceActionRequest,
): Promise<CreateMultipleChoiceActionResponse> {
  try {
    const user = await requireAuth();
    const input = toMultipleChoiceInput(request);
    const question = await actionService.createMultipleChoiceAction(input, user.id);
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
    const input = toScaleInput(request);
    const question = await actionService.createScaleAction(input, user.id);
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
    const input = toSubjectiveInput(request);
    const question = await actionService.createSubjectiveAction(input, user.id);

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
