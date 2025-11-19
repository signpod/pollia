import type { PaymentType, Reward } from "@prisma/client";

// ==================== Request DTOs ====================

/**
 * Reward 생성 요청 DTO
 */
export interface CreateRewardRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  paymentType: PaymentType;
  scheduledDate?: Date;
}

/**
 * Reward 수정 요청 DTO
 */
export interface UpdateRewardRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  paymentType?: PaymentType;
  scheduledDate?: Date;
}

// ==================== Response DTOs ====================

/**
 * Reward 생성 응답 DTO
 */
export interface CreateRewardResponse {
  data: Pick<
    Reward,
    "id" | "name" | "description" | "imageUrl" | "paymentType" | "scheduledDate" | "createdAt"
  >;
}

/**
 * Reward 단일 조회 응답 DTO
 */
export interface GetRewardResponse {
  data: Reward;
}

/**
 * Reward 목록 조회 응답 DTO
 */
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

/**
 * Reward 수정 응답 DTO
 */
export interface UpdateRewardResponse {
  data: Pick<
    Reward,
    "id" | "name" | "description" | "imageUrl" | "paymentType" | "scheduledDate" | "updatedAt"
  >;
}

/**
 * Reward 삭제 응답 DTO
 */
export interface DeleteRewardResponse {
  message: string;
}
