import { trackingActionEntryRepository } from "@/server/repositories/tracking-action-entry/trackingActionEntryRepository";
import type { GetTrackingEntriesOptions, RecordActionEntryInput } from "./types";

export class TrackingActionEntryService {
  constructor(private repo = trackingActionEntryRepository) {}

  async recordActionEntry(input: RecordActionEntryInput) {
    return this.repo.create(input);
  }

  async getActionEntries(options: GetTrackingEntriesOptions) {
    const { sessionId, missionId, actionId, userId } = options;

    if (sessionId) return this.repo.findBySessionId(sessionId);
    if (missionId) return this.repo.findByMissionId(missionId);
    if (actionId) return this.repo.findByActionId(actionId);
    if (userId) return this.repo.findByUserId(userId);

    return [];
  }

  async getLatestActionEntryBySessionId(sessionId: string, actionId: string) {
    return this.repo.findLatestBySessionAndAction(sessionId, actionId);
  }

  async getLatestActionEntryByUserId(userId: string, actionId: string) {
    return this.repo.findLatestByUserAndAction(userId, actionId);
  }

  async countActionEntries(options: GetTrackingEntriesOptions) {
    return this.repo.count(options);
  }

  async linkSessionToUser(sessionId: string, userId: string) {
    return this.repo.updateUserIdBySessionId(sessionId, userId);
  }
}

export const trackingActionEntryService = new TrackingActionEntryService();
