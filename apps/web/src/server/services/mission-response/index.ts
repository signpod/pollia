import { completeResponseInputSchema, startResponseInputSchema } from "@/schemas/mission-response";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type {
  CompleteResponseInput,
  ResponseActor,
  ResponseStats,
  StartResponseInput,
} from "./types";

export class MissionResponseService {
  constructor(
    private responseRepo = missionResponseRepository,
    private missionRepo = missionRepository,
    private actionRepo = actionRepository,
  ) {}

  async getResponseById(responseId: string, actor: string | ResponseActor) {
    const normalizedActor = this.normalizeActor(actor);
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (!this.isResponseOwner(response, normalizedActor)) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return response;
  }

  async getResponseByMissionAndUser(missionId: string, userId: string) {
    return this.responseRepo.findByMissionAndUser(missionId, userId);
  }

  async getResponseByMissionAndActor(missionId: string, actor: string | ResponseActor) {
    const normalizedActor = this.normalizeActor(actor);

    if (normalizedActor.userId) {
      return this.responseRepo.findByMissionAndUser(missionId, normalizedActor.userId);
    }

    if (normalizedActor.guestId) {
      return this.responseRepo.findByMissionAndGuest(missionId, normalizedActor.guestId);
    }

    return null;
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

  async startResponse(input: StartResponseInput, actor: string | ResponseActor) {
    const normalizedActor = this.normalizeActor(actor);
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

    const allowGuestResponse = mission.allowGuestResponse;
    const allowMultipleResponses = mission.allowMultipleResponses;
    const isGuestActor = !normalizedActor.userId && !!normalizedActor.guestId;

    if (isGuestActor && !allowGuestResponse) {
      const error = new Error("로그인이 필요한 미션입니다.");
      error.cause = 401;
      throw error;
    }

    if (isGuestActor) {
      const hasFileUploadAction = await this.actionRepo.hasFileUploadActionByMissionId(missionId);

      if (hasFileUploadAction) {
        const error = new Error("파일 업로드 문항이 포함된 미션은 로그인 후 참여할 수 있습니다.");
        error.cause = 403;
        throw error;
      }
    }

    if (mission.maxParticipants !== null && mission.maxParticipants > 0) {
      const currentParticipants = await this.responseRepo.countByMissionId(missionId);
      if (currentParticipants >= mission.maxParticipants) {
        const error = new Error("참여 정원이 마감되었어요.");
        error.cause = 403;
        throw error;
      }
    }

    if (!allowMultipleResponses) {
      const existingResponse = await this.getResponseByMissionAndActor(missionId, normalizedActor);
      if (existingResponse) {
        return existingResponse;
      }
    }

    return this.responseRepo.create({
      missionId,
      userId: normalizedActor.userId,
      guestId: normalizedActor.guestId,
    });
  }

  async completeResponse(input: CompleteResponseInput, actor: string | ResponseActor) {
    const normalizedActor = this.normalizeActor(actor);
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

    if (!this.isResponseOwner(response, normalizedActor)) {
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

  async deleteResponse(responseId: string, actor: string | ResponseActor): Promise<void> {
    const normalizedActor = this.normalizeActor(actor);
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (!this.isResponseOwner(response, normalizedActor)) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.responseRepo.delete(responseId);
  }

  async verifyResponseOwnership(
    responseId: string,
    actor: string | ResponseActor,
  ): Promise<boolean> {
    const normalizedActor = this.normalizeActor(actor);
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return this.isResponseOwner(response, normalizedActor);
  }

  private normalizeActor(actor: string | ResponseActor): Required<ResponseActor> {
    if (typeof actor === "string") {
      return { userId: actor, guestId: null };
    }

    return {
      userId: actor.userId ?? null,
      guestId: actor.guestId ?? null,
    };
  }

  private isResponseOwner(
    response: Awaited<ReturnType<typeof this.responseRepo.findById>>,
    actor: Required<ResponseActor>,
  ) {
    if (!response) {
      return false;
    }

    const responseGuestId =
      "guestId" in response ? ((response as { guestId?: string | null }).guestId ?? null) : null;

    if (actor.userId) {
      return response.userId === actor.userId;
    }

    if (actor.guestId) {
      return responseGuestId === actor.guestId;
    }

    return false;
  }
}

export const missionResponseService = new MissionResponseService();
