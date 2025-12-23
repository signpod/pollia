import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionService } from ".";

export { createMockMission } from "../testUtils";

export function createMissionServiceTestContext() {
  const mockRepository = {
    findById: jest.fn(),
    findActionIdsByMissionId: jest.fn(),
    findActionById: jest.fn(),
    findActionsByMissionId: jest.fn(),
    findByUserId: jest.fn(),
    createWithActions: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    duplicateMission: jest.fn(),
  } as jest.Mocked<MissionRepository>;

  const mockResponseRepository = {
    findById: jest.fn(),
    findByMissionAndUser: jest.fn(),
    findByMissionId: jest.fn(),
    findByUserId: jest.fn(),
    findCompletedByMissionId: jest.fn(),
    create: jest.fn(),
    updateCompletedAt: jest.fn(),
    delete: jest.fn(),
    deleteByMissionAndUser: jest.fn(),
    countByMissionId: jest.fn(),
    countCompletedByMissionId: jest.fn(),
  } as jest.Mocked<MissionResponseRepository>;

  const service = new MissionService(mockRepository, mockResponseRepository);

  return { service, mockRepository, mockResponseRepository };
}

export type MissionServiceTestContext = ReturnType<typeof createMissionServiceTestContext>;
