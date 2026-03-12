import { completeResponseInputSchema, startResponseInputSchema } from "@/schemas/mission-response";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionCompletionInferenceCacheRepository } from "@/server/repositories/mission-completion-inference-cache/missionCompletionInferenceCacheRepository";
import { missionCompletionStatRepository } from "@/server/repositories/mission-completion-stat/missionCompletionStatRepository";
import { missionCompletionRepository } from "@/server/repositories/mission-completion/missionCompletionRepository";
import {
  type MissionResponseRepository,
  missionResponseRepository,
} from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type { Prisma } from "@prisma/client";
import { type AiService, aiService } from "../ai";
import { buildCompletionInferenceInput } from "./buildCompletionInferenceInput";
import { buildCompletionInferencePrompt } from "./buildCompletionInferencePrompt";
import type {
  CompletionInferenceInput,
  CompletionInferenceRawAnswer,
} from "./completionInferenceTypes";
import { hashCompletionInferenceFingerprint } from "./hashCompletionInferenceFingerprint";
import {
  type CleanupAbuseMetaResult,
  type CompleteResponseInput,
  type DailyParticipationTrendItem,
  type DateRange,
  type GetMissionResponsesPageOptions,
  type MissionResponsesPageResult,
  type ResponseActor,
  type ResponseRequestMeta,
  type ResponseStats,
  type StartResponseInput,
  isResponseOwner,
  normalizeActor,
} from "./types";

const ABUSE_LOG_RETENTION_DAYS = 90;
const AI_COMPLETION_LOG_PREFIX = "[AI completion inference]";

export class MissionResponseService {
  constructor(
    private responseRepo = missionResponseRepository,
    private missionRepo = missionRepository,
    private actionRepo = actionRepository,
    private completionRepo = missionCompletionRepository,
    private inferenceCacheRepo = missionCompletionInferenceCacheRepository,
    private aiClient: AiService = aiService,
    private completionStatRepo = missionCompletionStatRepository,
  ) {}

  async getResponseById(responseId: string, actor: string | ResponseActor) {
    const normalizedActor = normalizeActor(actor);
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (!isResponseOwner(response, normalizedActor)) {
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
    const normalizedActor = normalizeActor(actor);

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

  private async requireMissionOwnership(missionId: string, userId: string) {
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

    return mission;
  }

  async getMissionResponses(
    missionId: string,
    userId: string,
    options?: { membersOnly?: boolean },
  ) {
    await this.requireMissionOwnership(missionId, userId);
    return this.responseRepo.findByMissionId(missionId, options);
  }

  async getMissionStats(
    missionId: string,
    userId: string,
    dateRange?: DateRange,
  ): Promise<ResponseStats> {
    const mission = await this.requireMissionOwnership(missionId, userId);

    const [total, completed, averageDurationMs, completionsResult, completionStatsResult] =
      await Promise.all([
        this.responseRepo.countByMissionId(missionId),
        this.responseRepo.countCompletedByMissionIdWithDateRange(missionId, dateRange),
        this.responseRepo.getAverageDurationMs(missionId, dateRange),
        this.completionRepo.findAllByMissionId(missionId),
        this.completionStatRepo.findByMissionId(missionId),
      ]);

    const completions = completionsResult ?? [];
    const completionStats = completionStatsResult ?? [];
    const encounterCountByCompletionId = new Map(
      completionStats.map(stat => [stat.missionCompletionId, stat.encounterCount] as const),
    );

    const completionReachStats = [...completions]
      .sort((left, right) => {
        const leftCount = encounterCountByCompletionId.get(left.id) ?? 0;
        const rightCount = encounterCountByCompletionId.get(right.id) ?? 0;
        if (leftCount !== rightCount) {
          return rightCount - leftCount;
        }
        return left.createdAt.getTime() - right.createdAt.getTime();
      })
      .map(completion => {
        const encounterCount = encounterCountByCompletionId.get(completion.id) ?? 0;
        const reachRate = completed > 0 ? (encounterCount / completed) * 100 : 0;

        return {
          completionId: completion.id,
          completionTitle: completion.title,
          encounterCount,
          reachRate,
        };
      });

    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageDurationMs,
      shareCount: mission.shareCount,
      completionReachStats,
    };
  }

  async getDailyParticipationTrend(
    missionId: string,
    userId: string,
    dateRange?: DateRange,
  ): Promise<DailyParticipationTrendItem[]> {
    await this.requireMissionOwnership(missionId, userId);
    return this.responseRepo.groupByStartedAtDate(missionId, dateRange);
  }

  async getMissionResponsesPage(
    missionId: string,
    userId: string,
    options: GetMissionResponsesPageOptions,
  ): Promise<
    MissionResponsesPageResult<
      Awaited<ReturnType<MissionResponseRepository["findByMissionIdPaged"]>>[number]
    >
  > {
    await this.requireMissionOwnership(missionId, userId);

    const [responses, totalRows] = await Promise.all([
      this.responseRepo.findByMissionIdPaged(missionId, options),
      this.responseRepo.countByMissionIdFiltered(missionId, { membersOnly: options.membersOnly }),
    ]);

    return {
      responses,
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        totalRows,
        totalPages: Math.ceil(totalRows / options.pageSize),
      },
    };
  }

  async startResponse(input: StartResponseInput, actor: string | ResponseActor) {
    const normalizedActor = normalizeActor(actor);
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

  async completeResponse(
    input: CompleteResponseInput,
    actor: string | ResponseActor,
    requestMeta?: ResponseRequestMeta,
  ) {
    const normalizedActor = normalizeActor(actor);
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

    if (!isResponseOwner(response, normalizedActor)) {
      const error = new Error("완료 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    if (response.completedAt) {
      const error = new Error("이미 완료된 응답입니다.");
      error.cause = 400;
      throw error;
    }

    const completions = await this.completionRepo.findAllByMissionId(response.missionId);
    const firstCompletion = completions[0];
    if (!firstCompletion) {
      const error = new Error("미션 완료 데이터를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const completionIdSet = new Set(completions.map(completion => completion.id));
    const branchCompletionId = this.resolveBranchCompletionId(response.answers);

    let selectedCompletionId: string;

    if (branchCompletionId) {
      if (!completionIdSet.has(branchCompletionId)) {
        const error = new Error("분기 완료화면이 미션에 존재하지 않습니다.");
        error.cause = 400;
        throw error;
      }
      selectedCompletionId = branchCompletionId;
    } else if (response.mission.useAiCompletion === true) {
      selectedCompletionId = await this.resolveCompletionIdByAi({
        missionId: response.missionId,
        missionTitle: response.mission.title,
        completions: completions.map(completion => ({
          id: completion.id,
          title: completion.title,
          description: completion.description,
        })),
        rawAnswers: response.answers,
        fallbackCompletionId: firstCompletion.id,
      });
    } else {
      selectedCompletionId = firstCompletion.id;
    }

    if (!completionIdSet.has(selectedCompletionId)) {
      const error = new Error("완료화면이 미션에 존재하지 않습니다.");
      error.cause = 400;
      throw error;
    }

    const completedAt = new Date();
    const latestCompletedAt = await this.responseRepo.findLatestCompletedAtByActor({
      missionId: response.missionId,
      userId: normalizedActor.userId,
      guestId: normalizedActor.guestId,
    });

    const submissionIntervalSeconds = latestCompletedAt
      ? Math.max(0, Math.floor((completedAt.getTime() - latestCompletedAt.getTime()) / 1000))
      : null;

    const completedResponse = await this.responseRepo.completeWithSelectionAndAbuseMeta(
      parseResult.data.responseId,
      {
        missionId: response.missionId,
        selectedCompletionId,
        completedAt,
        ipAddress: requestMeta?.ipAddress ?? null,
        userAgent: requestMeta?.userAgent ?? null,
        submissionIntervalSeconds,
      },
    );

    if (!completedResponse) {
      const error = new Error("이미 완료된 응답입니다.");
      error.cause = 400;
      throw error;
    }

    return completedResponse;
  }

  private resolveBranchCompletionId(
    answers: Array<{
      action: { nextCompletionId: string | null; order: number | null };
      options: Array<{ nextCompletionId: string | null }>;
    }>,
  ): string | null {
    const orderedAnswers = [...answers].sort((left, right) => {
      const leftOrder = left.action.order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.action.order ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });

    let branchCompletionId: string | null = null;

    for (const answer of orderedAnswers) {
      const optionCompletionId = answer.options.find(
        option => option.nextCompletionId,
      )?.nextCompletionId;
      if (optionCompletionId) {
        branchCompletionId = optionCompletionId;
      }

      if (answer.action.nextCompletionId) {
        branchCompletionId = answer.action.nextCompletionId;
      }
    }

    return branchCompletionId;
  }

  private async resolveCompletionIdByAi(input: {
    missionId: string;
    missionTitle: string;
    completions: CompletionInferenceInput["completions"];
    rawAnswers: CompletionInferenceRawAnswer[];
    fallbackCompletionId: string;
  }): Promise<string> {
    const {
      keyAnswers,
      inferenceAnswers,
      contextSignaturePayload,
      completionsSummaryForSignature,
    } = buildCompletionInferenceInput({
      rawAnswers: input.rawAnswers,
      completions: input.completions,
    });

    const fingerprint = hashCompletionInferenceFingerprint({
      keyAnswers,
      contextSignaturePayload,
      completionsSummaryForSignature,
    });
    const validCompletionIds = new Set(input.completions.map(completion => completion.id));

    if (fingerprint) {
      const cached = await this.inferenceCacheRepo.findByMissionAndFingerprint(
        input.missionId,
        fingerprint.hash,
      );

      if (cached && cached.source === "AI" && validCompletionIds.has(cached.missionCompletionId)) {
        return cached.missionCompletionId;
      }
    }

    const fallbackCompletionId = input.fallbackCompletionId;
    let resolvedCompletionId: string;
    let inferenceSource: "AI" | "FALLBACK";

    try {
      const inferredCompletionId = await this.inferCompletionIdWithAi({
        missionId: input.missionId,
        missionTitle: input.missionTitle,
        completions: input.completions,
        inferenceAnswers,
      });

      if (validCompletionIds.has(inferredCompletionId)) {
        resolvedCompletionId = inferredCompletionId;
        inferenceSource = "AI";
      } else {
        console.warn(
          `${AI_COMPLETION_LOG_PREFIX} fallback: invalid id "${inferredCompletionId}" for mission ${input.missionId}`,
        );
        resolvedCompletionId = fallbackCompletionId;
        inferenceSource = "FALLBACK";
      }
    } catch (error) {
      console.warn(
        `${AI_COMPLETION_LOG_PREFIX} fallback: inference failed for mission ${input.missionId}:`,
        error instanceof Error ? error.message : error,
      );
      resolvedCompletionId = fallbackCompletionId;
      inferenceSource = "FALLBACK";
    }

    if (fingerprint) {
      await this.inferenceCacheRepo.upsertByMissionAndFingerprint({
        missionId: input.missionId,
        fingerprintHash: fingerprint.hash,
        fingerprintPayload: fingerprint.normalizedPayload as unknown as Prisma.InputJsonValue,
        missionCompletionId: resolvedCompletionId,
        source: inferenceSource,
      });
    }

    return resolvedCompletionId;
  }

  private async inferCompletionIdWithAi(input: CompletionInferenceInput): Promise<string> {
    const prompt = buildCompletionInferencePrompt(input);
    const aiResult = await this.aiClient.generateFromPrompt(prompt);
    return aiResult.result.trim();
  }

  async cleanupAbuseMeta(
    retentionDays: number = ABUSE_LOG_RETENTION_DAYS,
  ): Promise<CleanupAbuseMetaResult> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const clearedCount = await this.responseRepo.nullifyAbuseMetaOlderThan(cutoffDate);

    return {
      clearedCount,
      cutoffDate,
    };
  }

  async deleteResponse(responseId: string, actor: string | ResponseActor): Promise<void> {
    const normalizedActor = normalizeActor(actor);
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (!isResponseOwner(response, normalizedActor)) {
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
    const normalizedActor = normalizeActor(actor);
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return isResponseOwner(response, normalizedActor);
  }
}

export const missionResponseService = new MissionResponseService();
