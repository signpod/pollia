import {
  missionCompletionInputSchema,
  missionCompletionUpdateSchema,
} from "@/schemas/mission-completion";
import { missionCompletionRepository } from "@/server/repositories/mission-completion/missionCompletionRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type { CreateMissionCompletionInput, UpdateMissionCompletionInput } from "./types";

export class MissionCompletionService {
  constructor(
    private repo = missionCompletionRepository,
    private missionRepo = missionRepository,
  ) {}

  async getMissionCompletion(missionId: string) {
    const missionCompletion = await this.repo.findByMissionId(missionId);

    if (!missionCompletion) {
      const error = new Error("미션 완료 데이터를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return missionCompletion;
  }

  async createMissionCompletion(input: CreateMissionCompletionInput, userId: string) {
    const mission = await this.missionRepo.findById(input.missionId);

    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (mission.creatorId !== userId) {
      const error = new Error("생성 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const existingCompletion = await this.repo.findByMissionId(input.missionId);
    if (existingCompletion) {
      const error = new Error("이미 미션 완료 데이터가 존재합니다.");
      error.cause = 409;
      throw error;
    }

    const result = missionCompletionInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    return await this.repo.create(result.data, userId);
  }

  async updateMissionCompletion(id: string, input: UpdateMissionCompletionInput, userId: string) {
    const missionCompletion = await this.repo.findById(id);

    if (!missionCompletion) {
      const error = new Error("미션 완료 데이터를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (missionCompletion.mission.creatorId !== userId) {
      const error = new Error("수정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const result = missionCompletionUpdateSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    return await this.repo.update(id, result.data, userId);
  }

  async deleteMissionCompletion(id: string, userId: string): Promise<void> {
    const missionCompletion = await this.repo.findById(id);

    if (!missionCompletion) {
      const error = new Error("미션 완료 데이터를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (missionCompletion.mission.creatorId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.repo.delete(id);
  }
}

export const missionCompletionService = new MissionCompletionService();
