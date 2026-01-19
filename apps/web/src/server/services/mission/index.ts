import { decrypt, encrypt } from "@/lib/crypto";
import { missionInputSchema, missionPasswordSchema, missionUpdateSchema } from "@/schemas/mission";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type { Mission } from "@prisma/client";
import type {
  CreateMissionInput,
  GetUserMissionsOptions,
  MissionDuplicateResult,
  MissionWithParticipantInfo,
  UpdateMissionInput,
} from "./types";

export class MissionService {
  constructor(
    private repo = missionRepository,
    private responseRepo = missionResponseRepository,
    private actionRepo = actionRepository,
  ) {}

  async getMission(missionId: string) {
    const mission = await this.repo.findById(missionId);

    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return mission;
  }

  async getMissionWithParticipantInfo(missionId: string): Promise<MissionWithParticipantInfo> {
    const mission = await this.getMission(missionId);
    const currentParticipants = await this.responseRepo.countByMissionId(missionId);

    const isDeadlinePassed = mission.deadline ? mission.deadline < new Date() : false;
    const isParticipantLimitReached =
      mission.maxParticipants !== null &&
      mission.maxParticipants > 0 &&
      currentParticipants >= mission.maxParticipants;

    const isClosed = !mission.isActive || isDeadlinePassed || isParticipantLimitReached;

    return {
      currentParticipants,
      maxParticipants: mission.maxParticipants,
      isClosed,
    };
  }

  async checkParticipantLimit(missionId: string): Promise<void> {
    const mission = await this.getMission(missionId);

    if (mission.maxParticipants === null || mission.maxParticipants <= 0) {
      return;
    }

    const currentParticipants = await this.responseRepo.countByMissionId(missionId);

    if (currentParticipants >= mission.maxParticipants) {
      const error = new Error("참여 정원이 마감되었어요.");
      error.cause = 403;
      throw error;
    }
  }

  async getMissionActionIds(missionId: string) {
    await this.getMission(missionId);
    const actionIds = await this.actionRepo.findActionIdsByMissionId(missionId);
    return { actionIds };
  }

  async getActionById(actionId: string) {
    const action = await this.actionRepo.findById(actionId);

    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return action;
  }

  async getMissionActionsDetail(missionId: string) {
    await this.getMission(missionId);
    const actions = await this.actionRepo.findDetailsByMissionId(missionId);
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

  async createMission(input: CreateMissionInput, userId: string): Promise<Mission> {
    const result = missionInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const validated = result.data;
    const mission = await this.repo.createWithActions(
      {
        ...validated,
        creatorId: userId,
      },
      validated.actionIds,
    );

    return mission;
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

    const updatedMission = await this.repo.update(missionId, result.data, userId);
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

  async duplicateMission(missionId: string, userId: string): Promise<MissionDuplicateResult> {
    const originalMission = await this.getMission(missionId);

    if (originalMission.creatorId !== userId) {
      const error = new Error("복제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const originalActions = await this.actionRepo.findDetailsByMissionId(missionId);

    const duplicated = await this.repo.duplicateMission(
      {
        title: `${originalMission.title} - 복사본`,
        description: originalMission.description,
        target: originalMission.target,
        imageUrl: originalMission.imageUrl,
        brandLogoUrl: originalMission.brandLogoUrl,
        deadline: originalMission.deadline,
        estimatedMinutes: originalMission.estimatedMinutes,
        isActive: false,
        type: originalMission.type,
        creatorId: userId,
      },
      originalActions.map(action => ({
        title: action.title,
        description: action.description,
        imageUrl: action.imageUrl,
        type: action.type,
        order: action.order,
        maxSelections: action.maxSelections,
        options: action.options.map(opt => ({
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          order: opt.order,
        })),
      })),
    );

    return {
      ...duplicated,
      creatorId: userId,
    };
  }

  async setPassword(missionId: string, password: string, userId: string): Promise<void> {
    const mission = await this.getMission(missionId);

    if (mission.creatorId !== userId) {
      const error = new Error("비밀번호 설정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const result = missionPasswordSchema.safeParse({ password });
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const encryptedPassword = encrypt(result.data.password);
    await this.repo.update(missionId, { password: encryptedPassword });
  }

  async removePassword(missionId: string, userId: string): Promise<void> {
    const mission = await this.getMission(missionId);

    if (mission.creatorId !== userId) {
      const error = new Error("비밀번호 제거 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.repo.update(missionId, { password: null });
  }

  /**
   * 미션의 비밀번호를 평문으로 반환합니다.
   * @warning 보안에 민감한 메서드입니다. Admin/Creator 전용으로만 사용하세요.
   * @param missionId - 미션 ID
   * @param userId - 요청한 사용자 ID (Creator만 가능)
   * @returns 복호화된 비밀번호 또는 null
   */
  async getPassword(missionId: string, userId: string): Promise<string | null> {
    const mission = await this.getMission(missionId);

    if (mission.creatorId !== userId) {
      const error = new Error("비밀번호 조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    if (!mission.password) {
      return null;
    }

    return decrypt(mission.password);
  }

  async verifyPassword(missionId: string, password: string): Promise<boolean> {
    const mission = await this.getMission(missionId);

    if (!mission.password) {
      return true;
    }

    const decryptedPassword = decrypt(mission.password);
    return decryptedPassword === password;
  }
}

export const missionService = new MissionService();
