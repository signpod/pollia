import { trackingActionResponseRepository } from "@/server/repositories/tracking-action-response";
import type { GetTrackingResponsesOptions, RecordActionResponseInput } from "./types";

export class TrackingActionResponseService {
  constructor(private repo = trackingActionResponseRepository) {}

  async recordActionResponse(input: RecordActionResponseInput) {
    return this.repo.create(input);
  }

  async getActionResponses(options: GetTrackingResponsesOptions) {
    const { sessionId, missionId, actionId, userId } = options;

    if (sessionId) return this.repo.findBySessionId(sessionId);
    if (missionId) return this.repo.findByMissionId(missionId);
    if (actionId) return this.repo.findByActionId(actionId);
    if (userId) return this.repo.findByUserId(userId);

    return [];
  }

  async getLatestActionResponseBySessionId(sessionId: string, actionId: string) {
    return this.repo.findLatestBySessionAndAction(sessionId, actionId);
  }

  async getLatestActionResponseByUserId(userId: string, actionId: string) {
    return this.repo.findLatestByUserAndAction(userId, actionId);
  }

  async countActionResponses(options: GetTrackingResponsesOptions) {
    return this.repo.count(options);
  }

  async linkSessionToUser(sessionId: string, userId: string) {
    return this.repo.updateUserIdBySessionId(sessionId, userId);
  }
}

export const trackingActionResponseService = new TrackingActionResponseService();
