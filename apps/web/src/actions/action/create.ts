"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type {
  CreateEitherOrInput,
  CreateMultipleChoiceInput,
  CreateScaleInput,
  CreateSubjectiveInput,
} from "@/server/services/action/types";
import type {
  CreateEitherOrQuestionRequest,
  CreateEitherOrQuestionResponse,
  CreateMultipleChoiceQuestionRequest,
  CreateMultipleChoiceQuestionResponse,
  CreateScaleQuestionRequest,
  CreateScaleQuestionResponse,
  CreateSubjectiveQuestionRequest,
  CreateSubjectiveQuestionResponse,
} from "@/types/dto";

function toMultipleChoiceInput(
  dto: CreateMultipleChoiceQuestionRequest,
): CreateMultipleChoiceInput {
  return {
    missionId: dto.surveyId,
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

function toScaleInput(dto: CreateScaleQuestionRequest): CreateScaleInput {
  return {
    missionId: dto.surveyId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

function toSubjectiveInput(dto: CreateSubjectiveQuestionRequest): CreateSubjectiveInput {
  return {
    missionId: dto.surveyId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

function toEitherOrInput(dto: CreateEitherOrQuestionRequest): CreateEitherOrInput {
  return {
    missionId: dto.surveyId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

export async function createMultipleChoiceAction(
  request: CreateMultipleChoiceQuestionRequest,
): Promise<CreateMultipleChoiceQuestionResponse> {
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
  request: CreateScaleQuestionRequest,
): Promise<CreateScaleQuestionResponse> {
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
  request: CreateSubjectiveQuestionRequest,
): Promise<CreateSubjectiveQuestionResponse> {
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

export async function createEitherOrAction(
  request: CreateEitherOrQuestionRequest,
): Promise<CreateEitherOrQuestionResponse> {
  try {
    const user = await requireAuth();
    const input = toEitherOrInput(request);
    const question = await actionService.createEitherOrAction(input, user.id);
    const data = { ...question, surveyId: question.missionId };

    return { data };
  } catch (error) {
    console.error("createEitherOrAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
