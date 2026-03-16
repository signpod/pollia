import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionService } from ".";

export { createMockAction, createMockActionWithOptions, createMockMission } from "../testUtils";

export function createMissionServiceTestContext() {
  const mockRepository = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    findAllPaged: jest.fn(),
    countAll: jest.fn(),
    createWithActions: jest.fn(),
    update: jest.fn(),
    updateLikesCount: jest.fn(),
    incrementViewCount: jest.fn(),
    incrementShareCount: jest.fn(),
    delete: jest.fn(),
    duplicateMission: jest.fn(),
  } as unknown as jest.Mocked<MissionRepository>;

  const mockResponseRepository = {
    findById: jest.fn(),
    findByMissionAndUser: jest.fn(),
    findByMissionAndGuest: jest.fn(),
    findByMissionId: jest.fn(),
    findByMissionIdPaged: jest.fn(),
    findByUserId: jest.fn(),
    findCompletedByMissionId: jest.fn(),
    create: jest.fn(),
    updateCompletedAt: jest.fn(),
    findLatestCompletedAtByActor: jest.fn(),
    updateCompletedAtWithAbuseMeta: jest.fn(),
    completeWithSelectionAndAbuseMeta: jest.fn(),
    nullifyAbuseMetaOlderThan: jest.fn(),
    delete: jest.fn(),
    deleteByMissionAndUser: jest.fn(),
    deleteByMissionAndGuest: jest.fn(),
    countByMissionId: jest.fn(),
    countByMissionIdFiltered: jest.fn(),
    countCompletedByMissionId: jest.fn(),
    countCompletedByMissionIdWithDateRange: jest.fn(),
    getAverageDurationMs: jest.fn(),
    groupByStartedAtDate: jest.fn(),
  } as jest.Mocked<MissionResponseRepository>;

  const mockActionRepository = {
    findById: jest.fn(),
    findByIdWithOptions: jest.fn(),
    findActionIdsByMissionId: jest.fn(),
    findDetailsByMissionId: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMultipleChoice: jest.fn(),
    update: jest.fn(),
    updateWithOptions: jest.fn(),
    delete: jest.fn(),
    updateManyOrders: jest.fn(),
  } as unknown as jest.Mocked<ActionRepository>;

  const service = new MissionService(mockRepository, mockResponseRepository, mockActionRepository);

  return { service, mockRepository, mockResponseRepository, mockActionRepository };
}

export type MissionServiceTestContext = ReturnType<typeof createMissionServiceTestContext>;
