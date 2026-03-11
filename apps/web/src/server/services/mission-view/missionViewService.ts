import { missionRepository } from "@/server/repositories/mission/missionRepository";

export class MissionViewService {
  constructor(private missionRepo = missionRepository) {}

  async trackView(missionId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const updated = await this.missionRepo.incrementViewCount(missionId);
    return { tracked: true, viewCount: updated.viewCount };
  }
}

export const missionViewService = new MissionViewService();
