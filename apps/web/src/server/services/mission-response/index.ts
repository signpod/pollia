import { completeResponseInputSchema, startResponseInputSchema } from "@/schemas/mission-response";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type { CompleteResponseInput, ResponseStats, StartResponseInput } from "./types";

export class MissionResponseService {
  constructor(
    private responseRepo = missionResponseRepository,
    private missionRepo = missionRepository,
  ) {}

  async getResponseById(responseId: string, userId: string) {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return response;
  }

  async getResponseByMissionAndUser(missionId: string, userId: string) {
    return this.responseRepo.findByMissionAndUser(missionId, userId);
  }

  async getUserResponses(userId: string) {
    return this.responseRepo.findByUserId(userId);
  }

  async getMissionResponses(missionId: string, userId: string) {
    const mission = await this.missionRepo.findById(missionId);

    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (mission.creatorId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return this.responseRepo.findByMissionId(missionId);
  }

  async getMissionStats(missionId: string, userId: string): Promise<ResponseStats> {
    const mission = await this.missionRepo.findById(missionId);

    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (mission.creatorId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const total = await this.responseRepo.countByMissionId(missionId);
    const completed = await this.responseRepo.countCompletedByMissionId(missionId);

    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  async startResponse(input: StartResponseInput, userId: string) {
    const parseResult = startResponseInputSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const missionId = parseResult.data.missionId;

    const mission = await this.missionRepo.findById(missionId);

    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (!mission.isActive) {
      const error = new Error("종료된 미션입니다.");
      error.cause = 400;
      throw error;
    }

    const existingResponse = await this.responseRepo.findByMissionAndUser(missionId, userId);
    if (existingResponse) {
      return existingResponse;
    }

    return this.responseRepo.create({
      missionId,
      userId,
    });
  }

  async completeResponse(input: CompleteResponseInput, userId: string) {
    const parseResult = completeResponseInputSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const response = await this.responseRepo.findById(parseResult.data.responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("완료 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    if (response.completedAt) {
      const error = new Error("이미 완료된 응답입니다.");
      error.cause = 400;
      throw error;
    }

    return this.responseRepo.updateCompletedAt(parseResult.data.responseId);
  }

  async deleteResponse(responseId: string, userId: string): Promise<void> {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.responseRepo.delete(responseId);
  }

  async verifyResponseOwnership(responseId: string, userId: string): Promise<boolean> {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return response.userId === userId;
  }
}

export const missionResponseService = new MissionResponseService();
