import {
  surveyInputSchema as missionInputSchema,
  surveyUpdateSchema as missionUpdateSchema,
} from "@/schemas/survey";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type {
  CreateMissionInput,
  GetUserMissionsOptions,
  MissionCreatedResult,
  UpdateMissionInput,
} from "./types";

export class MissionService {
  constructor(private repo = missionRepository) {}

  async getMission(missionId: string) {
    const mission = await this.repo.findById(missionId);

    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return mission;
  }

  async getMissionActionIds(missionId: string) {
    await this.getMission(missionId);
    const actionIds = await this.repo.findActionIdsByMissionId(missionId);
    return { actionIds };
  }

  async getActionById(actionId: string) {
    const action = await this.repo.findActionById(actionId);

    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return action;
  }

  async getMissionActionsDetail(missionId: string) {
    await this.getMission(missionId);
    const actions = await this.repo.findActionsByMissionId(missionId);
    return actions;
  }

  async getUserMissions(userId: string, options?: GetUserMissionsOptions) {
    const limit = options?.limit ?? 10;
    const missions = await this.repo.findByUserId(userId, {
      ...options,
      limit,
    });

    if (missions.length > limit) {
      missions.pop();
    }

    return missions;
  }

  async createMission(input: CreateMissionInput, userId: string): Promise<MissionCreatedResult> {
    const result = missionInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const validated = result.data;
    const mission = await this.repo.createWithActions(
      {
        title: validated.title,
        description: validated.description,
        target: validated.target,
        imageUrl: validated.imageUrl,
        deadline: validated.deadline,
        estimatedMinutes: validated.estimatedMinutes,
        creatorId: userId,
      },
      validated.questionIds,
    );

    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      target: mission.target,
      imageUrl: mission.imageUrl,
      deadline: mission.deadline,
      estimatedMinutes: mission.estimatedMinutes,
      createdAt: mission.createdAt,
      updatedAt: mission.updatedAt,
      creatorId: userId,
    };
  }

  async updateMission(missionId: string, data: UpdateMissionInput, userId: string) {
    const mission = await this.getMission(missionId);

    if (mission.creatorId !== userId) {
      const error = new Error("수정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const result = missionUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const updatedMission = await this.repo.update(missionId, result.data);
    return updatedMission;
  }

  async deleteMission(missionId: string, userId: string): Promise<void> {
    const mission = await this.getMission(missionId);

    if (mission.creatorId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.repo.delete(missionId);
  }
}

export const missionService = new MissionService();
