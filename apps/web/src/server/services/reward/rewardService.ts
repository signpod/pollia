import { rewardInputSchema, rewardUpdateSchema } from "@/schemas/reward";
import { rewardRepository } from "@/server/repositories/reward/rewardRepository";
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

  async createReward(input: CreateRewardInput, userId: string) {
    const result = rewardInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    return await this.repo.create(result.data, userId);
  }

  async updateReward(rewardId: string, input: UpdateRewardInput, userId: string) {
    await this.getReward(rewardId);

    const result = rewardUpdateSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    return await this.repo.update(rewardId, result.data, userId);
  }

  async deleteReward(rewardId: string): Promise<void> {
    await this.getReward(rewardId);
    await this.repo.delete(rewardId);
  }
}

export const rewardService = new RewardService();
