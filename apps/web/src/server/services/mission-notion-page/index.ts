import { missionNotionPageRepository } from "@/server/repositories/mission-notion-page/missionNotionPageRepository";
import type { UpsertNotionPageInput } from "./types";

export class MissionNotionPageService {
  constructor(private repo = missionNotionPageRepository) {}

  async getByMissionId(missionId: string) {
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
