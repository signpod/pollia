import { missionNotionPageRepository } from "@/server/repositories/mission-notion-page/missionNotionPageRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type { UpsertNotionPageInput } from "./types";

export class MissionNotionPageService {
  constructor(
    private repo = missionNotionPageRepository,
    private missionRepo = missionRepository,
  ) {}

  async getByMissionId(missionId: string) {
    return this.repo.findByMissionId(missionId);
  }

  async getByMissionIdWithAuth(missionId: string, userId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (mission.creatorId !== userId) {
      const error = new Error("노션 리포트 조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return this.repo.findByMissionId(missionId);
  }

  async upsertNotionPage(missionId: string, input: UpsertNotionPageInput) {
    return this.repo.upsert(missionId, {
      ...input,
      lastSyncedAt: new Date(),
    });
  }

  async deleteByMissionId(missionId: string) {
    const existing = await this.repo.findByMissionId(missionId);
    if (!existing) {
      return;
    }
    await this.repo.delete(missionId);
  }
}

export const missionNotionPageService = new MissionNotionPageService();
