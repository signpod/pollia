import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import type { TrackingActionEntryRepository } from "@/server/repositories/tracking-action-entry";
import type { TrackingActionResponseRepository } from "@/server/repositories/tracking-action-response";
import type { Action, TrackingActionEntry, TrackingActionResponse } from "@prisma/client";
import { TrackingActionService } from "./trackingActionService";

export { createMockMission } from "../testUtils";

export function createMockAction(
  id: string,
  title: string,
  order: number,
  missionId: string,
  overrides?: Partial<Action>,
): Action & { options: [] } {
  return {
    id,
    title,
    order,
    missionId,
    type: "MULTIPLE_CHOICE",
    description: null,
    imageUrl: null,
    maxSelections: null,
    isRequired: false,
    hasOther: false,
    imageFileUploadId: null,
    nextActionId: null,
    nextCompletionId: null,
    correctOptionId: null,
    score: null,
    matchMode: null,
    hint: null,
    explanation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [],
    ...overrides,
  };
}

export function createMockEntries(
  actionId: string,
  missionId: string,
  count: number,
  startIndex = 1,
): Partial<TrackingActionEntry>[] {
  return Array.from({ length: count }, (_, i) => ({
    sessionId: `session-${startIndex + i}`,
    actionId,
    missionId,
  }));
}

export function createMockResponses(
  actionId: string,
  missionId: string,
  count: number,
  startIndex = 1,
): Partial<TrackingActionResponse>[] {
  return Array.from({ length: count }, (_, i) => ({
    sessionId: `session-${startIndex + i}`,
    actionId,
    missionId,
  }));
}

export function createTrackingActionServiceTestContext() {
  const mockMissionRepo = {
    findById: jest.fn(),
    findAllPaged: jest.fn(),
    countAll: jest.fn(),
  } as unknown as jest.Mocked<MissionRepository>;

  const mockActionRepo = {
    findDetailsByMissionId: jest.fn(),
  } as unknown as jest.Mocked<ActionRepository>;

  const mockEntryRepo = {
    findByMissionId: jest.fn(),
  } as unknown as jest.Mocked<TrackingActionEntryRepository>;

  const mockResponseRepo = {
    findByMissionId: jest.fn(),
  } as unknown as jest.Mocked<TrackingActionResponseRepository>;

  const service = new TrackingActionService(
    mockMissionRepo,
    mockActionRepo,
    mockEntryRepo,
    mockResponseRepo,
  );

  return { service, mockMissionRepo, mockActionRepo, mockEntryRepo, mockResponseRepo };
}

export type TrackingActionServiceTestContext = ReturnType<
  typeof createTrackingActionServiceTestContext
>;
