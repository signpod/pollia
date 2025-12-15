import type { PaymentType, Reward } from "@prisma/client";

export interface CreateRewardRequest {
  missionId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  paymentType: PaymentType;
  scheduledDate?: Date;
}

export interface UpdateRewardRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  paymentType?: PaymentType;
  scheduledDate?: Date;
}

export interface CreateRewardResponse {
  data: Pick<
    Reward,
    "id" | "name" | "description" | "imageUrl" | "paymentType" | "scheduledDate" | "createdAt"
  >;
}

export interface GetRewardResponse {
  data: Reward;
}

export interface GetRewardsResponse {
  data: Pick<
    Reward,
    | "id"
    | "name"
    | "description"
    | "imageUrl"
    | "paymentType"
    | "scheduledDate"
    | "paidAt"
    | "createdAt"
  >[];
}

export interface UpdateRewardResponse {
  data: Pick<
    Reward,
    "id" | "name" | "description" | "imageUrl" | "paymentType" | "scheduledDate" | "updatedAt"
  >;
}

export interface DeleteRewardResponse {
  message: string;
}
