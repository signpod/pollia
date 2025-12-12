"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type {
  CreateImageInput,
  CreateMultipleChoiceInput,
  CreateRatingInput,
  CreateScaleInput,
  CreateSubjectiveInput,
  CreateTagInput,
} from "@/server/services/action/types";
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
    options: dto.options.map(opt => ({
      title: opt.title,
      description: opt.description,
      imageUrl: opt.imageUrl,
      order: opt.order,
      imageFileUploadId: opt.imageFileUploadId,
    })),
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

function toTagInput(dto: CreateTagActionRequest): CreateTagInput {
  return {
    missionId: dto.missionId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
    order: dto.order,
    maxSelections: dto.maxSelections,
    options: dto.options.map(opt => ({
      title: opt.title,
      description: opt.description,
      imageUrl: opt.imageUrl,
      order: opt.order,
      imageFileUploadId: opt.imageFileUploadId,
    })),
  };
}

function toRatingInput(dto: CreateRatingActionRequest): CreateRatingInput {
  return {
    missionId: dto.missionId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
    order: dto.order,
  };
}

function toImageInput(dto: CreateImageActionRequest): CreateImageInput {
  return {
    missionId: dto.missionId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
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

export async function createTagAction(
  request: CreateTagActionRequest,
): Promise<CreateTagActionResponse> {
  try {
    const user = await requireAuth();
    const input = toTagInput(request);
    const question = await actionService.createTagAction(input, user.id);

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
    const input = toRatingInput(request);
    const question = await actionService.createRatingAction(input, user.id);

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
    const input = toImageInput(request);
    const question = await actionService.createImageAction(input, user.id);

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
