import prisma from "@/database/utils/prisma/client";
import { missionLikeRepository } from "@/server/repositories/mission-like/missionLikeRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";

export class MissionLikeService {
  constructor(
    private likeRepo = missionLikeRepository,
    private missionRepo = missionRepository,
  ) {}

  async toggleLike(missionId: string, userId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return prisma.$transaction(async tx => {
      const existing = await this.likeRepo.findByMissionAndUser(missionId, userId, tx);

      if (existing) {
        await this.likeRepo.deleteByMissionAndUser(missionId, userId, tx);
        const updated = await this.missionRepo.updateLikesCount(missionId, -1, tx);
        return { liked: false, likesCount: updated.likesCount };
      }

      await this.likeRepo.create(missionId, userId, tx);
      const updated = await this.missionRepo.updateLikesCount(missionId, 1, tx);
      return { liked: true, likesCount: updated.likesCount };
    });
  }

  async isLiked(missionId: string, userId: string) {
    const like = await this.likeRepo.findByMissionAndUser(missionId, userId);
    return !!like;
  }

  async getLikedMissions(userId: string) {
    const likedRows = await this.likeRepo.findManyByUserId(userId);
    return likedRows.map(row => row.mission);
  }

  async getLikesCount(missionId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) return 0;
    return mission.likesCount;
  }
}

export const missionLikeService = new MissionLikeService();
