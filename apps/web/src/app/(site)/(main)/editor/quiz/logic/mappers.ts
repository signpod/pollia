import type { CreateMissionRequest, CreateRewardRequest, UpdateMissionRequest } from "@/types/dto";
import { MissionCategory, MissionType } from "@prisma/client";
import type { CreateQuizMissionFormData } from "../schema";

export function mapCreateQuizMissionRequest(
  formData: CreateQuizMissionFormData,
): CreateMissionRequest {
  return {
    title: formData.title,
    type: MissionType.GENERAL,
    category: MissionCategory.QUIZ,
    actionIds: [],
    description: formData.description || undefined,
    imageUrl: formData.imageUrl ?? null,
    imageFileUploadId: formData.imageFileUploadId ?? null,
    brandLogoUrl: formData.brandLogoUrl ?? null,
    brandLogoFileUploadId: formData.brandLogoFileUploadId ?? null,
    estimatedMinutes: null,
    startDate: formData.startDate ?? null,
    deadline: formData.deadline ?? null,
    maxParticipants: null,
    isActive: false,
    eventId: null,
    quizConfig: formData.quizConfig,
  };
}

export function mapQuizIntroUpdateRequest(
  formData: CreateQuizMissionFormData,
): UpdateMissionRequest {
  return {
    allowGuestResponse: formData.allowGuestResponse,
    allowMultipleResponses: formData.allowMultipleResponses,
    startDate: formData.startDate ?? null,
    deadline: formData.deadline ?? null,
  };
}

export function mapQuizCreateRewardRequest(
  missionId: string,
  formData: CreateQuizMissionFormData,
): CreateRewardRequest {
  if (!formData.hasReward) {
    throw new Error("리워드가 비활성화된 상태입니다.");
  }

  return {
    missionId,
    name: formData.reward.name,
    description: formData.reward.description,
    imageUrl: formData.reward.imageUrl ?? undefined,
    imageFileUploadId: formData.reward.imageFileUploadId ?? undefined,
    paymentType: formData.reward.paymentType,
    scheduledDate: formData.reward.scheduledDate,
  };
}
