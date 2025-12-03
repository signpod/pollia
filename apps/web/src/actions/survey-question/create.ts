"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionService } from "@/server/services/action";
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
    surveyId: dto.surveyId,
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
    surveyId: dto.surveyId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

function toSubjectiveInput(dto: CreateSubjectiveQuestionRequest): CreateSubjectiveInput {
  return {
    surveyId: dto.surveyId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

function toEitherOrInput(dto: CreateEitherOrQuestionRequest): CreateEitherOrInput {
  return {
    surveyId: dto.surveyId,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
  };
}

export async function createMultipleChoiceQuestion(
  request: CreateMultipleChoiceQuestionRequest,
): Promise<CreateMultipleChoiceQuestionResponse> {
  try {
    const user = await requireAuth();
    const input = toMultipleChoiceInput(request);
    const question = await surveyQuestionService.createMultipleChoiceQuestion(input, user.id);
    return { data: question };
  } catch (error) {
    console.error("createMultipleChoiceQuestion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createScaleQuestion(
  request: CreateScaleQuestionRequest,
): Promise<CreateScaleQuestionResponse> {
  try {
    const user = await requireAuth();
    const input = toScaleInput(request);
    const question = await surveyQuestionService.createScaleQuestion(input, user.id);
    return { data: question };
  } catch (error) {
    console.error("createScaleQuestion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createSubjectiveQuestion(
  request: CreateSubjectiveQuestionRequest,
): Promise<CreateSubjectiveQuestionResponse> {
  try {
    const user = await requireAuth();
    const input = toSubjectiveInput(request);
    const question = await surveyQuestionService.createSubjectiveQuestion(input, user.id);
    return { data: question };
  } catch (error) {
    console.error("createSubjectiveQuestion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createEitherOrQuestion(
  request: CreateEitherOrQuestionRequest,
): Promise<CreateEitherOrQuestionResponse> {
  try {
    const user = await requireAuth();
    const input = toEitherOrInput(request);
    const question = await surveyQuestionService.createEitherOrQuestion(input, user.id);
    return { data: question };
  } catch (error) {
    console.error("createEitherOrQuestion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
