import prisma from "@/database/utils/prisma/client";
import { decrypt, encrypt } from "@/lib/crypto";
import { missionInputSchema, missionPasswordSchema, missionUpdateSchema } from "@/schemas/mission";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import {
  type SearchSyncOutboxRepository,
  searchSyncOutboxRepository,
} from "@/server/repositories/search-sync-outbox";
import { toChoseong } from "@/server/search";
import {
  type EditorMissionDraftPayload,
  toServerEditorDraftPayload,
} from "@/types/mission-editor-draft";
import { type Mission, SearchSyncAction, SearchSyncEntityType } from "@prisma/client";
import { Prisma } from "@prisma/client";
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
    private outboxRepo: SearchSyncOutboxRepository = searchSyncOutboxRepository,
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

    const isNotStarted = mission.startDate ? mission.startDate > new Date() : false;
    const isDeadlinePassed = mission.deadline ? mission.deadline < new Date() : false;
    const isParticipantLimitReached =
      mission.maxParticipants !== null &&
      mission.maxParticipants > 0 &&
      currentParticipants >= mission.maxParticipants;

    const isClosed =
      !mission.isActive || isNotStarted || isDeadlinePassed || isParticipantLimitReached;

    return {
      mission,
      currentParticipants,
      maxParticipants: mission.maxParticipants,
      isClosed,
      isNotStarted,
      isDeadlinePassed,
      isParticipantLimitReached,
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

  async getAllMissions(options?: GetUserMissionsOptions) {
    const limit = options?.limit ?? 10;
    const missions = await this.repo.findAll({
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

    const { actionIds, ...validatedMissionData } = result.data;
    const mission = await prisma.$transaction(async tx => {
      const createdMission = await this.repo.createWithActions(
        {
          ...validatedMissionData,
          isActive: validatedMissionData.isActive ?? false,
          choseong: toChoseong(validatedMissionData.title),
          creatorId: userId,
        },
        actionIds,
        tx,
      );
      await this.outboxRepo.create(
        {
          entityType: SearchSyncEntityType.MISSION,
          entityId: createdMission.id,
          action: SearchSyncAction.CREATE,
        },
        tx,
      );

      return createdMission;
    });

    return mission;
  }

  async updateMission(
    missionId: string,
    data: UpdateMissionInput,
    userId: string,
    isAdmin = false,
  ) {
    const mission = await this.getMission(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
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

    const updateData = result.data.title
      ? { ...result.data, choseong: toChoseong(result.data.title) }
      : result.data;

    const updatedMission = await prisma.$transaction(async tx => {
      const missionForUpdate = await this.repo.update(missionId, updateData, userId, tx);
      await this.outboxRepo.create(
        {
          entityType: SearchSyncEntityType.MISSION,
          entityId: missionForUpdate.id,
          action: SearchSyncAction.UPDATE,
        },
        tx,
      );
      return missionForUpdate;
    });

    return updatedMission;
  }

  async saveEditorDraft(
    missionId: string,
    payload: EditorMissionDraftPayload | null,
    userId: string,
    isAdmin = false,
  ) {
    const mission = await this.getMission(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
      const error = new Error("수정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    if (payload === null) {
      return this.repo.update(missionId, {
        editorDraft: Prisma.DbNull,
      });
    }

    const normalizedPayload = toServerEditorDraftPayload(payload);

    return this.repo.update(missionId, {
      editorDraft: normalizedPayload as Prisma.InputJsonValue,
    } as Prisma.MissionUncheckedUpdateInput);
  }

  async deleteMission(missionId: string, userId: string, isAdmin = false): Promise<void> {
    const mission = await this.getMission(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await prisma.$transaction(async tx => {
      await this.repo.delete(missionId, tx);
      await this.outboxRepo.create(
        {
          entityType: SearchSyncEntityType.MISSION,
          entityId: mission.id,
          action: SearchSyncAction.DELETE,
        },
        tx,
      );
    });
  }

  async duplicateMission(
    missionId: string,
    userId: string,
    isAdmin = false,
  ): Promise<MissionDuplicateResult> {
    const originalMission = await this.getMission(missionId);

    if (!isAdmin && originalMission.creatorId !== userId) {
      const error = new Error("복제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const originalActions = await this.actionRepo.findDetailsByMissionId(missionId);

    const duplicateTitle = `${originalMission.title} - 복사본`;

    const duplicated = await prisma.$transaction(async tx => {
      const duplicatedMission = await this.repo.duplicateMission(
        {
          title: duplicateTitle,
          choseong: toChoseong(duplicateTitle),
          description: originalMission.description,
          target: originalMission.target,
          imageUrl: originalMission.imageUrl,
          brandLogoUrl: originalMission.brandLogoUrl,
          deadline: originalMission.deadline,
          estimatedMinutes: originalMission.estimatedMinutes,
          isActive: false,
          type: originalMission.type,
          creatorId: userId,
          entryActionId: null,
        },
        originalActions.map(action => ({
          title: action.title,
          description: action.description,
          imageUrl: action.imageUrl,
          type: action.type,
          order: action.order,
          maxSelections: action.maxSelections,
          nextActionId: null,
          nextCompletionId: null,
          options: action.options.map(opt => ({
            title: opt.title,
            description: opt.description,
            imageUrl: opt.imageUrl,
            order: opt.order,
            nextActionId: null,
            nextCompletionId: null,
          })),
        })),
        tx,
      );
      await this.outboxRepo.create(
        {
          entityType: SearchSyncEntityType.MISSION,
          entityId: duplicatedMission.id,
          action: SearchSyncAction.DUPLICATE,
        },
        tx,
      );

      return duplicatedMission;
    });

    return {
      ...duplicated,
      creatorId: userId,
    };
  }

  async setPassword(
    missionId: string,
    password: string,
    userId: string,
    isAdmin = false,
  ): Promise<void> {
    const mission = await this.getMission(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
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

  async removePassword(missionId: string, userId: string, isAdmin = false): Promise<void> {
    const mission = await this.getMission(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
      const error = new Error("비밀번호 제거 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.repo.update(missionId, { password: null });
  }

  /**
   * 미션의 비밀번호를 평문으로 반환합니다.
   * @warning 보안에 민감한 메서드입니다. Admin 전용으로만 사용하세요.
   */
  async getPassword(missionId: string, userId: string, isAdmin = false): Promise<string | null> {
    const mission = await this.getMission(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
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

  async incrementShareCount(missionId: string): Promise<void> {
    await this.getMission(missionId);
    await this.repo.incrementShareCount(missionId);
  }
}

export const missionService = new MissionService();
