import {
  type CreateRewardInput,
  type UpdateRewardInput,
  rewardInputSchema,
  rewardUpdateSchema,
} from "@/schemas/reward";
import { rewardRepository } from "@/server/repositories/reward/rewardRepository";
import { parseSchema } from "@/server/services/common/parseSchema";

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
    const validated = parseSchema(rewardInputSchema, input);
    return await this.repo.create(validated, userId);
  }

  async updateReward(rewardId: string, input: UpdateRewardInput, userId: string) {
    await this.getReward(rewardId);
    const validated = parseSchema(rewardUpdateSchema, input);
    return await this.repo.update(rewardId, validated, userId);
  }

  async deleteReward(rewardId: string): Promise<void> {
    await this.getReward(rewardId);
    await this.repo.delete(rewardId);
  }
}

export const rewardService = new RewardService();
