import type { UpdateMissionRequest } from "@/types/dto";
import type { CreateMissionRequest, CreateRewardRequest } from "@/types/dto";
import { MissionType } from "@prisma/client";
import type { CreateMissionFormData } from "../schema";

export function mapCreateMissionRequest(formData: CreateMissionFormData): CreateMissionRequest {
  if (formData.creationMode !== "custom") {
    throw new Error("현재는 자유롭게 만들기만 지원합니다.");
  }

  if (!formData.category) {
    throw new Error("카테고리를 선택해주세요.");
  }

  return {
    title: formData.title,
    type: MissionType.GENERAL,
    category: formData.category,
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
  };
}

export function mapIntroUpdateRequest(formData: CreateMissionFormData): UpdateMissionRequest {
  return {
    allowGuestResponse: formData.allowGuestResponse,
    allowMultipleResponses: formData.allowMultipleResponses,
    useAiCompletion: formData.useAiCompletion,
    startDate: formData.startDate ?? null,
    deadline: formData.deadline ?? null,
  };
}

export function mapCreateRewardRequest(
  missionId: string,
  formData: CreateMissionFormData,
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
