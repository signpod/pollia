import {
  type MissionRepository,
  missionRepository,
} from "@/server/repositories/mission/missionRepository";
import {
  type SearchSyncOutboxRepository,
  searchSyncOutboxRepository,
} from "@/server/repositories/search-sync-outbox";
import { SearchSyncAction, SearchSyncEntityType, type SearchSyncOutbox } from "@prisma/client";
import {
  type MissionSearchSyncService,
  missionSearchSyncService,
} from "./missionSearchSyncService";

const RETRY_BACKOFF_MS = [30_000, 120_000, 600_000, 3_600_000] as const;
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_MAX_RETRIES = RETRY_BACKOFF_MS.length;

export interface SearchSyncWorkerResult {
  fetchedCount: number;
  claimedCount: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  retryScheduledCount: number;
  permanentFailureCount: number;
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export class SearchSyncWorkerService {
  private readonly batchSize: number;
  private readonly maxRetries: number;

  constructor(
    private outboxRepo: SearchSyncOutboxRepository = searchSyncOutboxRepository,
    private missionRepo: MissionRepository = missionRepository,
    private syncService: MissionSearchSyncService = missionSearchSyncService,
    options?: {
      batchSize?: number;
      maxRetries?: number;
    },
  ) {
    this.batchSize =
      options?.batchSize ?? toPositiveInt(process.env.SEARCH_SYNC_BATCH_SIZE, DEFAULT_BATCH_SIZE);
    this.maxRetries =
      options?.maxRetries ??
      toPositiveInt(process.env.SEARCH_SYNC_MAX_RETRIES, DEFAULT_MAX_RETRIES);
  }

  async processPending(now: Date = new Date()): Promise<SearchSyncWorkerResult> {
    const pendingEvents = await this.outboxRepo.findPending(this.batchSize, now);
    if (pendingEvents.length === 0) {
      return {
        fetchedCount: 0,
        claimedCount: 0,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        retryScheduledCount: 0,
        permanentFailureCount: 0,
      };
    }

    const claimResult = await this.outboxRepo.markProcessing(pendingEvents.map(event => event.id));
    const claimedIds = new Set(claimResult.ids);

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    let retryScheduledCount = 0;
    let permanentFailureCount = 0;

    for (const event of pendingEvents) {
      if (!claimedIds.has(event.id)) {
        skippedCount++;
        continue;
      }

      try {
        await this.processEvent(event);
        await this.outboxRepo.markDone(event.id, new Date());
        successCount++;
      } catch (error) {
        failureCount++;

        const nextRetryCount = event.retryCount + 1;
        const nextRetryAt = this.getNextRetryAt(nextRetryCount, now);
        const errorMessage = error instanceof Error ? error.message : String(error);

        await this.outboxRepo.markFailed(event.id, nextRetryCount, nextRetryAt, errorMessage);

        if (nextRetryAt) {
          retryScheduledCount++;
        } else {
          permanentFailureCount++;
        }
      }
    }

    return {
      fetchedCount: pendingEvents.length,
      claimedCount: claimResult.count,
      successCount,
      failureCount,
      skippedCount,
      retryScheduledCount,
      permanentFailureCount,
    };
  }

  private async processEvent(event: SearchSyncOutbox): Promise<void> {
    if (event.entityType !== SearchSyncEntityType.MISSION) {
      throw new Error(`지원하지 않는 엔티티 타입입니다: ${event.entityType}`);
    }

    if (event.action === SearchSyncAction.DELETE) {
      await this.syncService.deleteMission(event.entityId);
      return;
    }

    if (
      event.action === SearchSyncAction.CREATE ||
      event.action === SearchSyncAction.UPDATE ||
      event.action === SearchSyncAction.DUPLICATE
    ) {
      const mission = await this.missionRepo.findById(event.entityId);
      if (!mission) {
        throw new Error(`동기화 대상 Mission이 없습니다: ${event.entityId}`);
      }

      await this.syncService.indexMission(mission);
      return;
    }

    throw new Error(`지원하지 않는 액션입니다: ${event.action}`);
  }

  private getNextRetryAt(retryCount: number, now: Date): Date | null {
    if (retryCount > this.maxRetries) {
      return null;
    }

    const policyIndex = Math.min(retryCount - 1, RETRY_BACKOFF_MS.length - 1);
    const delay = RETRY_BACKOFF_MS[policyIndex] ?? 3_600_000;
    return new Date(now.getTime() + delay);
  }
}

export const searchSyncWorkerService = new SearchSyncWorkerService();
