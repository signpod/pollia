import { rewardRepository } from "@/server/repositories/reward/rewardRepository";
import type { PaymentType } from "@prisma/client";
import type { CreateRewardInput, UpdateRewardInput } from "./types";

export class RewardService {
  constructor(private repo = rewardRepository) {}

  async getReward(rewardId: string) {
    const reward = await this.repo.findById(rewardId);

    if (!reward) {
      const error = new Error("Reward를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return reward;
  }

  async getRewards() {
    return await this.repo.findMany();
  }

  async createReward(input: CreateRewardInput) {
    this.validateRewardData(input);
    return await this.repo.create(input);
  }

  async updateReward(rewardId: string, input: UpdateRewardInput) {
    await this.getReward(rewardId);

    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    if (input.paymentType !== undefined) {
      this.validatePaymentType(input.paymentType, input.scheduledDate);
    }

    return await this.repo.update(rewardId, input);
  }

  async deleteReward(rewardId: string): Promise<void> {
    await this.getReward(rewardId);
    await this.repo.delete(rewardId);
  }

  private validateRewardData(data: {
    name: string;
    paymentType: PaymentType;
    scheduledDate?: Date;
  }): void {
    this.validateName(data.name);
    this.validatePaymentType(data.paymentType, data.scheduledDate);
  }

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
