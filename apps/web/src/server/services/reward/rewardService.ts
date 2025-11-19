import { rewardRepository } from "@/server/repositories/reward/rewardRepository";
import type {
  CreateRewardResponse,
  GetRewardResponse,
  GetRewardsResponse,
  UpdateRewardResponse,
} from "@/types/dto";
import type { PaymentType } from "@prisma/client";

/**
 * Reward Service
 * Reward 도메인의 비즈니스 로직 계층
 */
export class RewardService {
  constructor(private repo = rewardRepository) {}

  /**
   * Reward ID로 Reward 정보 조회
   * @param rewardId - Reward ID
   * @returns Reward 정보
   * @throws 404 - Reward를 찾을 수 없는 경우
   */
  async getReward(rewardId: string): Promise<GetRewardResponse["data"]> {
    const reward = await this.repo.findById(rewardId);

    if (!reward) {
      const error = new Error("Reward를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return reward;
  }

  /**
   * 모든 Reward 목록 조회
   * @returns Reward 목록
   */
  async getRewards(): Promise<GetRewardsResponse["data"]> {
    return await this.repo.findMany();
  }

  /**
   * Reward 생성
   * @param data - 생성할 Reward 데이터
   * @returns 생성된 Reward 정보
   * @throws 400 - 유효성 검증 실패
   */
  async createReward(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    paymentType: PaymentType;
    scheduledDate?: Date;
  }): Promise<CreateRewardResponse["data"]> {
    // Validation
    this.validateRewardData(data);

    return await this.repo.create(data);
  }

  /**
   * Reward 수정
   * @param rewardId - Reward ID
   * @param data - 수정할 Reward 데이터
   * @returns 수정된 Reward 정보
   * @throws 404 - Reward를 찾을 수 없는 경우
   * @throws 400 - 유효성 검증 실패
   */
  async updateReward(
    rewardId: string,
    data: {
      name?: string;
      description?: string;
      imageUrl?: string;
      paymentType?: PaymentType;
      scheduledDate?: Date;
    },
  ): Promise<UpdateRewardResponse["data"]> {
    // Reward 존재 확인
    await this.getReward(rewardId);

    // Validation (수정할 데이터만 검증)
    if (data.name !== undefined) {
      this.validateName(data.name);
    }

    if (data.paymentType !== undefined) {
      this.validatePaymentType(data.paymentType, data.scheduledDate);
    }

    return await this.repo.update(rewardId, data);
  }

  /**
   * Reward 삭제
   * @param rewardId - Reward ID
   * @throws 404 - Reward를 찾을 수 없는 경우
   */
  async deleteReward(rewardId: string): Promise<void> {
    // Reward 존재 확인
    await this.getReward(rewardId);

    await this.repo.delete(rewardId);
  }

  /**
   * Reward 데이터 유효성 검증
   * @param data - 검증할 Reward 데이터
   * @throws 400 - 유효성 검증 실패
   */
  private validateRewardData(data: {
    name: string;
    paymentType: PaymentType;
    scheduledDate?: Date;
  }): void {
    this.validateName(data.name);
    this.validatePaymentType(data.paymentType, data.scheduledDate);
  }

  /**
   * 보상 이름 유효성 검증
   * @param name - 보상 이름
   * @throws 400 - 유효성 검증 실패
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      const error = new Error("Reward 이름은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (name.length > 100) {
      const error = new Error("Reward 이름은 100자를 초과할 수 없습니다.");
      error.cause = 400;
      throw error;
    }
  }

  /**
   * 지급 유형 및 예약 일시 유효성 검증
   * @param paymentType - 지급 유형
   * @param scheduledDate - 예약 일시
   * @throws 400 - 유효성 검증 실패
   */
  private validatePaymentType(paymentType: PaymentType, scheduledDate?: Date): void {
    if (paymentType === "SCHEDULED" && !scheduledDate) {
      const error = new Error("예약 지급의 경우 예약 일시는 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (paymentType === "SCHEDULED" && scheduledDate) {
      const now = new Date();
      if (scheduledDate <= now) {
        const error = new Error("예약 일시는 현재 시간보다 이후여야 합니다.");
        error.cause = 400;
        throw error;
      }
    }
  }
}

export const rewardService = new RewardService();
