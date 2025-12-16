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
    updatePassword: jest.fn(),
    duplicateMission: jest.fn(),
  } as jest.Mocked<MissionRepository>;

  const service = new MissionService(mockRepository);

  return { service, mockRepository };
}

export type MissionServiceTestContext = ReturnType<typeof createMissionServiceTestContext>;
